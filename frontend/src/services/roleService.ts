/**
 * HealthGrid Role-Based Access Control (RBAC) & Dynamic Identity Service
 * Connects directly to Supabase `user_roles`, `patients`, and `doctors` tables.
 */

import { supabase } from './supabaseClient';

export type AppRole = 'CITIZEN' | 'DOCTOR' | 'HOSPITAL_STAFF' | 'SUPER_ADMIN';

export interface UserRoleRecord {
  id: string;
  userId: string;
  role: AppRole;
  userType: 'PATIENT' | 'CLINICIAN' | 'STAFF' | 'SUPERUSER';
  email?: string;
  fullName?: string;
  assignedBy?: string;
  createdAt: string;
  updatedAt: string;
}

class RoleService {
  /**
   * Fetch the assigned role for a user ID from Supabase
   */
  public async getUserRole(userId: string): Promise<AppRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user role:', error.message);
        return null;
      }

      return (data?.role as AppRole) || null;
    } catch (err) {
      console.warn('Exception in getUserRole:', err);
      return null;
    }
  }

  /**
   * Set or update a role for a user (super admin action)
   */
  public async setUserRole(
    userId: string,
    role: AppRole,
    details?: { email?: string; fullName?: string; assignedBy?: string }
  ): Promise<boolean> {
    try {
      const userTypeMap: Record<AppRole, UserRoleRecord['userType']> = {
        CITIZEN: 'PATIENT',
        DOCTOR: 'CLINICIAN',
        HOSPITAL_STAFF: 'STAFF',
        SUPER_ADMIN: 'SUPERUSER',
      };

      const { error } = await supabase.from('user_roles').upsert({
        user_id: userId,
        role,
        user_type: userTypeMap[role],
        email: details?.email,
        full_name: details?.fullName,
        assigned_by: details?.assignedBy || 'SYSTEM',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,role' });

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception in setUserRole:', err);
      return false;
    }
  }

  /**
   * Get all registered roles across the system for the Admin Portal
   */
  public async getAllUserRoles(): Promise<UserRoleRecord[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) {
        console.warn('Error fetching all user roles:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        role: row.role as AppRole,
        userType: row.user_type,
        email: row.email,
        fullName: row.full_name,
        assignedBy: row.assigned_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.warn('Exception in getAllUserRoles:', err);
      return [];
    }
  }
}

export const roleService = new RoleService();
