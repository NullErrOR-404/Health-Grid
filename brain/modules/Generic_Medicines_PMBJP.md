---
title: Pradhan Mantri Jan Aushadhi Generic Pharmacy (PMBJP)
tags:
  - module
  - pharmacy
  - pmbjp
  - generic-medicines
created: 2026-10-02
parent: "[[00_Index]]"
---

# 💊 Pradhan Mantri Jan Aushadhi Generic Pharmacy (PMBJP)

Back to [[00_Index]]

## Overview

Connects citizens directly with India's Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) network, reducing out-of-pocket prescription medication expenses by up to 89%.

## Technical Architecture

- **Page Component**: `frontend/src/components/MedicineStorePage.tsx`
- **Service Engine**: `frontend/src/services/medicineStoreService.ts`
- **Route**: Accessible at `/medicines` or `#medicines`
- **Savings Engine**:
  - Compares branded retail market prices (MRP) with PMBJP generic unit prices.
  - Automatically recommends bioequivalent salt substitutes for chronic conditions (hypertension, diabetes, cardiac care).

## Kendra Store Locator

- Pinpoints authorized Jan Aushadhi Kendras across Chennai and Tamil Nadu districts.
- Displays stock availability, operating hours, and doorstep delivery options.

## Related Notes

- [[DocBot_TeleClinic]]
- [[Hospital_Information_System_HIS]]
