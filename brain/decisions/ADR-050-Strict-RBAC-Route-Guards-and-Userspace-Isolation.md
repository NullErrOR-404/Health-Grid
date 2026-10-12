---
title: ADR-050 • Strict Role-Based Access Control (RBAC), Route Guards, and Multi-Persona Userspace Isolation
tags:
  - adr
  - security
  - rbac
  - dpdp-act-2023
  - route-guards
  - userspace-isolation
  - clinician-portal
  - hospital-erp
status: accepted
date: 2026-10-12
authors:
  - Antigravity AI
---

# ADR-050: Strict Role-Based Access Control (RBAC), Route Guards, and Multi-Persona Userspace Isolation

## 🎯 Context & Problem Statement

Prior to this architecture update, users logging into HealthGrid with personal accounts (such as Gmail OAuth / Citizen credentials) could observe and access administrative or clinical portals:
1. **Navbar Leakage**: The profile dropdown rendered a direct link to the Clinician Portal (`/clinician`) regardless of authenticated role.
2. **Missing Route Guards**: Navigating directly to restricted URLs (`/clinician`, `/doctor`, `/my-queue`, `/hospital-erp`, `/his`) allowed unauthenticated guests or unauthorized account types into clinical or ERP workspaces.
3. **Userspace Bleed**: In multi-account browsers, hospital credentials and personal session states could cross-contaminate without explicit boundary sanitization.

Under the **Digital Personal Data Protection (DPDP) Act 2023** and **Clinical Establishments Act**, sensitive Protected Health Information (PHI) and hospital administrative panels require zero-leakage userspace isolation.

---

## 🏛️ Decision Drivers

1. **Strict Userspace Isolation**: Personal Citizens, Healthcare Professionals (Doctors), and Hospital Enterprise Staff operate in mutually exclusive security perimeters.
2. **Zero DOM Leakage on 403**: When an unauthenticated visitor or unauthorized role visits a protected route, zero sensitive clinical charts, patient queues, or ERP stats must mount into the DOM.
3. **Explicit 403 Security Modal**: Provide a frosted backdrop with clear legal and clinical reasons, displaying required clearance vs. current clearance, with intuitive 1-click account switching.
4. **Defense-in-Depth Protection**:
   - Route synchronization gating (`syncRoute`).
   - View rendering guards (`App.tsx` view conditional checks).
   - Navigation bar and drawer item visibility filters.
   - Storage isolation: Logging into personal citizen accounts automatically purges hospital administrative tokens.

---

## 📐 Architecture & Implementation

### 1. Dedicated Security Shield (`AccessDeniedModal.tsx`)
- Located at `frontend/src/components/common/AccessDeniedModal.tsx`.
- Displays glassmorphic frosted shield with:
  - Required clearance role badge (`DOCTOR` vs `HOSPITAL_STAFF`).
  - Current account status pill (`Unauthenticated Guest` vs `Personal Citizen Account`).
  - DPDP Act 2023 & Clinical Establishment Act compliance explanation.
  - CTAs: "Switch / Login with Authorized Account" (triggers top-level persona picker) and "Return to Citizen Home" (resets path to `/`).

### 2. RBAC Session Management (`authService.ts`)
- Added `HospitalAuthSession` interface typed with `HospitalEntity`.
- Implemented `getHospitalSession()`, `setHospitalSession()`, `clearHospitalSession()`.
- Implemented role checkers:
  - `isDoctor(user)`: matches `'HEALTHCARE_PROFESSIONAL' | 'DOCTOR'`.
  - `isHospitalStaff(user)`: matches `'HOSPITAL_STAFF' | 'SUPER_ADMIN'`.
  - `canAccessClinicianPortal(user)`: checks doctor role clearance.
  - `canAccessHospitalErp(user)`: checks hospital enterprise session or staff role.
- **Userspace Purging**: In `saveToStorage()`, logging in as `PERSONAL` or `CITIZEN` purges any lingering `healthgrid_hospital_session`. In `logout()`, all workspaces are completely zeroed.

### 3. Route & View Guards (`App.tsx`)
- Subscribed `App.tsx` directly to `authService.subscribe()` for real-time permission evaluation.
- Guarded `syncRoute()` on both pathname and hash variations:
  - `/clinician`, `/doctor`, `/my-queue`: checks `authService.canAccessClinicianPortal()`.
  - `/hospital-erp`, `/his`: checks `authService.canAccessHospitalErp()`.
- Top-level view guard prevents rendering `<ClinicianPortalLayout>` or `<HospitalErpDashboard>` if authorization fails, returning `null` and mounting `<AccessDeniedModal>` over a frosted backdrop.

### 4. UI Hardening (`Navbar.tsx` & `LoginModal.tsx`)
- Profile dropdown only renders Clinician Portal if `isDoctor` is true.
- Profile dropdown only renders Hospital ERP if `isHospitalStaff` is true.
- "More Services" dropdown and mobile drawer conditionally render workspace buttons based on active roles.
- `LoginModal.tsx` hospital authentication persists the active `HospitalAuthSession` via `authService.setHospitalSession()`.

---

## 🔬 Verification & Outcomes

- **Automated Verification**: End-to-end browser subagent session tested direct navigation to `/clinician` and `/hospital-erp`. Both routes halted immediately with the 403 Access Restricted modal, mounting 0 patient records or hospital metrics.
- **Type Safety**: Verified clean `npm run build` with zero TypeScript or bundling errors.
- **Recording Artifact**: Recorded WebP walkthrough demonstrating instant blocking and role clearance checks.
