/**
 * HealthGrid Enterprise Zero-Trust Security Guard
 * 
 * Enforces OWASP API1:2023 (Broken Object Level Authorization) and A01:2021 (Broken Access Control)
 * boundaries across all frontend service mutations.
 * 
 * Guarantees that:
 * 1. No unauthenticated actor can mutate hospital records, appointments, doctor rosters, or beds.
 * 2. Role-based privileges (PATIENT vs HEALTHCARE_PROFESSIONAL/DOCTOR/ADMIN) are strictly validated before requests leave the client.
 * 3. Rate-limiting circuit breakers are enforced before hitting the network.
 * 4. Dispatches user-facing authentication challenges when unauthorized actions are attempted.
 */

import { authService, type AuthUser, type UserRole } from './authService';
import { rateLimiter, RATE_LIMIT_CONFIGS } from './rateLimiter';

export class SecurityAuthorizationError extends Error {
  public readonly code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'RATE_LIMITED';
  public readonly action: string;

  constructor(message: string, code: 'UNAUTHENTICATED' | 'UNAUTHORIZED' | 'RATE_LIMITED', action: string) {
    super(message);
    this.name = 'SecurityAuthorizationError';
    this.code = code;
    this.action = action;
  }
}

class SecurityGuard {
  /**
   * Enforces that the caller has an active authenticated session.
   * Optionally verifies role constraints.
   * 
   * @param actionDescription Human-readable action description (e.g., 'book appointment', 'update doctor roster')
   * @param allowedRoles Optional list of permitted roles (e.g., ['HEALTHCARE_PROFESSIONAL', 'ADMIN'])
   * @returns Active AuthUser
   * @throws SecurityAuthorizationError if unauthenticated or unauthorized
   */
  public requireAuthentication(
    actionDescription: string,
    allowedRoles?: Array<UserRole | 'DOCTOR' | 'ADMIN' | 'PARAMEDIC'>
  ): AuthUser {
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      // Broadcast auth event to prompt UI login modal
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('healthgrid:auth_required', {
            detail: { action: actionDescription },
          })
        );
      }

      throw new SecurityAuthorizationError(
        `Authentication Required: You must be logged in with a verified HealthGrid account to ${actionDescription}.`,
        'UNAUTHENTICATED',
        actionDescription
      );
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = (currentUser.role || 'PERSONAL').toUpperCase();
      const hasPermission = allowedRoles.some((role) => {
        const r = role.toUpperCase();
        if (r === 'DOCTOR' || r === 'ADMIN' || r === 'HEALTHCARE_PROFESSIONAL') {
          return userRole === 'HEALTHCARE_PROFESSIONAL';
        }
        return userRole === r;
      });

      if (!hasPermission) {
        throw new SecurityAuthorizationError(
          `Access Denied: Action "${actionDescription}" requires clinical or administrative authorization.`,
          'UNAUTHORIZED',
          actionDescription
        );
      }
    }

    return currentUser;
  }

  /**
   * Enforces client-side rate limiting circuit breaker before mutations.
   */
  public enforceRateLimit(
    actionKey: string,
    config: { maxRequests: number; windowMs: number } = RATE_LIMIT_CONFIGS.CLINICAL_MUTATION
  ): void {
    const limit = rateLimiter.checkLimit(actionKey, config.maxRequests, config.windowMs);
    if (!limit.allowed) {
      throw new SecurityAuthorizationError(
        `Security Notice: Request threshold reached for ${actionKey}. Please retry in ${limit.retryAfterSeconds} seconds.`,
        'RATE_LIMITED',
        actionKey
      );
    }
  }

  /**
   * Helper that wraps mutation execution with authentication and rate limit gates.
   */
  public async executeSecureMutation<T>(
    actionDescription: string,
    mutationFn: (user: AuthUser) => Promise<T>,
    allowedRoles?: Array<UserRole | 'DOCTOR' | 'ADMIN' | 'PARAMEDIC'>
  ): Promise<T> {
    const user = this.requireAuthentication(actionDescription, allowedRoles);
    this.enforceRateLimit(`mutation:${actionDescription.replace(/\s+/g, '_')}`);
    return await mutationFn(user);
  }
}

export const securityGuard = new SecurityGuard();
