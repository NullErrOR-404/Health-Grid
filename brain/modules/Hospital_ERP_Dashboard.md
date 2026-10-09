---
title: Hospital ERP Dashboard & Multi-Tenant Operations
tags:
  - module
  - erp
  - multi-tenant
  - administration
created: 2026-10-02
parent: "[[00_Index]]"
---

# 📊 Hospital ERP Dashboard & Operations

Back to [[00_Index]]

## Overview

A unified enterprise resource planning (ERP) operational interface for hospital administrators and medical superintendents.

## Technical Architecture

- **Component**: `frontend/src/components/erp/HospitalErpDashboard.tsx`
- **Userspace Isolation**: Driven by [[Multi_Tenant_State_Engine]] (`healthgrid_erp_userspace_${hospitalCode}`).
- **Route**: Accessible at `/hospital-erp` or `/hospital-portal`.

## Core Features

1. **Live Bed & Census Management**:
   - Total beds, ICU occupancy, ventilator status, discharge turnover rates.
2. **Departmental Activity Streams**:
   - Casualty, Cardiology, Orthopedics, Pediatrics, Radiology metrics.
3. **Clinical Alerts & Escalations**:
   - Real-time notifications for critical lab values, Code Blue events, and low oxygen stocks.
4. **Dynamic Administrator Credentials**:
   - Auto-provisioning of credentials per hospital facility.
   - See [[ADR-003-MultiTenant-Hospital-Isolation]].

## Related Notes

- [[Multi_Tenant_State_Engine]]
- [[Hospital_Information_System_HIS]]
- [[Key_Credentials_and_Environments]]
