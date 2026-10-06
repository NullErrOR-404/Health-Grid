# ADR-028: Hospital ERP Patient & OPD Management End-to-End Architecture

## Status
Accepted

## Date
2026-10-06

## Context
HealthGrid's hospital administration workspace previously relied on a generic dashboard overview without dedicated, pixel-accurate operational modules for Patient Management and OPD Management as depicted in the clinical reference designs (`Patient management ERP Ref.png` and `OPD management ERP ref.png`). Furthermore, citizen personal vaults (`healthMemoryService`), doctor tele-clinics, and hospital ERP data existed in disparate silos without a unified federated HealthID bridge.

## Decisions Made

### 1. Unified Federated Patient & Hospital Store (`unifiedPatientStore.ts`)
- Created an ABDM-compliant central reactive store bridging citizen personal vaults (`healthMemoryService`), multi-profile family beneficiaries (`familyMemberService`), and hospital operational workspaces.
- Every citizen and patient is indexed by their sovereign HealthID (e.g. `HG001245` or auto-generated `HG-XXXX`).
- Entering or looking up a HealthID automatically fetches longitudinal medical records (demographics, blood group, recorded allergies, chronic conditions, past hospital visits, prescriptions, and vitals).
- Registering a walk-in patient without an existing HealthID auto-provisions an authentic sovereign HealthID accessible from both the hospital and the citizen's personal health profile.
- Vitals recorded in the hospital OPD automatically sync to the citizen's personal longitudinal health vault with timestamp and clinical facility tags.

### 2. Patient Management Module (`PatientManagementView.tsx`)
- Built pixel-accurate interface matching `Patient management ERP Ref.png`:
  - 4 Dynamic Top KPI Cards: Total Patients (1,248), Today's Visits (86), New Patients (14), Active Follow-ups (132) with percentage trends.
  - Granular Search & Filter System: Dynamic search across Name, HealthID, Phone, and Visit Reason; filter pills for All Patients, Today, New, Follow-ups, and More Filters dropdown.
  - Interactive Patient Table: Checkbox selection, initials avatars, Name, Phone, HealthID, Age/Gender, Last Visit, Next Visit, Status badges, and row action triggers.
  - Right Inspector Panel:
    - Header with Patient ID, Phone, Age, Gender, and Status.
    - Switchable Tabs: Overview, Visits, Prescriptions, Reports, Documents.
    - Today's Visit Card with `[View Visit ->]` deep-link navigating to the active OPD queue with that patient selected.
    - 2x2 Info Grid for Allergies, Blood Group, Chronic Conditions, and Insurance with inline edit modals (`EditClinicalInfoModal.tsx`).
    - Chronological Recent Visits list.
    - Bottom CTAs: `[🩺 Start Consultation]` and `[📅 Create Appointment]`.
  - Registration Modal (`AddPatientModal.tsx`): Supports instant HealthID lookup or new patient enrollment.

### 3. OPD Management Module (`OpdManagementView.tsx`)
- Built pixel-accurate interface matching `OPD management ERP ref.png`:
  - Top Action Header: `[+ New OPD Registration]` (`OpdRegistrationModal.tsx`), `[🚶 Walk-in Patient]` (`WalkInModal.tsx`), and `[📄 Today's Reports]` (`TodayReportsModal.tsx`).
  - 4 Dynamic Stat Cards: Total OPD Patients (540), Currently Waiting (live count), In Consultation (pulsing Live indicator), and Completed Today (recalculated dynamically).
  - Queue Status Tabs: Today's Queue, In Consultation, Completed with live counter tabs.
  - Filters Bar: Search input, Department dropdown, Doctor dropdown, Status dropdown, and Sort by Token No. / Wait Time.
  - Queue Table: Highlighted Token badges (01, 02...), UHID, Age/Gender, Department, Doctor, Status pills, and actions.
  - Right OPD Queue Inspector:
    - Current Visit Card: Token No, Check-in Time, live Waiting Time counter, Department, Consulting Doctor, Visit Type.
    - Quick Action Controls: `[🩺 Start Consultation]` modal, `[Update Status v]` interactive dropdown advancing queue states (Checked In -> Waiting -> In Consultation -> Completed), and mini action tray:
      - `[📈 Add Vitals]` (`AddVitalsModal.tsx`): Logs BP, Pulse, Temp, SpO2, and Blood Sugar directly to the hospital visit and citizen vault.
      - `[📝 Add Prescription]` (`AddPrescriptionModal.tsx`): Formulates generic medicines grounded in PMBJP Jan Aushadhi.
      - `[💳 Generate Bill]` (`GenerateBillModal.tsx`): Itemizes consultation fees, pharmacy, and diagnostics, updating hospital revenue.
    - Patient Alerts with `+ Add` alert trigger, Blood Group, and Chronic Conditions edit badges.

### 4. Cross-Module Real-Time Reactivity
- State modifications in Patient Management (e.g. adding a patient or editing allergies) immediately propagate to OPD Management and the main hospital KPI cards.
- Status changes in OPD Management (e.g. advancing Token 01 to "In Consultation" or "Completed") dynamically recalculate Currently Waiting, In Consultation, and Completed counters in real time.
- Vitals saved in OPD are instantly reflected in the patient's longitudinal history and personal portal.

## Consequences
- **Clinical Efficiency**: Hospital staff and physicians can manage walk-ins, triage queues, consultation notes, prescriptions, and billing in a unified, tactile interface.
- **Interoperability**: Bridges hospital operations with citizen health sovereignty under ABDM guidelines.
- **Verification**: Verified end-to-end via automated browser subagent with zero build and lint errors.
