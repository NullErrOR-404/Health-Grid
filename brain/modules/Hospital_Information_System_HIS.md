---
title: Hospital Information System (HIS / EHR) & Doctor Portal
tags:
  - module
  - his
  - ehr
  - doctor-chamber
  - opd
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🩺 Hospital Information System (HIS / EHR) & Doctor Portal

Back to [[00_Index]]

## Overview
A comprehensive clinical management portal for doctors and hospital staff, bridging digital triage with OPD chambers, electronic health records (EHR), and generic e-prescribing.

## Technical Architecture
- **Component**: `frontend/src/components/his/HospitalInformationSystem.tsx`
- **Intake Modal**: `frontend/src/components/his/PatientIntakeModal.tsx`
- **Service Engine**: `frontend/src/services/hisService.ts`
- **Route**: Accessible at `/his` or `/doctor-portal`

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
