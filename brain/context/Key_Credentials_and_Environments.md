---
title: Key Test Credentials & Environment Architecture
tags:
  - context
  - credentials
  - environment
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🔑 Key Test Credentials & Environment Architecture

Back to [[00_Index]]

## Test Hospital Administrator Accounts

| Hospital Code | Facility Name | Username | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **HG-H002** | Govt Medical College & Hospital, Omandurar | `gmch_admin` | `GMCH#Hospital2026` | Hospital Admin / Medical Superintendent |
| **HG-H001** | Madras Medical College & Rajiv Gandhi GGH | `mmc_admin` | `MMC#Hospital2026` | Hospital Admin |
| **HG-H003** | Stanley Medical College & Hospital | `stanley_admin` | `Stanley#Hospital2026` | Hospital Admin |

## Test Citizen / Patient Accounts
- **Default Guest / Patient Session**: Unauthenticated public browsing for all triage and locator tools.
- **Mock Personal User**: `Mohamed` (`mohamed.patient@healthgrid.in`) with linked medical vault.

## Verification Secrets & Tokens
- **Google Search Console Token**: `ixCkAfcqTBWKJbQBgViU10-aGK94QfGPP_BxmUnEiUY` (In `frontend/index.html`).
- **Google OAuth Client**: Configured via Supabase Auth Dashboard.

## Related Notes
- [[Multi_Tenant_State_Engine]]
- [[Hospital_ERP_Dashboard]]
- [[Supabase_Auth]]
