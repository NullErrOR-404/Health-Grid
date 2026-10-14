---
title: ADR-058 • Universal Cloud Dynamic State and Zero-Mock Eradication
date: 2026-10-15
status: accepted
tags:
  - adr
  - architecture
  - database
  - dynamic-state
  - zero-mock
  - supabase
  - hospital-erp
---

# 📋 ADR-058: Universal Cloud Dynamic State and Zero-Mock Eradication

## 🎯 Context & Problem Statement

Prior to this decision, the HealthGrid codebase contained legacy mock data arrays, seed files, and hardcoded baseline statistics:
1. Supabase PostgreSQL tables (`appointments`, `ipd_admissions`, `emergency_cases`) contained synthetic mock seed rows (186 mock appointments, 10 mock admissions, 33 mock emergencies, and occupied bed names like "Murugan Velu", "Palani Murugan", "Arumugam", etc.).
2. The frontend core services (`appointmentService.ts`, `ipdBedService.ts`, `emergencyService.ts`, `doctorOpdService.ts`, `reportsAnalyticsService.ts`, `hisService.ts`, `hospitalUserspaceService.ts`, and `clinicianDataSeed.ts`) utilized fallback static arrays (`INITIAL_BASELINE_APPOINTMENTS`, `INITIAL_DOCTORS`, `SEED_PATIENTS`, `SEED_QUEUE_ITEMS`, `GMCH_SEED`, `CITYCARE_SEED`, `INITIAL_BEDS`, `INITIAL_TOKENS`, and `generatedPatientsData.ts`).
3. These hardcoded entities caused the Hospital ERP and Clinician views to show fabricated patients in beds, fake casualty queues, and artificial revenue multipliers even when no patients had scheduled visits.
4. The user mandated complete elimination of all mock entities across the entire repository, making every module cloud-reactive, dynamic, and strictly dependent on live Supabase PostgreSQL data.

---

## 💡 Decision & Architecture

### 1. Cloud Database Sanitization (Supabase PostgreSQL)
- Purged 186 mock appointments from `public.appointments`.
- Purged 10 mock inpatient admissions from `public.ipd_admissions`.
- Purged 33 synthetic emergency casualties from `public.emergency_cases`.
- Sanitized all 26 beds in `public.ipd_beds` for Government Medical College & Hospital (`HG-H002`): reset `status = 'Available'`, `current_patient_name = null`, `current_patient_health_id = null`.
- Preserved authentic production records: 3 verified patients (`Dr. Mohamed`, `Mohamed Sameen S`, `Moneshdaran S`), 33 registered facility doctors, and 5 hospital wards.

### 2. Frontend Core Services Dynamic Refactoring
- **`appointmentService.ts`**: Removed `INITIAL_BASELINE_APPOINTMENTS`. Replaced initial cache with empty array. `calculateMetrics()` calculates metrics strictly from live appointments (returns 0 when empty). Filtered out legacy mock IDs (`HG001...`) from database reads.
- **`ipdBedService.ts`**: Eradicated static 250/198/42 metrics baseline. Computed statistics directly from active beds in `localBeds`. All 26 beds start sanitized and available.
- **`emergencyService.ts`**: Eliminated synthetic wait times and mock casualties. `getMetrics()` computes values strictly from active cases. Triage board displays clean zero-state indicator ("No active casualties in triage", "All trauma bays sterilized & ready").
- **`doctorOpdService.ts`**: Eradicated `INITIAL_DOCTORS` fallback array. Made `getConsultationRooms()` dynamic based on real registered doctors and active consultations. If no patient is in consultation with a doctor, the room displays as `Available` with no fake patient names.
- **`reportsAnalyticsService.ts`**: Replaced synthetic multipliers (`patCount * 110`, `apptCount * 5`) with direct database queries. `departmentWiseMatrix` computes footfall, admissions, and revenue directly from real live records.
- **`clinicianDataSeed.ts`**: Completely eradicated `SEED_PATIENTS`, `SEED_QUEUE_ITEMS`, `SEED_RESULTS`, `SEED_FOLLOW_UPS`, `SEED_REFERRALS`, `SEED_INBOX_ITEMS`, and `SEED_ENCOUNTERS`. Retained only authentic medical clinical templates (ICMR order sets, CDS rules, and GMCH facility metadata).
- **`clinicianWorkflowStore.ts`**: Initialized queue and active patient to empty/null. Clean welcome greeting without hardcoded names.
- **`hisService.ts`**: Sanitized `INITIAL_BEDS` to all `AVAILABLE` with zero occupant names. Eradicated `INITIAL_LABS` and `INITIAL_TOKENS`. `hydrateFromStorage()` automatically purges legacy mock tokens and mock labs.
- **`hospitalUserspaceService.ts`**: Set `GMCH_SEED`, `CITYCARE_SEED`, and `createDefaultUserspace` to clean zero-state baseline: `todayOpd: 0, ipdPatients: 0, totalBeds: 26, availableBeds: 26, occupancyPercentage: 0, labOrdersTotal: 0, todayRevenue: '₹ 0'`. Added cache-cleansing routine in `getHospitalUserspace()` to scrub legacy mock appointments and admissions on platform load.
- **`generatedPatientsData.ts`**: Eradicated 4,600 lines of static mock patient JSON (`AUTHENTIC_PATIENTS_50`, `AUTHENTIC_APPOINTMENTS_TODAY`). Retained strictly TypeScript type definitions.

### 3. ERP Dashboard Clean Zero States
- In `HospitalErpDashboard.tsx`, added clean zero-state UI when arrays are empty:
  - **Today's Appointments**: Displays calendar empty state: *"No scheduled appointments today — Appointments will appear here when scheduled by patients or triage"*.
  - **Recent Admissions**: Displays inpatient empty state: *"No inpatient admissions today — Active IPD admissions and bed allocations will display here"*.
  - **Bed Occupancy**: Renders 0% Occupied, 26 Available of 26 beds.
  - **Emergency / Casualty**: Renders 0 ER patients, 0 critical casualties.
  - **Doctors & OPD**: Renders 0 patients queued for individual doctors until patients schedule appointments.

---

## 📊 Consequences & Verifications

- **Bundle Efficiency**: Clinician Portal bundle reduced from 362 kB to 238 kB; production build compiles cleanly in 2.48s with 0 errors across 2,668 modules.
- **Data Integrity**: Zero mock accounts, zero mock appointments, zero hardcoded patient names anywhere in the codebase.
- **ABDM Compliance**: Patient queues and clinical encounters strictly represent authenticated, real-world events.
- **Browser Subagent Live Telemetry**: Verified live under Government Medical College & Hospital (`HG-H002`) with credentials `gmch_admin` / `GMCH#Hospital2026`:
  - Executive Overview: 0 OPD Visits, 0 IPD Patients, 26/26 Available Beds, ₹ 0 Revenue.
  - IPD & Bed Management: All 26 beds across General, Semi-Private, Private, ICU, and HDU wards are "Available".
  - Emergency / Casualty: 0 active casualties, all trauma bays sterilized and ready.
  - Appointments: Displays only genuine scheduled appointments from authentic registered users.
