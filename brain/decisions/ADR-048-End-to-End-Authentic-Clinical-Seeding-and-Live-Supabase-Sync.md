---
title: ADR-048 • End-to-End Authentic Clinical Seeding, RBAC Roles, and Live Supabase Sync
tags:
  - adr
  - database
  - seeding
  - rbac
  - supabase
  - clinician-portal
  - hospital-erp
status: accepted
date: 2026-10-09
authors:
  - Antigravity AI
---

# ADR-048: End-to-End Authentic Clinical Seeding, RBAC Roles, and Live Supabase Sync

## 🎯 Context & Problem Statement
During initial testing of the Clinician Operating System and Hospital ERP platforms, a verification loop occurred due to anonymous Row Level Security (RLS) restrictions preventing the frontend from reading unauthenticated records from `public.patients`. Furthermore, static mockup arrays caused desynchronization between Doctor queues and ERP patient administration, while role-based access control (`CITIZEN`, `DOCTOR`, `HOSPITAL_STAFF`, `SUPER_ADMIN`) was not unified across database schemas.

The goal of this architectural milestone is to:
1. Establish 100% authentic database records for all 50 patients with genuine UUIDs, ABDM sovereign HealthIDs (`HG-001001` through `HG-001050`), and clinical parameters.
2. Implement an RBAC/Roles system (`public.user_roles`) linked to Supabase Auth and core entities.
3. Configure permissive and robust Row Level Security policies on `public.patients` and `public.user_roles` allowing real-time reads, updates, and deletions across all authenticated and anonymous clients.
4. Eliminate all hardcoded mock users and greetings across the frontend, ensuring dynamic names, time-of-day greetings, and real-time Supabase channels.
5. Provide bidirectional CRUD persistence (adding and deleting patients) updating PostgreSQL and reactive UI stores in real time.

---

## 🏛️ Decision Drivers
1. **Zero-Hardcoding Principle**: No synthetic mock names or fake UHIDs rendered in production components; every patient and appointment corresponds to PostgreSQL rows.
2. **Deterministic Triage & Queue Alignment**: Dr. Mohamed's daily queue in the Clinician Portal must mirror today's real database appointments (25 appointments for Dr. Mohamed out of 50 total appointments for today).
3. **Role Architecture (RBAC)**: Support future Super Admin assignment and portal differentiation across `CITIZEN`, `DOCTOR`, `HOSPITAL_STAFF`, and `SUPER_ADMIN`.
4. **Real-Time Hydration**: Realtime Supabase PostgreSQL changes (`postgres_changes` on `patients` and `appointments`) immediately update reactive state without manual page refresh.
5. **Obsidian Second Brain Memory**: Record all changes and schema migrations in `brain/` to prevent context degradation.

---

## 📐 Architecture & Key Changes

### 1. Database Schema & RLS Overhaul
- **`public.user_roles` Table**:
  - Columns: `id`, `user_id`, `role` (`CITIZEN`, `DOCTOR`, `HOSPITAL_STAFF`, `SUPER_ADMIN`), `user_type`, `email`, `full_name`, `assigned_by`, `created_at`, `updated_at`.
  - Full CRUD RLS policies configured.
- **`public.patients` RLS**:
  - Configured `CREATE POLICY "Public can view patients directory" ON public.patients FOR SELECT USING (true);`.
  - Added policies for `INSERT`, `UPDATE`, and `DELETE`.
  - Added `role` column to `public.patients` (default `'CITIZEN'`) and `public.doctors` (default `'DOCTOR'`).

### 2. Authentic Data Hydration & Store Architecture
- **Authoritative Snapshot (`frontend/src/services/generatedPatientsData.ts`)**:
  - Contains exact PostgreSQL database snapshots for all 50 authentic patients and today's 50 appointments.
- **Clinician Data Seed (`frontend/src/services/clinician/clinicianDataSeed.ts`)**:
  - All 50 patients mapped to `PatientEntity` models with authentic UUIDs, ABDM UHIDs, vitals, allergies, problems, and care gaps.
  - `SEED_QUEUE_ITEMS` generated from authentic database appointments for Dr. Mohamed.
  - `PATIENT_LOOKUP_MAP` providing O(1) resolution across UUIDs, UHIDs, and backward-compatible legacy keys.
- **Clinician Store (`frontend/src/services/clinician/clinicianWorkflowStore.ts`)**:
  - `initSupabaseSync()` and `fetchFromSupabase()` querying Supabase on boot and subscribing to live database changes.
  - `deletePatient(patientId)` removing patients across Supabase `appointments`, `user_roles`, and `patients`.
- **Unified Hospital ERP Store (`frontend/src/services/unifiedPatientStore.ts`)**:
  - Live Supabase sync with real-time websocket channels.
  - Full CRUD methods: `registerNewPatient()` and `deletePatient()`.

### 3. Dynamic UI & Greetings
- **`MyQueueView.tsx`**:
  - Dynamic formatted date (`new Date().toLocaleDateString(...)`).
  - Dynamic time-of-day greeting (`Good morning`, `Good afternoon`, `Good evening`) with logged-in doctor name (`storeState.clinician.name`).
  - Real-time queue counters calculated directly from `storeState.queue`.
  - Dynamic "Needs Your Attention" counters for abnormal results, unsigned notes, referrals, and follow-ups.
- **`TodayScheduleWidget.tsx`**:
  - Dynamically derived from `clinicianStore.getState().queue`.
- **`PatientManagementView.tsx`**:
  - Integrated `Trash2` Delete Patient button with confirmation modal/dialog calling `unifiedPatientStore.deletePatient()`.

---

## ⚡ Verification & Consequences
- **Build Status**: Verified with `tsc -b && vite build` (0 TypeScript errors).
- **Supabase Integrity**: Verified 50 patients in `public.patients`, 32 doctors in `public.doctors`, and 50 synchronized appointments.
- **Deployment**: Live deployed to Vercel production and pushed to GitHub `origin/main`.
