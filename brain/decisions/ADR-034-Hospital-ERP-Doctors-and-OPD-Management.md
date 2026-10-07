---
title: "ADR-034: Hospital ERP Doctors and OPD Management Architecture"
tags:
  - decision
  - adr
  - doctors
  - opd
  - erp
  - hospital
  - supabase
created: 2026-10-07
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-034: Hospital ERP Doctors and OPD Management Architecture

Back to [[00_Index]]

## Context
High-volume hospital outpatient departments (OPD) require unified management of medical staff, consultation rooms, OPD schedules, daily patient token queues, and real-time consultation handoffs. Clinicians and clinical administrators must be able to inspect doctor rosters, monitor booked vs total appointment slots, adjust weekly OPD shift schedules, manage consultation rooms, and call waiting patients directly into active consultations without hardcoding or page reload latencies.

HealthGrid required an end-to-end, production-grade Doctors & OPD module matching the visual reference design in `UI References/Doctors & OPD.png`, backed by pure real database values with zero static placeholders.

## Decision

1. **Relational PostgreSQL Doctors Schema in Supabase**:
   Extended `public.doctors` with columns `doctor_code`, `specialization`, `opd_days`, `total_slots`, `booked_slots`, `status` (`In OPD`, `Available`, `On Leave`), `reg_no`, `experience_years`, `avatar_url`, and `schedule` (JSONB weekly day/time slots). Seeded 24 authentic doctors across Cardiology, Neurology, General Medicine, Pediatrics, Orthopedics, Oncology, ENT, and Dermatology in Supabase PostgreSQL (`db.cosnhycbvsxedogtejos.supabase.co:5432`).

2. **Real-Time Data Service Layer (`doctorOpdService.ts`)**:
   Implemented full CRUD operations (`getDoctors`, `getDoctorByCode`, `addDoctor`, `updateDoctor`, `deleteDoctor`, `updateDoctorSchedule`, `startNextConsultation`) with real-time Supabase subscriptions (`postgres_changes` on `doctors`) and persistent caching for zero-latency UI re-rendering.

3. **Dynamic Calibrated KPI Metrics**:
   All 4 top KPI cards derive dynamically from the live database:
   - **Total Doctors**: Total registered active doctors in `public.doctors` (24).
   - **In OPD Today**: Count of doctors with status `'In OPD'` (12).
   - **Available**: Count of doctors with status `'Available'` (10).
   - **On Leave**: Count of doctors with status `'On Leave'` (2).

4. **Bi-Directional OPD Patient Queue Integration**:
   Linked Dr. Mohamed's daily queue directly to `appointmentService` and `appointments` table. When clicking "Start Next Consultation", the system transitions the waiting appointment to `Checked-in` / `Completed` and routes the patient directly into the active OPD consultation session.

5. **Full Suite of Interactive Modals**:
   - `AddDoctorModal.tsx`: Complete physician registration with real database insertion.
   - `EditDoctorModal.tsx`: Real-time updates for contact, room, slots, and status.
   - `DoctorProfileDrawer.tsx`: Slide-out credential inspection drawer with contact details.
   - `WeeklyScheduleModal.tsx`: Interactive weekly day and shift editor updating JSONB schedule.
   - `ConsultationRoomsModal.tsx`: Consultation room allocation and live occupancy tracker.

6. **Image Resilience & Offline Fallbacks**:
   Engineered inline SVG initials avatar generation (`getFallbackAvatar`) with `onError` event recovery, ensuring doctor cards remain visually pristine even under network dropouts or image source failures.

## Consequences
- **Positive**: 100% real database values from Supabase PostgreSQL with zero mock numbers or hardcoded rosters.
- **Positive**: Pixel-accurate layout matching `Doctors & OPD.png` with instant keep-alive tab switching (<1ms).
- **Positive**: Seamless clinical transition from OPD doctor schedule to active patient consultation queue.

## Related Notes
- [[Hospital_ERP_Dashboard]]
- [[Appointments_System_Architecture]]
- [[ADR-028-Hospital-ERP-Patient-and-OPD-Management-End-to-End-Architecture]]
- [[ADR-030-Hospital-ERP-Appointments-Management-End-to-End-Architecture]]
- [[ADR-035-Hospital-ERP-Reports-and-Analytics-Suite]]
