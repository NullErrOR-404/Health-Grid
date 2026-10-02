---
title: Hospital Bed Locator & Primary Health Centre (PHC) Finder
tags:
  - module
  - maps
  - hospitals
  - beds
  - geospatial
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🗺️ Hospital Bed Locator & PHC Finder

Back to [[00_Index]]

## Overview
An interactive geospatial tool for finding available general, ICU, oxygen-supported beds, government PHCs, and blood bank units across Tamil Nadu.

## Technical Architecture
- **Component**: `frontend/src/components/FindCareNearYou.tsx`
- **Modal Component**: `frontend/src/components/DiseaseMapModal.tsx`
- **Route**: Accessible at `/maps` or `#maps`
- **Mapping Engine**: Leaflet + React Leaflet with custom SVG medical markers.
- **Data Source**: `frontend/src/data/hospitalsList.ts` (Structured hospital directory with coordinates, contact numbers, bed counts).

## Real-Time Filters
- **Facility Type**: Govt Medical College, District HQ Hospital, Taluk Hospital, 24/7 Primary Health Centre.
- **Bed Status**: Live ICU beds, Ventilator beds, Maternity beds.
- **Emergency Services**: 24/7 Blood bank, Anti-snake venom (ASV), Trauma care center.

## Related Notes
- [[Hospital_ERP_Dashboard]]
- [[Emergency_108_Ambulance]]
- [[Hospital_Information_System_HIS]]
