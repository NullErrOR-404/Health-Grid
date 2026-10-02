---
title: "ADR-003: Multi-Tenant Hospital State Isolation & Dynamic Credential Provisioning"
tags:
  - decision
  - adr
  - multi-tenant
  - erp
created: 2026-10-02
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-003: Multi-Tenant Hospital State Isolation & Dynamic Credential Provisioning

Back to [[00_Index]]

## Context
Each hospital facility registering on HealthGrid requires a distinct operational workspace where admissions, OPD appointments, ICU bed changes, and clinical escalations remain strictly isolated.

## Decision
1. Implemented `hospitalUserspaceService.ts` to manage isolated state partitions keyed by `healthgrid_erp_userspace_${hospitalCode}` in `localStorage`.
2. Created dynamic credential allocation upon facility creation:
   - Derives username from hospital short code (e.g. `gmch_admin`, `mmc_admin`).
   - Provisions standard seed administrator credentials for testing (e.g., `HG-H002`: `gmch_admin` / `GMCH#Hospital2026`).

## Related Notes
- [[Multi_Tenant_State_Engine]]
- [[Hospital_ERP_Dashboard]]
- [[Key_Credentials_and_Environments]]
