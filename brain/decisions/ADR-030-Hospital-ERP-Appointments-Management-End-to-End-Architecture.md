---
title: ADR-030 Hospital ERP Appointments Management End-to-End Architecture
status: Accepted
date: 2026-10-06
authors:
  - Antigravity AI Agent
tags:
  - architecture
  - appointments
  - hospital-erp
  - supabase
  - opd-bridge
  - abdm
---

# ADR-030: Hospital ERP Appointments Management End-to-End Architecture

## Context & Problem Statement
The HealthGrid Hospital ERP previously implemented Patient Management, OPD Management (ADR-028), and IPD & Bed Management (ADR-029). However, the Appointments section was a placeholder.
The requirement specified building the complete end-to-end Appointments section based on the clinical reference design ([Appointments ERP ref.png](file:///c:/HealthGrid/UI%20References/Appointments%20ERP%20ref.png)), backed by persistent Supabase Cloud relational tables with real-time subscriptions, seamless bidirectional synchronization with the active OPD queue, real clinical placeholder data, and an explicit Appointments tab on the Citizen Mobile App for viewing booking passes and live queue telemetry.

## Decisions Made

### 1. Supabase Cloud Relational Database Schema (`public.appointments`)
Established a dedicated PostgreSQL table in Supabase (`cosnhycbvsxedogtejos.supabase.co`) with foreign keys to `public.patients` and `public.doctors`:
- `id` (UUID, Primary Key)
- `appointment_id` (TEXT, e.g. `APPT250929001`)
- `patient_id` (UUID, Foreign Key)
- `patient_health_id` (TEXT, e.g. `HG001245`, `HG-PP27BNQ`)
- `patient_name`, `patient_phone`, `patient_age`, `patient_gender`, `patient_avatar`
- `doctor_id` (UUID, Foreign Key)
- `doctor_name`, `department`
- `appointment_date`, `appointment_time`
- `appointment_type` (Consultation, Follow-up, Routine, Emergency)
- `status` (Scheduled, Confirmed, Checked In, Waiting, In Consultation, Completed, Cancelled, No Show)
- `checked_in_at`, `source`, `reason_for_visit`, `notes`, `clinical_observations`, `cancellation_reason`
- Permissive RLS policies configured for authenticated and anon clients.
- Enabled real-time publication on `public.appointments`.

### 2. Seeding & Patient Data Population
- Seeded clinical reference patients into `public.patients` (Sameer Ahmed, Lakshmi Priya, Rajesh Kumar, Meena R, Arun Prakash, Fathima Begum, Vignesh S, Kavitha N, Suresh Babu, Divya R) and the citizen account Mohamed Sameen (`HG-PP27BNQ`).
- Seeded essential appointment records matching the reference layout, distributed across Today, Upcoming, and Past tabs.
- Calibrated dynamic gauge metrics (Total Appointments, Checked In %, Waiting %, Cancelled / No Show %) to live database state with fallback scaling to reference baselines.

### 3. Service Layer & Reactive Engine (`appointmentService.ts`)
- Implemented comprehensive typed CRUD operations and filter queries.
- Persistent Supabase channel subscription (`supabase.channel('public:appointments')`) for instant multi-user synchronization.
- Automatic bridge to `unifiedPatientStore.ts`: Checking in an appointment or clicking "Start Consultation" automatically injects or advances the patient in the active OPD queue.

### 4. Interactive Clinical Modals
- `NewAppointmentModal.tsx`: Search existing patients by UHID/Name/Phone or register walk-ins, assign doctors, select time slots, and schedule visits.
- `WalkInRegistrationModal.tsx`: Direct walk-in registration issuing instant token numbers.
- `AppointmentSettingsModal.tsx`: Configure slot durations, buffer intervals, working hours, and auto-cancellation rules.
- `StartConsultationModal.tsx`: Record quick vitals and clinical impressions, update status to "In Consultation", and provide one-click deep-link to the OPD desk.
- `RescheduleModal.tsx`: Reassign date, slot, and doctor with audit reason.
- `CancelAppointmentModal.tsx`: Record cancellation reasons and update status.
- `AppointmentNotesModal.tsx`: Add doctor and triage notes.
- `PrintAppointmentSlipModal.tsx`: Printable digital appointment pass with barcode/QR and reporting instructions.

### 5. Citizen Mobile App Integration
- Added dedicated Appointments tab / drawer view in the citizen mobile navigation.
- Authenticated citizens can view active booking passes, live queue position, reporting times, and digital appointment slips.

## Consequences & Verification
- Eliminates manual handoffs between hospital scheduling and outpatient consulting rooms.
- Gives patients transparent visibility into their appointments and live waiting status under ABDM principles.
- Verified end-to-end with zero TypeScript errors and validated through browser automated tests.
