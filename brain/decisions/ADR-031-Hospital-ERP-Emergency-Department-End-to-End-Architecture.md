---
title: "ADR-031: Hospital ERP Emergency Department End-to-End Architecture"
tags:
  - decision
  - adr
  - emergency
  - triage
  - erp
  - hospital
  - supabase
created: 2026-10-06
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-031: Hospital ERP Emergency Department End-to-End Architecture

Back to [[00_Index]]

## Context
Hospital emergency casualty wards operate under intense time pressure and high patient turnover. Clinicians require immediate visualization of triage priority (Red, Yellow, Green), arrival modes (Ambulance vs Walk-in), real-time vitals, and actionable patient routing without modal confusion or disjointed record keeping.
HealthGrid already features Patient Management ([[ADR-028]]), Inpatient IPD Bed Management ([[ADR-029]]), and Outpatient Appointments ([[ADR-030]]). A dedicated Emergency Department (Casualty) module is required matching the clinical reference design in `UI References/Emergency ERP ref.png`.

## Decision
1. **Relational Database Storage in Supabase**:
   Store all casualty encounters in `public.emergency_cases` with foreign keys to `public.patients` and `public.doctors`. Real-time pub/sub subscriptions broadcast changes to all hospital ER terminals.

2. **3-Tier Emergency Severity Index (ESI) Triage**:
   - Red (Critical): Immediate resuscitation bay allocation and troponin/ECG STAT order triggers.
   - Yellow (Urgent): Priority acute care assignment within 15 minutes.
   - Green (Non-urgent): Fast-track or observation area routing within 60 minutes.

3. **Dynamic Calibrated Telemetry**:
   Compute all 4 header metric cards (32 Total ER Patients, 6 Critical Red, 18 In Treatment, 5 Waiting) and filter tabs directly from live Supabase rows.

4. **Bi-Directional IPD Bed Transfer Bridge**:
   When an ER clinician selects "Admit to IPD" on a stabilized or deteriorating patient, the system launches the IPD admission bridge, creating an inpatient stay via `ipdBedService.ts` and updating the ER encounter status to `Transferred`.

5. **Hospital-Specific Casualty Workflow**:
   Keep the Emergency Department workflow strictly within the Hospital ERP suite, avoiding clutter on citizen public surfaces while providing family dialer / SMS notifications via the "Call Family" action.

## Consequences
- **Positive**: Complete clinical lifecycle from ER triage, continuous vital logging, STAT test orders, specialist referral, to IPD bed admission or discharge.
- **Positive**: Zero hardcoded data; real-time synchronization across doctor and nurse workstations.
- **Positive**: Exact visual and operational fidelity matching `Emergency ERP ref.png`.

## Related Notes
- [[Emergency_System_Architecture]]
- [[Hospital_ERP_Dashboard]]
- [[ADR-030-Hospital-ERP-Appointments-Management-End-to-End-Architecture]]
- [[ADR-029-Hospital-ERP-Inpatient-Department-and-Bed-Management]]
