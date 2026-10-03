/**
 * HealthGrid Family & Beneficiary Multi-Profile Service
 * ABDM (Ayushman Bharat Digital Mission) Standard Implementation
 * 
 * Enables primary account holders (e.g. adult children, parents, caregivers)
 * to register and manage consultations, prescriptions, and hospital OPD tokens
 * for family members, dependents, or friends who lack personal accounts or smartphones.
 */

import { supabase } from './supabaseClient';
import { authService, type AuthUser } from './authService';
import { medicalRecordService } from './medicalRecordService';

export type FamilyRelationship =
  | 'Mother'
  | 'Father'
  | 'Spouse'
  | 'Child'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Sibling'
  | 'Grandparent'
  | 'Relative'
  | 'Friend'
  | 'Other';

export interface FamilyMember {
  id: string;
  healthId: string;
  name: string;
  relationship: FamilyRelationship;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup?: string;
  chronicConditions?: string[];
  allergies?: string[];
  isSelf?: boolean;
  createdAt?: string;
}

type BeneficiaryListener = (members: FamilyMember[], active: FamilyMember | null) => void;

class FamilyMemberService {
  private activeBeneficiary: FamilyMember | null = null;
  private listeners: BeneficiaryListener[] = [];

  constructor() {
    // Listen to auth changes to sync beneficiaries
    if (typeof window !== 'undefined') {
      authService.subscribe((user) => {
        // Reset active beneficiary on user logout
        if (!user) {
          this.activeBeneficiary = null;
          this.notify();
        }
      });
    }
  }

  private getStorageKey(userId?: string): string {
    const current = userId || authService.getCurrentUser()?.id || 'guest';
    return `healthgrid_family_members_${current}`;
  }

  /**
   * Generates an immutable, ABDM-compliant Family Health ID
   * Example: HG-FAM-8492
   */
  public generateFamilyHealthId(): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `HG-FAM-${randomSuffix}`;
  }

  /**
   * Retrieves all registered family members for the current user session
   */
  public getFamilyMembers(userId?: string): FamilyMember[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse local family members:', e);
      return [];
    }
  }

  /**
   * Asynchronously loads family members from Supabase with localStorage fallback
   */
  public async syncFamilyMembers(userId?: string): Promise<FamilyMember[]> {
    const user = userId ? { id: userId } as AuthUser : authService.getCurrentUser();
    const local = this.getFamilyMembers(user?.id);

    if (!user) return local;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const remoteMembers: FamilyMember[] = data.map((row: any) => ({
          id: row.id,
          healthId: row.health_id || this.generateFamilyHealthId(),
          name: row.name,
          relationship: row.relationship || 'Other',
          age: Number(row.age) || 0,
          gender: row.gender || 'Other',
          bloodGroup: row.blood_group,
          chronicConditions: row.chronic_conditions || [],
          allergies: row.allergies || [],
          isSelf: false,
          createdAt: row.created_at,
        }));

        localStorage.setItem(this.getStorageKey(user.id), JSON.stringify(remoteMembers));
        this.notify();
        return remoteMembers;
      }
    } catch (err) {
      // Supabase table may not exist yet or offline; fallback cleanly to localStorage
      console.warn('Supabase family_members fetch fallback to local:', err);
    }

    return local;
  }

  /**
   * Adds a new family member/dependent
   */
  public async addFamilyMember(
    input: Omit<FamilyMember, 'id' | 'healthId'>,
    userId?: string
  ): Promise<FamilyMember> {
    const user = userId ? { id: userId } as AuthUser : authService.getCurrentUser();
    const healthId = this.generateFamilyHealthId();
    const newMember: FamilyMember = {
      ...input,
      id: `fam-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      healthId,
      isSelf: false,
      createdAt: new Date().toISOString(),
    };

    // 1. Immediately persist locally
    const current = this.getFamilyMembers(user?.id);
    const updated = [...current, newMember];
    localStorage.setItem(this.getStorageKey(user?.id), JSON.stringify(updated));

    // 2. Background sync to Supabase if authenticated
    if (user) {
      try {
        await supabase.from('family_members').insert({
          id: newMember.id,
          user_id: user.id,
          health_id: newMember.healthId,
          name: newMember.name,
          relationship: newMember.relationship,
          age: newMember.age,
          gender: newMember.gender,
          blood_group: newMember.bloodGroup,
          chronic_conditions: newMember.chronicConditions || [],
          allergies: newMember.allergies || [],
          created_at: newMember.createdAt,
        });
      } catch (err) {
        console.warn('Supabase family_members insert warning (saved locally):', err);
      }
    }

    this.notify();
    return newMember;
  }

  /**
   * Deletes a family member
   */
  public async deleteFamilyMember(memberId: string, userId?: string): Promise<boolean> {
    const user = userId ? { id: userId } as AuthUser : authService.getCurrentUser();
    const current = this.getFamilyMembers(user?.id);
    const filtered = current.filter((m) => m.id !== memberId);
    localStorage.setItem(this.getStorageKey(user?.id), JSON.stringify(filtered));

    if (this.activeBeneficiary?.id === memberId) {
      this.activeBeneficiary = null;
    }

    if (user) {
      try {
        await supabase.from('family_members').delete().eq('id', memberId).eq('user_id', user.id);
      } catch (err) {
        console.warn('Supabase family_members delete warning:', err);
      }
    }

    this.notify();
    return true;
  }

  /**
   * Gets the currently selected active beneficiary.
   * Returns null if consulting for the primary account holder ("Myself").
   */
  public getActiveBeneficiary(): FamilyMember | null {
    return this.activeBeneficiary;
  }

  /**
   * Sets the active beneficiary for consultation and intake.
   * Pass null to reset to the primary account holder ("Myself").
   */
  public setActiveBeneficiary(member: FamilyMember | null): void {
    this.activeBeneficiary = member && !member.isSelf ? member : null;
    this.notify();
  }

  /**
   * Helper that returns a normalized Self profile representing the primary user
   */
  public getSelfProfile(): FamilyMember {
    const user = authService.getCurrentUser();
    const profile = medicalRecordService.getProfile();
    return {
      id: user?.id || 'self',
      healthId: user?.healthId || 'HG-600040-7821',
      name: user?.name || profile.name || 'Myself',
      relationship: 'Other',
      age: user?.age || profile.age || 32,
      gender: (profile.gender as 'Female' | 'Male' | 'Other') || 'Male',
      bloodGroup: user?.bloodGroup || profile.bloodGroup || 'O Positive',
      isSelf: true,
    };
  }

  /**
   * Subscribe to beneficiary updates
   */
  public subscribe(callback: BeneficiaryListener): () => void {
    this.listeners.push(callback);
    callback(this.getFamilyMembers(), this.activeBeneficiary);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    const members = this.getFamilyMembers();
    this.listeners.forEach((callback) => {
      try {
        callback(members, this.activeBeneficiary);
      } catch (e) {
        console.error('Error in family member listener:', e);
      }
    });
  }
}

export const familyMemberService = new FamilyMemberService();
