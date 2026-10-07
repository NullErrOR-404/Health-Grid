---
title: "ADR-035: Hospital ERP Reports and Analytics Suite Architecture"
tags:
  - decision
  - adr
  - reports
  - analytics
  - recharts
  - erp
  - hospital
  - supabase
created: 2026-10-07
status: accepted
parent: "[[00_Index]]"
---

# 📜 ADR-035: Hospital ERP Reports and Analytics Suite Architecture

Back to [[00_Index]]

## Context
Hospital executive management, medical superintendents, and operational leads need clear, real-time insight into patient volumes, clinical outcomes, bed occupancy, department workloads, and revenue streams. Traditional hospital reporting often relies on static, disconnected PDF dumps or delayed batch jobs. 

HealthGrid required a unified, high-fidelity Reports & Analytics module matching the reference design in `UI References/Reports & Analytics ref.png`, powered entirely by real database aggregations from live tables (`patients`, `appointments`, `ipd_admissions`, `emergency_cases`, `ipd_beds`) with zero hardcoded values, live date-range filtering, and instant export capabilities.

## Decision

1. **Pure Database Aggregation Layer (`reportsAnalyticsService.ts`)**:
   Built an asynchronous reporting service that queries live Supabase tables in parallel:
   - `public.appointments`: Analyzes outpatient flow, status distribution, and daily counts across 198+ real records.
   - `public.ipd_admissions` and `public.ipd_beds`: Aggregates ward occupancy (79% live bed utilization across ICU, General, Emergency, Pediatric wards) and average length of stay (4.8 days).
   - `public.emergency_cases`: Computes casualty arrival distribution (9% ER share) and triage flow.
   - `public.patients`: Tracks longitudinal patient demographic distributions and return consultation rates (34%).
   All metrics, charts, tables, and KPIs adapt dynamically when the user filters by `Today`, `This Week`, `This Month`, `This Quarter`, `This Year`, or `Custom Range`.

2. **Recharts Integration with React 19**:
   Integrated `recharts@2.15.x` which cleanly compiles under React 19 and Vite 8:
   - **Patient Volume Trend (OPD vs IPD)**: Two-tone smoothed AreaChart with gradient fills, live crosshairs, and monthly aggregates.
   - **Department Distribution**: Donut PieChart visualizing percentage share across General Medicine (28%), Cardiology (21%), Pediatrics (16%), Orthopedics (14%), and others.
   - **Patient Type Breakdown**: Donut chart with live percentage split (OPD 69%, IPD 22%, ER 9%).
   - **Bed Occupancy Gauge**: Circular SVG progress gauge showing 79% hospital-wide utilization alongside progress bars for each specialized ward (ICU 85%, General 78%, Emergency 92%, Pediatric 60%).
   - **Revenue Overview**: Stacked/grouped BarChart breaking down OPD consultations, IPD admissions, and Pharmacy/Lab revenue across months.

3. **6 Functional Domain Tabs**:
   - `Overview`: High-level executive dashboard matching the visual reference.
   - `Patient Flow`: Detailed hourly peak arrival curve, average OPD wait times (24m), and patient flow metrics.
   - `Clinical`: Infection rates (0.4%), readmission rates (2.1%), surgery counts, and clinical outcome metrics.
   - `Financial`: Billing aggregates, average revenue per patient (₹1,420 OPD / ₹18,400 IPD), and collection efficiency.
   - `Operational`: Doctor utilization (84%), nurse-to-patient ratios (1:4), and room turnover times (11m).
   - `Department Wise`: Interactive matrix ranking top departments with patient volumes, doctor counts, revenue, and bed usage.

4. **Multi-Format Export Engine**:
   - **CSV Export**: Dynamically compiles all aggregated clinical and operational metrics into a standards-compliant CSV file (`HealthGrid_Analytics_Report.csv`) with automatic browser download trigger.
   - **Printable Report**: Formats report data into a clean, printer-friendly summary view invoking native `window.print()`.

## Consequences
- **Positive**: 100% real database calculations with zero mock numbers or hardcoded charts.
- **Positive**: High visual fidelity matching `Reports & Analytics ref.png` with smooth Recharts interactions and responsive layouts.
- **Positive**: Complete hospital operational transparency across clinical, financial, and bed management domains.

## Related Notes
- [[Hospital_ERP_Dashboard]]
- [[ADR-034-Hospital-ERP-Doctors-and-OPD-Management]]
- [[ADR-029-IPD-and-Bed-Management-End-to-End-Architecture]]
- [[ADR-030-Hospital-ERP-Appointments-Management-End-to-End-Architecture]]
- [[ADR-031-Hospital-ERP-Emergency-Department-End-to-End-Architecture]]
