---
title: "ADR-036: Enterprise Zero-Trust Cybersecurity and OWASP Hardening"
tags:
  - decision
  - adr
  - security
  - owasp
  - rls
  - cybersecurity
  - zero-trust
created: 2026-10-07
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-036: Enterprise Zero-Trust Cybersecurity and OWASP Hardening

Back to [[00_Index]]

## Context

Healthcare applications handle sensitive Protected Health Information (PHI) subject to India's Digital Personal Data Protection (DPDP) Act 2023, HIPAA, and statutory CDSCO medical regulations. A dual Red-Team (Senior Penetration Tester) and Blue-Team (Senior Breach Response Lead, 20+ years field experience) audit revealed key attack surfaces:

1. Client-side database exposure: Direct browser writes to Supabase without pre-flight authentication gates.
2. Insecure session persistence: Raw Bearer tokens stored in browser `localStorage`, susceptible to DOM-based XSS extraction.
3. IP-only rate limiting: Spoofable `X-Forwarded-For` headers allowing brute-force evasion via distributed proxies.
4. Prompt injection and Schedule H/X controlled substance requests: Susceptible to AI jailbreaks for prescription narcotics (Fentanyl, Morphine, Alprazolam).
5. Missing Row-Level Security (RLS) on clinical PostgreSQL tables.

## Decision

1. **In-Memory Secure Session Architecture (`sessionSecurityManager.ts`)**:
   - Stripped raw Bearer tokens from `localStorage`, moving active JWTs to volatile in-memory closure state (immune to disk/storage scraping).
   - Cryptographic Device Fingerprinting: Computes a deterministic SHA-256 client fingerprint (Canvas, AudioContext, Screen, Platform, User-Agent, Timezone), binding tokens to the physical device and immediately terminating sessions upon fingerprint mismatch (anti-session hijacking).
   - 15-minute sliding session timeout with automatic activity tracking and silent token refresh.

2. **Multi-Dimensional Tiered Rate Limiting & Anti-Abuse (`RateLimitingFilter.java` & `rateLimiter.ts`)**:
   - Backend: IP spoofing shield with strict IPv4/IPv6 regex validation. Authenticated requests are bound to the caller's JWT Subject/Token ID, neutralizing IP rotation evasion via proxy pools.
   - Tiered rate limits:
     - Authentication: 5 requests / 5 minutes (brute-force prevention)
     - AI/Triage: 10 requests / minute
     - State Mutations: 20 requests / minute
     - Public Reads: 60 requests / minute
   - RFC 6585 compliance: Emits `429 Too Many Requests` with `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining` headers.
   - Frontend: Token bucket algorithms with circuit breakers (tripping for 30s after 3 consecutive burst violations).

3. **Zero-Trust Authorization Barrier (`securityGuard.ts`)**:
   - Intercepts all state mutations across `doctorOpdService`, `appointmentService`, `ipdBedService`, `emergencyService`, and `api.ts`.
   - Requires verified session identity before any mutation network request is dispatched.
   - Validates Role-Based Access Control (RBAC): Patient vs `HEALTHCARE_PROFESSIONAL`, `DOCTOR`, `ADMIN`, `PARAMEDIC`.
   - Triggers user-facing authentication challenge modals if an unauthenticated user attempts mutations.

4. **Input Sanitization, Prompt Injection Defense & Drug Shield (`securitySanitizer.ts`)**:
   - Cross-Site Scripting (XSS) neutralizer stripping malicious scripts, iframes, inline event handlers (`onerror=`, `onclick=`), and `javascript:` URIs.
   - SQL injection pattern detector.
   - Prompt Injection Shield: Intercepts adversarial jailbreaks (e.g. system prompt overrides, DAN mode).
   - Statutory CDSCO Schedule H/X Controlled Substance Shield: Blocks AI prescription generation for controlled narcotics, habit-forming sedatives, and restricted opioids (Alprazolam, Diazepam, Fentanyl, Morphine, Tramadol, Ketamine).

5. **PostgreSQL Row-Level Security (RLS) on Supabase**:
   - Executed `scripts/setup_security_rls_and_policies.js` to enable RLS across `doctors`, `appointments`, `emergency_cases`, `ipd_beds`, `ipd_admissions`, `patients`, and `medicines`.
   - Public read allowed on active doctors, bed summaries, and generic medicines catalog.
   - Data mutations restricted to verified authenticated roles.
   - Patients restricted to viewing and managing only their own profile and appointments.

6. **HTTP Security Headers & Infrastructure Hardening**:
   - Tuned `vercel.json` and Spring Boot `SecurityConfig.java`:
     - `Content-Security-Policy`: Restricts script, style, font, and connect origins.
     - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (2-year HSTS).
     - `X-Frame-Options: SAMEORIGIN` / `DENY` (Anti-Clickjacking).
     - `X-Content-Type-Options: nosniff`.
     - `Referrer-Policy: strict-origin-when-cross-origin`.
     - `Cross-Origin-Opener-Policy: same-origin-allow-popups` (COOP).
     - `Cross-Origin-Resource-Policy: same-origin` (CORP).

## Consequences

- **Positive**: Platform achieves alignment with OWASP Top 10 (2021/2025), OWASP API Security Top 10 (2023), and India's DPDP Act 2023.
- **Positive**: Complete defense-in-depth across client, network, backend API, and database storage layers.
- **Positive**: Zero unauthenticated state mutations; tokens are shielded from XSS exfiltration.

## Related Notes

- [[Tech_Stack]]
- [[Data_Sovereignty_and_Security]]
- [[Hospital_ERP_Dashboard]]
- [[ADR-003-MultiTenant-Hospital-Isolation]]
- [[ADR-031-Hospital-ERP-Emergency-Department-End-to-End-Architecture]]
- [[ADR-034-Hospital-ERP-Doctors-and-OPD-Management]]
- [[ADR-035-Hospital-ERP-Reports-and-Analytics-Suite]]
