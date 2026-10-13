# ADR-054: Comprehensive RBAC Persona Gating, Zero-Trace Data Isolation, and Frontend Abstraction Architecture

## Status
**ACCEPTED** - Implemented, Built (`npm run build` PASS, 0 errors across 2,667 modules), Verified in Real Browser via Subagent & WebP Session Recording.

## Context & Motivation
HealthGrid serves as a mission-critical public healthcare platform integrating disparate personas:
1. **Citizens / Patients**: Seeking medical advice, booking appointments, viewing their personal health records, managing medication cabinets, and using vernacular voice/text triage.
2. **Clinicians / Doctors**: Operating high-stakes clinical workspaces (`/clinician`), reviewing waiting queues, executing 10-stage encounter workflows, reviewing multi-doctor polypharmacy alerts, signing SOAP notes, and issuing orders.
3. **Hospital Staff / Administrators**: Managing enterprise ERP functions (`/hospital-erp`), OPD/IPD beds, roster operations, and audit logs.
4. **Unauthenticated Guests**: Public landing page, basic service discovery, and login/registration flows.

A comprehensive architectural audit revealed critical security and isolation hazards:
- **Mock Fallback Contamination**: `authService.getUser()` and `getCurrentUser()` contained legacy fallbacks returning a hardcoded patient entity (`usr-patient-1245`, `Sameer Ahmed`) when no session was active. This masked unauthenticated states, causing guests to be treated as logged-in patients and exposing patient-specific UI states.
- **Hardcoded Identity Fallbacks in Navigation**: `Navbar.tsx` contained hardcoded email and profile defaults (`dr.mohamed@healthgrid.in`, `Mohamed Sameen`), which created false identity illusions in user-facing menus.
- **Cross-Persona DOM & Action Leakage**: Non-doctor personas (citizens) inspecting clinical artifacts (such as generated SOAP notes in `ClinicalCanvas`) were exposed to clinician-only actions like `Sign & Lock 🔒` and inline clinical edit fields.
- **Shared Storage Collisions**: Clinician encounter queues and patient cabinets risked cross-session bleed if stored under static local storage keys without authenticated user scoping.
- **Statutory Compliance Mandates**: Under India's **Digital Personal Data Protection (DPDP) Act 2023** and the **Clinical Establishments Act**, Protected Health Information (PHI) and clinical diagnostic workspaces must have zero DOM leakage, zero cross-tenant contamination, and strict role-based access enforcement.

## Decision & Architectural Scope

### 1. Pure Authentication State & Elimination of Mock Fallbacks (`authService.ts`)
- **Null Safety**: Removed all fallback mock patient objects in `getUser()` and `getCurrentUser()`. When unauthenticated, both methods strictly return `this.currentUser` (which is `null`), restoring pure unauthenticated state detection across the entire app.
- **Role Invariant on Public Registration**: Enforced statutory gating in `register()`. Public self-registration is strictly clamped to `role: 'CITIZEN'`. Elevation to `DOCTOR` requires formal State Medical Council verification (TMC/NMC registration number) or pre-authorized hospital credentialing.
- **Session Purge & Storage Hygiene (`clearClinicianCaches`)**: Implemented exhaustive storage sanitization upon logout or role transitions:
  - Purges `healthgrid_clinician_store_*` across all cached user scopes.
  - Purges `healthgrid_erp_userspace_*` hospital session tokens.
  - Purges patient-specific medication cabinets and emergency access tokens.

### 2. Zero-DOM 403 Security Interceptor Shield (`ProtectedRoute.tsx`, `AccessDeniedModal.tsx`)
- All privileged routes (`/clinician`, `/hospital-erp`) are wrapped with role-enforced boundaries (`allowedRoles={['DOCTOR']}` and `allowedRoles={['HOSPITAL_STAFF', 'ADMIN']}`).
- When an unauthorized persona or unauthenticated guest navigates to a protected route:
  1. The underlying clinical or ERP DOM components are **never mounted** (Zero-DOM security model).
  2. The `AccessDeniedModal` security interceptor is triggered immediately.
  3. Displays statutory DPDP Act clearance requirements (Required Clearance vs Active Role).
  4. Offers two safe escape paths: 1-tap "Switch / Login with Authorized Account" or "Return to Citizen Home".

### 3. Dynamic Navigation Filtering & Identity Sanitization (`Navbar.tsx`)
- **Strict Persona Navigation**: Clinician and Hospital ERP links are completely removed from both desktop navigation bars and the "More" dropdown for Citizens and unauthenticated visitors.
- **Sanitized Profile Menu**: Eliminated hardcoded strings. Navigation labels display real authenticated names, phone numbers, or dynamic Health IDs (`generateImmutableHealthId()`). Unauthenticated visitors see clean "Sign In / Register" CTA buttons.

### 4. Persona-Segmented Clinical Canvas & SOAP Note Locking (`SoapNoteArtifact.tsx`)
- Integrated `authService.isDoctor()` checks into the clinical artifact renderer.
- **Clinicians**: Retain the complete clinical authoring suite, including SOAP section inline editing and the `Sign & Lock 🔒` digital signature generator.
- **Citizens**: Receive a sanitized, patient-friendly consultation summary with a clean `Physician Signature Pending` badge. Clinical signing and direct SOAP note alteration tools are completely excluded from citizen render trees.

### 5. Multi-User Storage Scoping (`clinicianWorkflowStore.ts`, `medicationSafetyService.ts`)
- **Clinician Store**: Dynamically keyed per authenticated user (`healthgrid_clinician_store_${user?.id || 'v1'}`). Initial state loading and persistence are strictly conditioned on `authService.isDoctor()`. Citizens and guests are prevented from loading or overwriting clinician workflow caches.
- **Medication Cabinet**: Dynamically keyed by authenticated patient ID (`patientId || authService.getCurrentUser()?.id || 'guest_citizen'`), preventing cross-patient medication cabinet collisions in multi-user browser environments.

### 6. Zero Sloppiness & Zero AI Hidden Text
- All front-end UI strings were audited. No dev watermarks, placeholder disclaimers, or mock identifiers remain.
- Typography complies with clean system stacks, WCAG AA contrast standards, 8-point spatial rhythm, and minimum 44x44px touch targets.

## Verification & Browser Evidence

### 1. TypeScript & Vite Production Compilation
Executed in `C:\HealthGrid\frontend`:
```bash
npm run build
```
- **Result**: Passed with **0 errors** in 2.58 seconds across all 2,667 modules.
- Dist build created cleanly with complete asset chunking and zero type discrepancies.

### 2. End-to-End Browser Subagent Verification
Conducted an autonomous multi-step browser verification session:
1. **Clinician Route Interception**: Attempted direct URL navigation to `http://127.0.0.1:5173/clinician` as an unauthenticated/citizen visitor.
   - Result: Intercepted immediately by the 403 Security Interceptor Shield. Clinician queue, patient triage, and encounter workspace DOM trees were never mounted.
   - Evidence Artifact: `clinician_403_modal_1791908851537.png`.
2. **Hospital ERP Route Interception**: Attempted direct URL navigation to `http://127.0.0.1:5173/hospital-erp`.
   - Result: Intercepted immediately by the 403 Security Interceptor Shield. Hospital beds and administrative tools remained completely shielded.
   - Evidence Artifact: `hospital_erp_403_modal_1791908880000.png`.
3. **Citizen Navigation Verification**: Returned to Citizen Home (`http://127.0.0.1:5173/`).
   - Result: Clean citizen navigation verified. Neither Clinician Portal nor Hospital ERP links appear in the navigation bar or dropdowns.
   - Evidence Artifact: `citizen_home_navbar_1791908900802.png`.
4. **Medication Cabinet Data Isolation**: Navigated to `http://127.0.0.1:5173/cabinet`.
   - Result: Correctly displayed `Patient: Citizen Patient` with dynamic state, completely free of hardcoded mock patient profiles.
   - Evidence Artifact: `cabinet_sanitized_screen_1791908946398.png`.
5. **Session Video Recording**: Complete browser walkthrough captured in WebP artifact `rbac_isolation_verify_1791908835221.webp`.

## Related Links
- [[00_Index]]
- [[Active_Context]]
- [[ADR-047-HealthGrid-Clinician-Operating-System-and-Clinical-Workflow-Architecture]]
- [[ADR-049-10-Stage-Clinical-Encounter-Workspace-Persistence-and-Digital-Signature]]
- [[ADR-050-Strict-RBAC-Route-Guards-and-Userspace-Isolation]]
- [[ADR-051-Enterprise-Zero-Trust-Cybersecurity-Hardening]]
- [[ADR-053-Multi-Doctor-Polypharmacy-and-Cross-Prescription-Conflict-Shield]]
