---
title: "ADR-006: Decommission Legacy HIS & Doctor Portal in Favor of Hospital ERP"
tags:
  - decision
  - adr
  - his
  - erp
  - cleanup
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-006: Decommission Legacy HIS & Doctor Portal in Favor of Hospital ERP

Back to [[00_Index]]

## Context
The codebase previously contained a 1,279-line legacy prototype named `HospitalInformationSystem.tsx` (`frontend/src/components/his/`) linked via three prominent "Doctor Portal / Hospital HIS" CTAs in the navigation bar. This component felt unpolished/vibecoded and duplicated the core responsibilities now managed by the production-grade, multi-tenant [[Hospital_ERP_Dashboard]] (`frontend/src/components/erp/HospitalErpDashboard.tsx`).

## Decision
1. **Complete Deletion of Legacy Component**:
   - Deleted `frontend/src/components/his/HospitalInformationSystem.tsx` and cleaned up the `frontend/src/components/his/` directory.
2. **Preservation of Citizen Intake Modal**:
   - Preserved `PatientIntakeModal.tsx` and relocated it to `frontend/src/components/PatientIntakeModal.tsx`.
   - Updated consultation join callback to transition citizens directly into [[DocBot_TeleClinic]] (`'chat'`).
3. **Navbar & Navigation Cleanup**:
   - Stripped all three "Doctor Portal / Hospital HIS" buttons from `Navbar.tsx` (Desktop More menu, User profile dropdown, and Mobile drawer).
   - Removed `onNavigateHis` callbacks and unused `Building2` imports.
4. **Route Hardening & Backward Compatibility**:
   - Removed `'his'` from `AppView` type in `App.tsx`.
   - Added automatic client-side redirects for `/his` and `/doctor-portal` URLs directly into `'hospital-erp'`.
5. **Neutral Professional Flow**:
   - Kept healthcare professional post-login state neutral and clean while doctor-specific chamber UI is being designed.

## Consequences
- **Codebase Cleanliness**: Removed ~1,300 lines of dead, prototype-grade code.
- **Unified Hospital Operations**: Users access hospital management solely through the robust [[Hospital_ERP_Dashboard]] authenticated with verified facility credentials.
- **Zero Build Regressions**: Bundle size reduced; TypeScript validation passes with 0 errors.

## Related Notes
- [[Hospital_ERP_Dashboard]]
- [[Hospital_Information_System_HIS]]
- [[Multi_Tenant_State_Engine]]
