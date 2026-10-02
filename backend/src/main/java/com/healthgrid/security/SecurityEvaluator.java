package com.healthgrid.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

/**
 * HealthGrid Red-Hat Defense: BOLA / IDOR Evaluator (OWASP API Security Top 10)
 * 
 * Provides runtime SpEL expression evaluation for method-level security:
 * e.g., @PreAuthorize("@securityEvaluator.isOwner(authentication, #userId)")
 * 
 * Prevents horizontal privilege escalation where an attacker modifies URL parameters
 * (e.g., changing /api/records/user-101 to /api/records/user-102) to exfiltrate
 * another citizen's confidential medical records.
 */
@Component("securityEvaluator")
public class SecurityEvaluator {

    /**
     * Verifies that the authenticated principal's subject identifier matches the target resource owner ID,
     * or grants bypass if the principal holds an elevated clinical/admin role.
     */
    public boolean isOwner(Authentication authentication, String targetUserId) {
        if (authentication == null || !authentication.isAuthenticated() || targetUserId == null) {
            return false;
        }

        // Administrators and on-duty doctors have lawful clinical access
        if (hasRole(authentication, "ADMIN") || hasRole(authentication, "DOCTOR") || hasRole(authentication, "HEALTHCARE_PROFESSIONAL")) {
            return true;
        }

        String principalName = authentication.getName();
        return principalName != null && principalName.equalsIgnoreCase(targetUserId);
    }

    /**
     * Verifies whether the authenticated principal has a Doctor or Healthcare Professional role.
     */
    public boolean isHealthcareProfessional(Authentication authentication) {
        return hasRole(authentication, "HEALTHCARE_PROFESSIONAL") || hasRole(authentication, "DOCTOR") || hasRole(authentication, "ADMIN");
    }

    /**
     * Verifies whether the authenticated principal is an active paramedic or clinician.
     */
    public boolean isParamedicOrDoctor(Authentication authentication) {
        return hasRole(authentication, "PARAMEDIC") || hasRole(authentication, "DOCTOR") || hasRole(authentication, "HEALTHCARE_PROFESSIONAL") || hasRole(authentication, "ADMIN");
    }

    private boolean hasRole(Authentication authentication, String roleName) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        String expectedAuthority = "ROLE_" + roleName;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (authority.getAuthority().equalsIgnoreCase(expectedAuthority) ||
                authority.getAuthority().equalsIgnoreCase(roleName)) {
                return true;
            }
        }
        return false;
    }
}
