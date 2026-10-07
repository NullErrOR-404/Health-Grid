/**
 * HealthGrid Authentication Service
 * Powered by Supabase Auth with Google OAuth, Apple ID, Email & Password,
 * with PostgreSQL Row-Level Security (RLS) guaranteeing user-space isolation.
 */

import { supabase } from './supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { medicalRecordService } from './medicalRecordService';
import { rateLimiter } from './rateLimiter';
import { sessionSecurityManager } from './sessionSecurityManager';

export type UserRole = 'PERSONAL' | 'HEALTHCARE_PROFESSIONAL';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  licenseNumber?: string;
  hospitalName?: string;
  token?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  healthId?: string;
}

export const generateImmutableHealthId = (userId?: string): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 uppercase alphanumeric chars
  if (userId && userId.trim()) {
    const clean = userId.replace(/[^a-zA-Z0-9]/g, '');
    let h1 = 0x811c9dc5;
    let h2 = 5381;
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 0x01000193);
      h2 = ((h2 << 5) + h2) ^ code;
      h2 |= 0;
    }
    let n1 = Math.abs(h1);
    let n2 = Math.abs(h2);
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars[n1 % chars.length];
      n1 = Math.floor(n1 / chars.length);
    }
    for (let i = 0; i < 3; i++) {
      result += chars[n2 % chars.length];
      n2 = Math.floor(n2 / chars.length);
    }
    return `HG-${result}`;
  }

  let randomCode = '';
  for (let i = 0; i < 7; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HG-${randomCode}`;
};

export const purgeAllTestArtifacts = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = (localStorage.getItem(key) || '').toLowerCase();
        if (
          val.includes('murugan') ||
          val.includes('8841') ||
          val.includes('pat-tn-2026')
        ) {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Storage purge error:', e);
  }
};

// Immediately purge test artifacts on module evaluation
purgeAllTestArtifacts();

const STORAGE_KEY = 'healthgrid_auth_user';

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];
  private inactivityTimer: any = null;
  private readonly INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes for public health kiosks

  constructor() {
    this.loadFromStorage();
    this.initSupabaseListener();
    this.setupInactivityTracker();
  }

  private setupInactivityTracker() {
    if (typeof window === 'undefined') return;
    const resetTimer = () => {
      if (this.currentUser) {
        if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => {
          console.warn('Session expired due to 30 minutes of inactivity. Logging out for kiosk privacy.');
          this.logout();
        }, this.INACTIVITY_LIMIT_MS);
      }
    };

    ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach((evt) => {
      window.addEventListener(evt, resetTimer, { passive: true });
    });
    resetTimer();
  }

  private loadFromStorage() {
    try {
      purgeAllTestArtifacts();
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          !parsed ||
          (typeof parsed.name === 'string' && parsed.name.toLowerCase().includes('murugan')) ||
          (typeof parsed.email === 'string' && parsed.email.toLowerCase().includes('murugan')) ||
          (typeof parsed.healthId === 'string' && parsed.healthId.includes('8841'))
        ) {
          localStorage.removeItem(STORAGE_KEY);
          this.currentUser = null;
          return;
        }
        this.currentUser = parsed;
      }
    } catch {
      this.currentUser = null;
    }
  }

  private saveToStorage(user: AuthUser | null) {
    this.currentUser = user;
    if (user) {
      // Strip raw bearer token from localStorage to prevent XSS credential theft (OWASP ASVS Level 3)
      const safeStorageUser = { ...user, token: undefined };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeStorageUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      sessionSecurityManager.terminateSession('USER_LOGOUT');
    }
    this.notifyListeners();
  }

  private async initSupabaseListener() {
    try {
      // 1. Check existing session on boot
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.syncUserFromSupabase(session.user);
      }

      // 2. Subscribe to auth state changes (OAuth redirects, sign in, sign out)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await this.syncUserFromSupabase(session.user);
        } else {
          this.saveToStorage(null);
        }
      });
    } catch (err) {
      console.warn('Supabase auth listener initialization error:', err);
    }
  }

  private async syncUserFromSupabase(sbUser: SupabaseUser) {
    try {
      // Fetch latest profile from public.patients
      const { data: profile } = await supabase
        .from('patients')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      const meta = sbUser.user_metadata || {};
      const existingHealthId = profile?.health_id;
      const isValid7to8 = (id?: string) => !!(id && /^HG-[A-Z0-9]{7,8}$/i.test(id));
      const healthId = isValid7to8(existingHealthId)
        ? existingHealthId!.toUpperCase()
        : generateImmutableHealthId(sbUser.id);

      // Persist immutable 7-8 char HealthGrid ID if missing or outdated in PostgreSQL
      if (!isValid7to8(profile?.health_id)) {
        supabase
          .from('patients')
          .upsert({
            id: sbUser.id,
            health_id: healthId,
            full_name: profile?.full_name || meta.full_name || meta.name || '',
            email: sbUser.email || meta.email || '',
            updated_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) console.warn('Could not persist immutable health_id to PostgreSQL:', error);
          });
      }

      const rawName = profile?.full_name || meta.full_name || meta.name || sbUser.email?.split('@')[0] || '';
      const sanitizedName = rawName.toLowerCase().includes('murugan')
        ? (sbUser.email && !sbUser.email.toLowerCase().includes('murugan') ? sbUser.email.split('@')[0] : 'Patient')
        : rawName;

      // If PostgreSQL had legacy test name "Murugan", scrub it in the database
      if (profile?.full_name && profile.full_name.toLowerCase().includes('murugan')) {
        supabase
          .from('patients')
          .update({ full_name: sanitizedName, updated_at: new Date().toISOString() })
          .eq('id', sbUser.id)
          .then();
      }

      const user: AuthUser = {
        id: sbUser.id,
        name: sanitizedName,
        email: sbUser.email || meta.email || '',
        phone: profile?.phone_number || meta.phone || sbUser.phone || '',
        role: (meta.role as UserRole) || 'PERSONAL',
        avatarUrl: profile?.avatar_url || meta.avatar_url || undefined,
        healthId,
        age: profile?.age ?? meta.age ?? undefined,
        bloodGroup: profile?.blood_group || meta.blood_group || undefined,
        token: sbUser.id,
      };

      this.saveToStorage(user);

      // Establish hardened in-memory session bound to physical device fingerprint
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const rawToken = sessionData?.session?.access_token || sbUser.id;
        await sessionSecurityManager.establishSession(
          rawToken,
          sbUser.id,
          user.role,
          healthId
        );
      } catch (sessErr) {
        console.warn('Could not bind in-memory session fingerprint:', sessErr);
      }
    } catch (e) {
      console.warn('Could not sync user profile from Supabase:', e);
      const meta = sbUser.user_metadata || {};
      const rawFallbackName = meta.full_name || meta.name || sbUser.email?.split('@')[0] || '';
      const sanitizedFallbackName = rawFallbackName.toLowerCase().includes('murugan')
        ? (sbUser.email && !sbUser.email.toLowerCase().includes('murugan') ? sbUser.email.split('@')[0] : 'Patient')
        : rawFallbackName;

      const fallbackUser: AuthUser = {
        id: sbUser.id,
        name: sanitizedFallbackName,
        email: sbUser.email || '',
        phone: meta.phone || sbUser.phone || '',
        role: (meta.role as UserRole) || 'PERSONAL',
        healthId: generateImmutableHealthId(sbUser.id),
        age: meta.age ?? undefined,
        bloodGroup: meta.blood_group || undefined,
        token: sbUser.id,
      };
      this.saveToStorage(fallbackUser);

      try {
        await sessionSecurityManager.establishSession(
          sbUser.id,
          sbUser.id,
          fallbackUser.role,
          fallbackUser.healthId
        );
      } catch {}
    }
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  getUser(): AuthUser | null {
    return this.currentUser;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Retrieves active, validated Bearer token with device fingerprint & sliding timeout check.
   */
  async getAccessToken(): Promise<string | null> {
    const memToken = await sessionSecurityManager.getValidAccessToken();
    if (memToken) return memToken;

    // Attempt silent refresh from Supabase session if valid
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && this.currentUser) {
      await sessionSecurityManager.establishSession(
        session.access_token,
        this.currentUser.id,
        this.currentUser.role,
        this.currentUser.healthId
      );
      return session.access_token;
    }
    return null;
  }

  /**
   * Real Supabase Google OAuth Login
   */
  async loginWithGoogle(role: UserRole = 'PERSONAL'): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
            role,
          },
        },
      });

      if (error) {
        console.error('Supabase Google OAuth error:', error);
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Google sign-in error' };
    }
  }

  /**
   * Real Supabase Apple OAuth Login
   */
  async loginWithApple(role: UserRole = 'PERSONAL'): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            role,
          },
        },
      });

      if (error) {
        console.error('Supabase Apple OAuth error:', error);
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Apple sign-in error' };
    }
  }

  /**
   * Real Supabase Email & Password Login
   */
  async loginWithCredentials(
    identifier: string,
    password: string,
    _role?: UserRole
  ): Promise<AuthUser> {
    const email = identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@healthgrid.in`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from authentication.');
    }

    await this.syncUserFromSupabase(data.user);
    return this.currentUser!;
  }

  /**
   * Real Supabase User Registration
   */
  async register(data: {
    fullName: string;
    identifier: string;
    password: string;
    role: UserRole;
    dob?: string;
    age?: number;
    bloodGroup?: string;
  }): Promise<AuthUser> {
    const email = data.identifier.includes('@')
      ? data.identifier.trim()
      : `${data.identifier.trim()}@healthgrid.in`;

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
          dob: data.dob,
          age: data.age,
          blood_group: data.bloodGroup,
          phone: !data.identifier.includes('@') ? data.identifier : undefined,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed, please check your information.');
    }

    // If email confirmation is disabled or session exists immediately
    if (authData.session) {
      await this.syncUserFromSupabase(authData.user);
      return this.currentUser!;
    }

    // If confirmation email is required
    const tempUser: AuthUser = {
      id: authData.user.id,
      name: data.fullName,
      email,
      role: data.role,
      dob: data.dob,
      age: data.age,
      bloodGroup: data.bloodGroup,
      healthId: generateImmutableHealthId(authData.user.id),
    };
    this.saveToStorage(tempUser);
    return tempUser;
  }

  /**
   * Sign out with Zero-Trace Kiosk Clean Slate
   * Purges all in-memory patient data, active medical records, and session tokens
   */
  async logout(): Promise<void> {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    this.saveToStorage(null);
    medicalRecordService.reset();
    rateLimiter.reset();
    try {
      sessionStorage.clear();
      localStorage.removeItem('healthgrid_chat_sessions');
      localStorage.removeItem('healthgrid_ai_usage');
    } catch {}
  }
}

export const authService = new AuthService();
