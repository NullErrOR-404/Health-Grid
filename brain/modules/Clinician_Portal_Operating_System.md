---
title: Clinician Portal Operating System & Workstation
tags:
  - module
  - clinician
  - ehr
  - emr
  - queue
  - encounter
  - chart
  - cds
  - ai-assistant
created: 2026-10-08
parent: "[[00_Index]]"
---

# 🩺 Clinician Portal Operating System & Clinical Workstation

Back to [[00_Index]]

## Overview

The **HealthGrid Clinician Portal** is an enterprise-grade clinician operating system designed for attending physicians, specialists, and clinical care teams. Built with the workflow depth of modern EHR platforms (Epic Hyperspace, Oracle Health/Cerner, athenaOne, MEDITECH Expanse) and delivered with a minimal, modern, calm interface matching the visual reference (`UI References/My queue Reference.png`).

The system strictly enforces the **Clinician Workstation** boundary—focusing solely on patient care, queues, longitudinal records, clinical documentation, order sets, results acknowledgement, and clinical decision support—while delegating hospital administrative, blood bank, and back-office billing operations to the [[Hospital_ERP_Dashboard]].

---

## 🏛️ Technical Architecture

### 1. File Structure & Core Components

- **Orchestrator**: `frontend/src/components/clinician/ClinicianPortalLayout.tsx`
- **Global Navigation**: `ClinicianSidebar.tsx` (collapsible pinned sidebar) and `ClinicianTopBar.tsx` (global search `Ctrl+K`, facility selector, notifications popover, clinician profile)
- **Embedded AI Assistant**: `ClinicianAiDrawer.tsx` (voice-enabled clinical co-pilot, ambient scribe prompts, differential generator, DDx, and drug interaction analyzer)
- **Workspaces**:
  - `queue/MyQueueView.tsx`: Daily greeting, 4-card KPI box ("Needs Your Attention ->"), queue list with status tabs, "What to Know Today" pre-visit brief card, and 3-card bottom deck (Today's Schedule, Follow-ups Due, Recent Results to Review)
  - `encounter/ClinicalEncounterWorkspace.tsx`: 10-stage clinical encounter workspace (Overview, History/HPI, Examination, Assessment, Plan & CDS, Orders, Rx/Med Rec, Referral, Follow-up, SOAP Sign & Close 🔒)
  - `chart/PatientChartWorkspace.tsx`: 16-tab longitudinal chart (Overview, Timeline, Encounters, Problems, Medications, Allergies, Results, Orders, Referrals, Documents, Vitals, Histories, Care Team, Care Gaps)
  - `consultations/ConsultationsLandingView.tsx`: Lifecycle index of outpatient consultations
  - `appointments/ClinicianAppointmentsView.tsx`: Clinic schedule, appointment booking, and check-in to queue
  - `patients/PatientsDirectoryView.tsx`: Longitudinal patient directory and registry
  - `followups/FollowUpsWorkspaceView.tsx`: Clinical follow-ups & callback management
  - `referrals/ReferralsWorkspaceView.tsx`: Inbound and outbound specialist referrals
  - `inbox/ClinicalInboxView.tsx`: Multi-category clinical task and results inbox
  - `communication/ClinicianMessagesView.tsx`: Secure clinical messaging with "Add to Patient Record" functionality
  - `tools/ClinicalToolsViews.tsx`: Specialty templates, order sets, clinical guidelines (ADA, AHA, ICMR), bedside BMI calculator, settings, and help

### 2. State & Data Layer

- **Domain Types**: `frontend/src/types/clinician.ts` (`ClinicianProfile`, `FacilityEntity`, `PatientEntity`, `PatientQueueItem`, `ClinicalEncounter`, `OrderItem`, `ResultItem`, `ReferralItem`, `FollowUpItem`, `ClinicalInboxItem`, `ClinicalDecisionAlert`, `OrderSetTemplate`)
- **Reactive Workflow Store**: `frontend/src/services/clinician/clinicianWorkflowStore.ts` with Pub/Sub subscriptions, persistent `localStorage` cache, queue state machine, and consultation mutations
- **Clinical Decision Support**: `frontend/src/services/clinician/cdsRulesEngine.ts` evaluating drug allergies, drug-drug interactions (e.g. ACEi + MRA hyperkalemia), renal contraindications (CKD NSAID), and preventive care gaps
- **Seed Data**: `frontend/src/services/clinician/clinicianDataSeed.ts` matching visual reference cases (Priya Sharma, Arun Prakash, Meena Iyer with Critical K+ 6.2 alert, Sathish N, Ramesh Kumar, Lakshmi Devi)

---

## 🔒 Safety, Access, and Design Principles

1. **Multi-Facility Selection**: Smooth switching between affiliated clinics (e.g., *Apollo Clinic, Chennai*, *Kauvery Hospital*, *SIMS Hospital*).
2. **Keyboard Accessibility**: `Ctrl + K` global patient search shortcut, rapid status transitions.
3. **Safety & CDS Overrides**: All drug-allergy interactions and contraindications require explicit clinician override justification before order submission.
4. **Zero AI Hallucination Exposure**: Embedded AI actions require explicit clinician confirmation before mutating any encounter note or order set.
5. **Route Integration**: Available at `/clinician`, `/doctor`, `/my-queue`, and automatic routing upon `HEALTHCARE_PROFESSIONAL` persona login.

---

## 🔗 Related Notes

- [[ADR-047-HealthGrid-Clinician-Operating-System-and-Clinical-Workflow-Architecture]]
- [[Hospital_ERP_Dashboard]]
- [[ADR-028-Hospital-ERP-Patient-and-OPD-Management-End-to-End-Architecture]]
- [[ADR-006-Decommission-Legacy-HIS-Doctor-Portal]]
- [[Active_Context]]
- [[00_Index]]
