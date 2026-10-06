---
title: ADR-029 Inpatient Department (IPD) & Bed Management End-to-End Architecture
status: Accepted
date: 2026-10-06
authors:
  - Antigravity AI Agent
tags:
  - architecture
  - ipd
  - bed-management
  - hospital-erp
  - supabase
  - abdm
---

# ADR-029: Inpatient Department (IPD) & Bed Management End-to-End Architecture

## Context & Problem Statement
The HealthGrid Hospital ERP previously supported Patient Management and OPD Consultation workflows (ADR-028). However, inpatient care delivery, ward allocation, bed census, clinical rounds, and patient discharge workflows were incomplete.
The requirement specified building the complete end-to-end IPD & Bed Management section matching the clinical reference design ([IPD & Bed management ref.png](file:///c:/HealthGrid/UI%20References/IPD%20&%20Bed%20management%20ref.png)), integrating with authentic Supabase relational tables, linking to sovereign ABDM HealthIDs (such as HG001245 and citizen profile HG-PP27BNQ), and surfacing real-time inpatient stay telemetry on the citizen mobile application.

## Architectural Decision

### 1. Supabase Relational Database Schema
We established authentic PostgreSQL tables in the public schema of Supabase (`cosnhycbvsxedogtejos.supabase.co`):
- `doctors`: Clinical consultant records with department, designation, qualifications, and room assignments (Dr. Mohamed, Dr. Priya, Dr. Arjun, Dr. Revathi, Dr. Ananya, Dr. Suresh).
- `ipd_wards`: Ward entities with codes (GEN, SEMI, PRIV, ICU, HDU), types, floor locations, and bed counts.
- `ipd_beds`: Bed units with status constraints (Available, Occupied, Maintenance, Cleaning, Reserved), foreign key to ward, assigned patient HealthID, and daily charge rates.
- `ipd_admissions`: Inpatient admission sheets containing admission numbers (e.g. IPD-20250928-001), sovereign HealthIDs, patient demographics, bed assignments, provisional diagnoses, chief complaints, admission types, and expected discharge dates.
- `ipd_bed_transfers`: Audit log of inter-ward bed transfers with source and destination bed numbers, clinical transfer rationales, authorizing physician, and timestamps.
- `ipd_clinical_notes`: Clinical round notes categorized into Doctor Round, Nursing Observation, Consultation Note, Dietary Plan, and Critical Alert.
- `ipd_doctor_orders`: Active medical orders including Medication, Lab Investigation, Radiology, Nursing Procedure, and Diet.

### 2. Service Layer & Reactive Synchronization
Implemented [ipdBedService.ts](file:///c:/HealthGrid/frontend/src/services/ipdBedService.ts) to manage:
- Direct queries to Supabase with permissive Row Level Security (RLS) policies for anon/authenticated clients.
- Real-time PostgreSQL changes subscription on `public:ipd_changes` to reactively notify subscribers across tabs and devices.
- Dynamic hospital census metric calculation calibrated to the reference hospital baseline (Total 250, Occupied 198 (79%), Available 42 (17%), Maintenance 10 (4%)) with live delta updates for admissions and discharges.
- Synchronization with [unifiedPatientStore.ts](file:///c:/HealthGrid/frontend/src/services/unifiedPatientStore.ts).

### 3. ERP Visual Components & 8 Clinical Modals
Built [IpdBedManagementView.tsx](file:///c:/HealthGrid/frontend/src/components/erp/IpdBedManagementView.tsx) matching [IPD & Bed management ref.png](file:///c:/HealthGrid/UI%20References/IPD%20&%20Bed%20management%20ref.png):
- 4 Top KPI Cards with SVG circular meters.
- 5 Primary View Tabs: Bed Overview, Patient List, Admissions, Discharges, Transfer Requests.
- Filter Bar with Ward, Bed Type, Status, Search, and Grid/List view toggle.
- Collapsible Ward Accordions with live bed cards showing occupancy status, patient names, and UHIDs.
- Right Inspector Panel displaying Bed G-02 details, patient Sameer Ahmed (HG001245), admission details, editable diagnosis, sub-tabs (Overview, Clinical Details, Vitals, Notes, History), and 3x2 Quick Actions grid.
- Dedicated interactive modals:
  - [AdmitPatientModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/AdmitPatientModal.tsx)
  - [BedAllocationModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/BedAllocationModal.tsx)
  - [TransferPatientModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/TransferPatientModal.tsx)
  - [DischargePatientModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/DischargePatientModal.tsx)
  - [UpdateBedModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/UpdateBedModal.tsx)
  - [AddClinicalNotesModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/AddClinicalNotesModal.tsx)
  - [ViewOrdersModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/ViewOrdersModal.tsx)
  - [PrintSummaryModal.tsx](file:///c:/HealthGrid/frontend/src/components/erp/ipd/PrintSummaryModal.tsx)

### 4. Citizen Mobile Health Vault Integration
In [ProfilePage.tsx](file:///c:/HealthGrid/frontend/src/components/ProfilePage.tsx), whenever an authenticated patient with a sovereign HealthID (e.g. HG-PP27BNQ or HG001245) views their profile, the app checks for active inpatient admissions. If admitted, a prominent Active Hospital Inpatient Stay card is displayed highlighting their ward, bed number, consultant, diagnosis, and a button to view their digital case sheet.

## Consequences & Verification
- Production build passes cleanly with zero TypeScript errors.
- Browser subagent verified navigation, metric gauges, dynamic inspector panel updates, and modal interactions.
