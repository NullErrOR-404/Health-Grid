---
title: Data Sovereignty & Clinical Privacy Security
tags:
  - architecture
  - security
  - privacy
  - dpdp
  - hipaa
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🔒 Data Sovereignty & Clinical Privacy Security

Back to [[00_Index]]

## Core Privacy Pillars

HealthGrid enforces an uncompromising privacy architecture tailored for clinical trust:

1. **Digital Personal Data Protection (DPDP) Act 2023**:
   - Explicit consent before collecting patient identifiers.
   - Right to erasure and data portability built into the patient vault.
2. **Zero-Disk Triage Architecture**:
   - Symptoms, voice recordings, and image camera scans are analyzed ephemerally in memory.
   - No audio or live video feeds are stored on backend disks.
3. **Google API Limited Use Compliance**:
   - Adheres strictly to the *Google API Services User Data Policy*.
   - Never sells, rents, or transfers Google user identity data to advertising brokers.
4. **End-to-End Client Encryption**:
   - Patient vaults in `localStorage` or Supabase use cryptographic tokens tied to session authentication.

## Transparent Disclosures
The public homepage displays a dedicated transparency banner. See:
- [[ADR-004-User-Data-Transparency-Hero]]
- [[Google_OAuth_and_Verification]]

## Related Notes
- [[ADR-001-Semantic-Privacy-Links]]
- [[Supabase_Auth]]
- [[Google_OAuth_and_Verification]]
