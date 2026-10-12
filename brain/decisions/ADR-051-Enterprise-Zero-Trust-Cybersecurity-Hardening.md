---
title: ADR-051 • Enterprise Zero-Trust Cybersecurity Hardening, Zero Frontend Keys, RLS Hardening, and Automated Backup Verification
tags:
  - adr
  - cybersecurity
  - zero-trust
  - rls
  - owasp
  - mitre-attack
  - rate-limiting
  - mfa-2fa
  - webhooks
  - backups
status: accepted
date: 2026-10-12
authors:
  - Principal Cybersecurity Analyst & Incident Response Lead
---

# ADR-051: Enterprise Zero-Trust Cybersecurity Hardening, Zero Frontend Keys, RLS Hardening, and Automated Backup Verification

## 🎯 Context & Threat Landscape

Following an audit from Principal Cybersecurity, SOC Lead, and Threat Hunting perspectives (mapping against OWASP Top 10:2021, OWASP API Top 10:2023, and MITRE ATT&CK Enterprise Matrix):
1. **API Key Exposure Risk (CWE-798 / T1552.001)**: Multimodal AI inference keys (Groq, Google Gemini, Hugging Face) were previously referenced directly in client bundles via `import.meta.env.VITE_*`.
2. **Broken Object-Level Authorization / BOLA (OWASP API1:2023 / CWE-284)**: Database RLS policies on `patients`, `appointments`, `emergency_cases`, and `user_roles` utilized permissive `USING (true)` expressions.
3. **Unvalidated File Uploads & Polyglots (OWASP A04:2021 / CWE-434)**: Clinical prescription scans and chat attachments lacked magic-bytes validation and strict file size governors.
4. **Credential Stuffing & Privileged Account Takeover (T1110 / T1078)**: Clinician and administrative portals lacked hardware or Authenticator app multi-factor authentication (2FA).
5. **Data Resilience & Disaster Recovery (NIST SP 800-34)**: Database recovery lacked automated cryptographic snapshot verification and ephemeral test restore pipelines.

---

## 🏛️ Decision Drivers

1. **Defense-in-Depth & Zero-Trust Architecture**: Never trust browser user IDs or client-asserted roles; verify all cryptographic tokens and authorizations server-side.
2. **Server-Side AI Gateway Isolation**: Move all third-party API key consumption off the browser into dedicated Vercel Serverless Edge endpoints (`/api/ai/*`) protected by sliding-window rate limiters.
3. **PostgreSQL Security Definer Functions & Least Privilege RLS**: Strictly isolate tenant records by binding policies to `auth.uid() = auth_user_id` and verified role checks (`user_roles`).
4. **Native Authenticator App 2FA**: Support RFC 6238 TOTP (Google/Microsoft Authenticator) for Doctors, Hospital Admins, and Superusers.
5. **Verifiable Disaster Recovery**: Nightly automated cryptographic dumps with SHA-256 validation and isolated sandbox schema restore tests.

---

## 📐 Architecture & Key Changes

### 1. Server-Side Zero-Trust AI Gateways (`api/`)
- Built serverless functions running on Vercel Node runtime:
  - `api/ai/chat.ts`: Server-side mediator for Groq and Gemini clinical reasoning; rate-limited to 25 req/min per IP.
  - `api/ai/vision.ts`: Server-side mediator for Gemini Vision camera streams; rate-limited to 15 req/min per IP with base64 size limits.
  - `api/ai/ocr.ts`: Server-side prescription recognition gateway; rate-limited to 12 req/min per IP.
  - `api/webhooks/verify.ts`: Cryptographic HMAC-SHA256 timing-safe (`crypto.timingSafeEqual`) verification with a 5-minute replay drift window.
- Updated `vercel.json` rewrites to `/((?!api/).*)` ensuring all API requests hit serverless functions.
- Client services (`aiService.ts`, `prescriptionAiService.ts`, `liveVisionDoctorService.ts`) now dispatch to `/api/ai/*` as their primary gateway, keeping keys strictly on the server.

### 2. Comprehensive PostgreSQL RLS Hardening (`scripts/harden_all_db_rls_and_permissions.js`)
- Executed database migration across all public tables:
  - Added `auth_user_id UUID` to `public.patients` with foreign key mapping to `auth.users(id)`.
  - Created `is_clinician_or_staff()` and `is_admin()` PostgreSQL `SECURITY DEFINER` functions.
  - Hardened `public.patients`: Restricts `SELECT`/`UPDATE` strictly to `auth_user_id = auth.uid()` or authorized clinicians; `DELETE` restricted to `SUPER_ADMIN`.
  - Hardened `public.user_roles`: Read access restricted to `user_id = auth.uid()` or admins; mutations strictly limited to `SUPER_ADMIN`.
  - Hardened `public.appointments`, `encounters`, `prescriptions`, `clinical_orders`: Cross-patient data harvesting eliminated.
  - Hardened `public.medicines`: Public read-only; mutations restricted to administrators.

### 3. File Upload Hardening & Magic-Bytes Engine (`securitySanitizer.ts`)
- Implemented `securitySanitizer.validateFileUpload(file, 10 * 1024 * 1024)`:
  - Maximum 10MB per file; maximum 5 files batch limit.
  - Strict MIME whitelist: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
  - Header inspection of raw binary magic bytes (`FF D8 FF`, `89 50 4E 47`, `%PDF`, `RIFF...WEBP`) preventing polyglot XSS attacks or malicious executable uploads.
  - Integrated into `PrescriptionModal.tsx` and `ChatbotPage.tsx`.

### 4. Admin 2FA (TOTP) Workflow (`authService.ts` & `TwoFactorAuthModal.tsx`)
- Added `enrollTotp()`, `verifyTotp()`, and `getMfaFactors()` to `authService.ts` utilizing Supabase Auth MFA.
- Created `TwoFactorAuthModal.tsx` providing QR code provisioning for Google Authenticator/Authy and 6-digit TOTP validation.

### 5. Automated Database Backup & Restoration Testing
- Created `.github/workflows/db-backup-nightly.yml`: Scheduled 02:00 UTC workflow taking `pg_dump`, calculating SHA-256 checksums, restoring into an ephemeral container, and validating table row integrity.
- Created and executed `scripts/backup_and_test_restore.js`:
  - Verified 51 patients, 33 doctors, 254 appointments, 85 user roles, 23 medicines backed up with SHA-256 `fda22ffd0f2fac7289ae42bac93990980b9e291eabf69bea60b0fdc3f4dc761e`.
  - Created temporary schema `restore_verification_sandbox`, restored all tables, verified 100% row count match, and cleanly tore down sandbox.

---

## 🔬 Verification & Outcomes

- **Vulnerability Patching**: `npm audit fix` executed, resolving high-severity advisory on `source-map-js`. Total vulnerabilities: 0.
- **Production Build**: Clean compilation (`tsc -b && vite build` in 2.41s).
- **Database RLS Audit**: Tested against PostgreSQL; zero wide-open `USING (true)` policies remain on sensitive tables.
- **Backup Fidelity**: 100% table and record recovery verified in live sandbox test.
