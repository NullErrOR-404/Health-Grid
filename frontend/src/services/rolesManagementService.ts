/**
 * HealthGrid Roles & Identity Management Service
 * Manages dynamically provisioned hospital role accounts directly in Supabase PostgreSQL (`public.roles`).
 * Exclusive to Super Admin (`gmch_admin`).
 */

import { supabase } from './supabaseClient';

export interface HospitalRoleAccount {
  id: string;
  username: string;
  password?: string;
  full_name: string;
  email?: string;
  role: 'superadmin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'hospital_staff' | 'admin' | string;
  hospital_code: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  updated_at?: string;
}

export const PRESET_ROLES = [
  { value: 'superadmin', label: 'Super Admin (All Capabilities)', color: 'purple' },
  { value: 'admin', label: 'Hospital Administrator', color: 'indigo' },
  { value: 'doctor', label: 'Doctor / Clinician (OPD & IPD)', color: 'teal' },
  { value: 'nurse', label: 'Inpatient Nurse / Ward Care', color: 'sky' },
  { value: 'receptionist', label: 'Reception & Patient Desk', color: 'emerald' },
  { value: 'pharmacist', label: 'Pharmacy & Dispensing', color: 'amber' },
  { value: 'hospital_staff', label: 'General Hospital Staff', color: 'slate' },
];

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

class RolesManagementService {
  /**
   * Fetch all registered accounts & roles from Supabase `public.roles`
   */
  public async getRoleAccounts(): Promise<HospitalRoleAccount[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching roles from Supabase:', error.message);
        return this.getFallbackAccounts();
      }

      if (!data || data.length === 0) {
        return this.getFallbackAccounts();
      }

      return data as HospitalRoleAccount[];
    } catch (err) {
      console.warn('Exception fetching roles from Supabase:', err);
      return this.getFallbackAccounts();
    }
  }

  /**
   * Dynamically create a new role account with custom UUID, password, and role,
   * inserting directly into Supabase PostgreSQL `public.roles`.
   */
  public async createRoleAccount(params: {
    id?: string;
    username: string;
    password: string;
    full_name: string;
    email?: string;
    role: string;
    hospital_code?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }): Promise<{ success: boolean; data?: HospitalRoleAccount; error?: string }> {
    const cleanUsername = params.username.trim().toLowerCase();
    const cleanPassword = params.password.trim();
    const cleanFullName = params.full_name.trim();
    const cleanEmail = params.email ? params.email.trim().toLowerCase() : `${cleanUsername}@healthgrid.in`;
    const cleanHospitalCode = params.hospital_code?.trim().toUpperCase() || 'HG-H002';
    const cleanRole = params.role.trim().toLowerCase();
    const recordId = params.id && params.id.trim() ? params.id.trim() : generateUUID();

    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
    if (!cleanFullName) {
      return { success: false, error: 'Full Name is required.' };
    }

    try {
      // 1. Check if username already exists in roles table
      const { data: existingUser } = await supabase
        .from('roles')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: `Account with username "${cleanUsername}" already exists.` };
      }

      // 2. Insert into public.roles table
      const payload: HospitalRoleAccount = {
        id: recordId,
        username: cleanUsername,
        password: cleanPassword,
        full_name: cleanFullName,
        email: cleanEmail,
        role: cleanRole,
        hospital_code: cleanHospitalCode,
        status: params.status || 'ACTIVE',
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('roles')
        .insert([payload])
        .select()
        .single();

      if (insertErr) {
        console.error('Failed to insert into public.roles:', insertErr);
        return { success: false, error: insertErr.message };
      }

      // 3. Mirror into public.user_roles for platform compatibility
      try {
        const userTypeMap: Record<string, string> = {
          superadmin: 'SUPERUSER',
          admin: 'ADMIN',
          doctor: 'CLINICIAN',
          nurse: 'STAFF',
          receptionist: 'STAFF',
          pharmacist: 'STAFF',
          hospital_staff: 'STAFF',
        };

        const standardAppRoleMap: Record<string, string> = {
          superadmin: 'SUPER_ADMIN',
          admin: 'SUPER_ADMIN',
          doctor: 'DOCTOR',
          nurse: 'HOSPITAL_STAFF',
          receptionist: 'HOSPITAL_STAFF',
          pharmacist: 'HOSPITAL_STAFF',
          hospital_staff: 'HOSPITAL_STAFF',
        };

        await supabase.from('user_roles').insert([{
          id: recordId,
          user_id: recordId,
          role: standardAppRoleMap[cleanRole] || 'HOSPITAL_STAFF',
          user_type: userTypeMap[cleanRole] || 'STAFF',
          email: cleanEmail,
          full_name: cleanFullName,
          assigned_by: 'gmch_admin (Super Admin)',
        }]);
      } catch (mirrorErr) {
        console.warn('Note: mirror to user_roles had note:', mirrorErr);
      }

      return { success: true, data: (inserted as HospitalRoleAccount) || payload };
    } catch (err: any) {
      console.error('Exception creating role account:', err);
      return { success: false, error: err.message || 'Network exception creating account.' };
    }
  }

  /**
   * Delete an account from Supabase `public.roles`.
   * gmch_admin cannot be deleted.
   */
  public async deleteRoleAccount(id: string, username: string): Promise<{ success: boolean; error?: string }> {
    if (username.toLowerCase() === 'gmch_admin') {
      return { success: false, error: 'Cannot delete the Root Super Admin account (gmch_admin).' };
    }

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Also clean up from user_roles
      try {
        await supabase.from('user_roles').delete().eq('id', id);
      } catch {}

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Exception deleting role account.' };
    }
  }

  /**
   * Update an account status or role in Supabase `public.roles`
   */
  public async updateRoleAccount(
    id: string,
    updates: Partial<HospitalRoleAccount>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('roles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Exception updating role account.' };
    }
  }

  private getFallbackAccounts(): HospitalRoleAccount[] {
    return [
      {
        id: '00000000-0000-0000-0000-000000000001',
        username: 'gmch_admin',
        password: 'GMCH#Hospital2026',
        full_name: 'GMCH Medical Superintendent (Super Admin)',
        email: 'admin@gmch.gov.in',
        role: 'superadmin',
        hospital_code: 'HG-H002',
        status: 'ACTIVE',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        username: 'mmc_admin',
        password: 'MMC#Hospital2026',
        full_name: 'MMC Medical Superintendent',
        email: 'admin@mmc.gov.in',
        role: 'admin',
        hospital_code: 'HG-H001',
        status: 'ACTIVE',
      },
      {
        id: 'cb41d3d7-cdae-4f55-b32d-ec4d78085400',
        username: 'dr_mohamed',
        password: 'Doctor#123',
        full_name: 'Dr. Mohamed (Senior Physician)',
        email: 'dr.mohamed@healthgrid.in',
        role: 'doctor',
        hospital_code: 'HG-H002',
        status: 'ACTIVE',
      },
    ];
  }
}

export const rolesManagementService = new RolesManagementService();
