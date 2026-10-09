---
title: Emergency 108 Ambulance Dispatch & Telemetry
tags:
  - module
  - emergency
  - ambulance
  - 108
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🚑 Emergency 108 Ambulance Dispatch & Telemetry

Back to [[00_Index]]

## Overview

HealthGrid integrates with Tamil Nadu's 108 Emergency Ambulance Network to enable one-touch GPS-guided emergency dispatch, live in-transit telemetry tracking, and digital doctor handover.

## Components & Implementation

- **Modal Component**: `frontend/src/components/AmbulanceModal.tsx`
- **Telemetry Monitor**: `frontend/src/components/VitalsTelemetryModal.tsx`
- **Handover Protocol**: `frontend/src/components/DoctorHandoverModal.tsx`
- **One-Touch Emergency Link**: Direct `tel:108` and `tel:104` fallback links in navigation bars.

## In-Transit Telemetry Workflow

1. Patient or bystander triggers SOS button.
2. System captures browser geolocation and dispatches nearest ambulance unit.
3. Paramedy/driver initiates real-time vitals monitoring (Heart Rate, SpO2, Systolic/Diastolic BP).
4. Generates a cryptographic handover token enabling receiving hospital casualty teams to review patient vitals before the vehicle arrives.

## Related Notes

- [[DocBot_TeleClinic]]
- [[Hospital_Bed_Locator]]
- [[Hospital_Information_System_HIS]]
