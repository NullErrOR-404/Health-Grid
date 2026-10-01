/**
 * HealthGrid Authentication Service
 * Powered by Supabase Auth with Google OAuth, Apple ID, Email & Password,
 * with PostgreSQL Row-Level Security (RLS) guaranteeing user-space isolation.
 */

import { supabase } from './supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  age?: number;
  bloodGroup?: string;
  healthId?: string;
}

export const generateImmutableHealthId = (userId?: string): string => {
  if (userId && userId.trim()) {
    return `HG-${userId.trim().toUpperCase()}`;
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `HG-${crypto.randomUUID().toUpperCase()}`;
  }
  return 'HG-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
};

const STORAGE_KEY = 'healthgrid_auth_user';

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    this.loadFromStorage();
    this.initSupabaseListener();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private saveToStorage(user: AuthUser | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
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
      const healthId = (existingHealthId && existingHealthId.length > 12)
        ? existingHealthId
        : generateImmutableHealthId(sbUser.id);

      // Persist immutable UUID HealthGrid ID if missing or outdated in PostgreSQL
      if (!profile?.health_id || profile.health_id.length <= 12) {
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

      const user: AuthUser = {
        id: sbUser.id,
        name: profile?.full_name || meta.full_name || meta.name || sbUser.email?.split('@')[0] || '',
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
    } catch (e) {
      console.warn('Could not sync user profile from Supabase:', e);
      const meta = sbUser.user_metadata || {};
      const fallbackUser: AuthUser = {
        id: sbUser.id,
        name: meta.full_name || meta.name || sbUser.email?.split('@')[0] || '',
        email: sbUser.email || '',
        phone: meta.phone || sbUser.phone || '',
        role: (meta.role as UserRole) || 'PERSONAL',
        healthId: generateImmutableHealthId(sbUser.id),
        age: meta.age ?? undefined,
        bloodGroup: meta.blood_group || undefined,
        token: sbUser.id,
      };
      this.saveToStorage(fallbackUser);
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

  isAuthenticated(): boolean {
    return this.currentUser !== null;
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
      age: data.age,
      bloodGroup: data.bloodGroup,
      healthId: generateImmutableHealthId(authData.user.id),
    };
    this.saveToStorage(tempUser);
    return tempUser;
  }

  /**
   * Sign out
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    this.saveToStorage(null);
  }
}

export const authService = new AuthService();
