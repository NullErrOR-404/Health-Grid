# ADR-047: HealthGrid Clinician Operating System & Clinical Workflow Architecture

## Status
**Accepted & Implemented**

## Context
HealthGrid encompasses three major product surfaces:
1. **PERSONAL**: Patient-facing health vault, AI triage, tele-clinic, and PMBJP generic pharmacy.
2. **PROFESSIONAL**: Clinician operating system and workstation for doctors, nurses, and clinical teams.
3. **HOSPITAL**: Hospital ERP / HIS for multi-tenant bed occupancy, billing, pharmacy inventory, and department operations.

Prior to this implementation, clinicians lacked a dedicated, longitudinal clinical workspace matching the enterprise depth of modern systems like Epic, Oracle Health, and athenaOne, while strictly retaining a clean, calm, modern, and minimal user experience without dashboard clutter or legacy complexity.

## Decision
We designed and implemented the production-grade Clinician Operating System for HealthGrid, anchored visually by the reference design language (`My queue Reference.png`) and architecturally by a 38-section enterprise clinical workflow specification:

1. **Domain Models & Type System** (`frontend/src/types/clinician.ts`):
   - Defined shared entities: `PatientEntity`, `PatientQueueItem`, `ClinicalEncounter`, `OrderItem`, `ResultItem`, `ReferralItem`, `FollowUpItem`, `ClinicalInboxItem`, `ClinicalDecisionAlert`, and `OrderSetTemplate`.
   - Preserved relational integrity: `Patient` -> `Appointment` -> `Queue` -> `Encounter` -> `Orders` -> `Results` -> `Inbox` -> `Follow-up` -> `Longitudinal Timeline`.

2. **Reactive Workflow Engine** (`frontend/src/services/clinician/clinicianWorkflowStore.ts`):
   - Single-source-of-truth reactive state engine with Pub/Sub listeners and persistent `localStorage` synchronization.
   - Clinical state machines:
     - Appointment & Queue: `BOOKED` -> `CONFIRMED` -> `CHECKED_IN` -> `WAITING` -> `IN_CONSULTATION` -> `COMPLETED`.
     - Order Lifecycle: `DRAFT` -> `SIGNED` -> `SUBMITTED` -> `IN_PROCESS` -> `RESULTED` -> `REVIEWED` -> `CLOSED`.
     - Result Lifecycle: `NEW` -> `NEEDS_REVIEW` -> `REVIEWED` -> `ACTION_REQUIRED` -> `PATIENT_NOTIFIED` -> `CLOSED`.
     - Referral Lifecycle: `CREATED` -> `SENT` -> `ACCEPTED` -> `SPECIALIST_SEEN` -> `REPORT_RECEIVED` -> `CLOSED`.
   - Embedded HealthGrid AI assistant integration with prompt suggestions, history summarization, SOAP drafting, order set application, and audit-guarded confirmations.

3. **Contextual Clinical Decision Support Engine** (`frontend/src/services/clinician/cdsRulesEngine.ts`):
   - Real-time safety rules:
     - Penicillin & Beta-lactam anaphylaxis blocking.
     - Dual ACEi/ARB + Aldosterone antagonist severe hyperkalemia risk alert (e.g. Meena Iyer K+ 6.2).
     - NSAID nephrotoxicity warning in Chronic Kidney Disease / baseline creatinine > 1.5.
     - Annual diabetic retinopathy & urine microalbumin surveillance care gaps.

4. **Visual & Presentation Architecture**:
   - `ClinicianSidebar`: Pinned sections strictly for clinical work (*MY WORK*, *CLINICAL*, *COMMUNICATION*, *TOOLS*), avoiding hospital operational noise (no radiology/billing/HR in clinician sidebar).
   - `ClinicianTopBar`: Global patient search (`Ctrl + K`), multi-facility switcher (*Apollo Clinic, Chennai*), notification popover, clinician profile, and AI drawer trigger.
   - `MyQueueView`: "Good morning, Dr. Mohamed ☀️", 4-card KPI attention box, queue list with status tabs, "What to Know Today" pre-visit brief card, and 3-card bottom grid.
   - `ClinicalEncounterWorkspace`: Dedicated full workstation (not a modal) spanning 10 clinical stages (Overview, History/HPI, Examination, Assessment, Plan & CDS, Orders, Rx & Med Rec, Referral, Follow-up, and SOAP Sign & Close).
   - `PatientChartWorkspace`: 16-tab longitudinal medical chart (Overview, Timeline, Encounters, Problems, Medications, Allergies, Results, Orders, Referrals, Documents, Vitals, Histories, Care Team, Care Gaps).
   - `ClinicianAppointmentsView`: Planned clinical schedule, time slots, check-in gate, and room allocations.
   - `PatientsDirectoryView`: Longitudinal panel registry with multi-parameter search and condition filters.
   - `FollowUpsWorkspaceView`: Surveillance callbacks and re-evaluations linked to originating encounters.
   - `ReferralsWorkspaceView`: Cross-provider referral dispatches and specialist feedback loops.
   - `ClinicalInboxView`: Actionable inbox across 8 clinical categories with 1-tap sign-off.
   - `ClinicianMessagesView`: Contextual clinical communication with patient record audit integration.
   - `ClinicalToolsViews`: Configurable specialty templates, order sets, ICMR/ADA guidelines, and bedside calculators.
   - `ClinicianAiDrawer`: Embedded assistant right dock with speech equalizer, prompt chips, and voice toggle.

5. **Application Routing & Login Integration** (`App.tsx`, `LoginModal.tsx`, `Navbar.tsx`):
   - Added `'clinician-portal'` route with zero-delay lazy-loading chunk.
   - When a user logs in with `HEALTHCARE_PROFESSIONAL` role, the system immediately routes them to `'clinician-portal'`.
   - Added `/clinician`, `/doctor`, `/my-queue` direct URL route support.

## Consequences
- **Positive**: Complete clinical workflow depth matching tier-1 enterprise EHRs without visual clutter or cognitive overload.
- **Positive**: Strict data continuity across queue, encounters, orders, results, follow-ups, and longitudinal charts.
- **Positive**: Embedded HealthGrid AI assistant respects clinical safety protocols and requires explicit confirmation for consequential actions.
- **Positive**: Production bundle builds cleanly (`dist/assets/ClinicianPortalLayout-B1-gE7Rq.js` 221 kB) with 0 TypeScript errors.

## Related Documentation
- [[00_Index]]
- [[Active_Context]]
- [[ADR-028-Hospital-ERP-Patient-and-OPD-Management-End-to-End-Architecture]]
- [[ADR-046-Comprehensive-Engineering-Documentation-Suite-PRD-TRD-UIUX-Schema-Flow-Plan]]
