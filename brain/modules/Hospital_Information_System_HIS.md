---
title: Hospital Information System (HIS / EHR) & Doctor Portal (Deprecated)
tags:
  - module
  - his
  - deprecated
created: 2026-10-02
status: deprecated
parent: "[[00_Index]]"
---

# 🩺 Hospital Information System (HIS / EHR) & Doctor Portal (Decommissioned)

Back to [[00_Index]]

> [!warning] Architecture Decommissioning Notice
> This legacy prototype page (`HospitalInformationSystem.tsx`) and its navigation CTAs have been completely removed from the HealthGrid application.
> All hospital operations, patient registrations, IPD/OPD management, and bed telemetry are now centrally consolidated in the production-grade **[[Hospital_ERP_Dashboard]]** accessed via Hospital Admin authentication.
> The citizen OPD screening intake modal has been preserved and relocated to `frontend/src/components/PatientIntakeModal.tsx`.

## Historical Architecture (Removed)
- **Component**: `frontend/src/components/his/HospitalInformationSystem.tsx` (Deleted)
- **Current Replacement**: [[Hospital_ERP_Dashboard]] (`frontend/src/components/erp/HospitalErpDashboard.tsx`)
- **Intake Modal**: `frontend/src/components/PatientIntakeModal.tsx`

## Core Subsystems
1. **OPD Token Queue**:
   - Digital queue management sorting patients by triage severity score (Emergency, Urgent, Routine).
2. **Clinical Chamber (SOAP Notes)**:
   - Subjective, Objective, Assessment, and Plan documentation.
   - Speech-to-text dictation integration.
3. **Generic Drug Prescriber**:
   - Integrated with [[Generic_Medicines_PMBJP]] to automatically output Jan Aushadhi generic equivalents on prescription slips.
4. **Diagnostic Lab Order Hub**:
   - CBC, Lipid profiles, HbA1c, and radiological imaging requisitions.

## Related Notes
- [[Hospital_ERP_Dashboard]]
- [[Multi_Tenant_State_Engine]]
- [[Generic_Medicines_PMBJP]]
