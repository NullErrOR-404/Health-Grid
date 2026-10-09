# ADR-017: Clinical Synergy and Prescription Demographic OCR Engine

**Status**: Accepted  
**Date**: 2026-10-05  
**Deciders**: HealthGrid Core Clinical & Vision AI Engineering  

---

## 🎯 Context & Problem Statement

Prescriptions scanned in clinical and community settings (e.g., standard clinical slips containing dual therapies such as **Ferrous Sulfate** + **Ascorbic Acid / Vitamin C** with patient demographics like *Lolita Alvarez, 39, Pasig City* and physician credentials like *Dr. J. Dela Cruz, Lic: 12345, PTR: 1234567*) often encountered two major deficiencies in standard consumer health OCR apps:

1. **Loss of Critical Metadata**: Patient details (Name, Age, Gender, Address), Doctor Credentials (License No, PTR No), and dispensed quantities (# 30 Tabs) were routinely omitted or collapsed into generic diagnosis fields.
2. **Missing Pharmacological Synergy Understanding**: In many therapeutic combinations—such as Iron and Vitamin C—the combination is prescribed specifically for **pharmacological synergy** (Ascorbic acid maintains iron in the soluble ferrous Fe2+ oxidation state, increasing intestinal mucosal absorption by up to 300%). Without an explicit clinical synergy parser, patients do not understand why two medications were co-prescribed or how to sequence them effectively.

---

## 💡 Decision & Architecture

We implemented a multi-layered, clinical-grade OCR and pharmacological intelligence pipeline:

### 1. Enriched OCR Schema (PrescriptionAnalysisResult)

The OCR parsing schema in prescriptionAiService.ts was expanded to capture:

- **Patient Demographics**: patientName, patientAge, patientGender, patientAddress
- **Physician Credentials**: doctorLicenseNo, doctorPtrNo
- **Medicine Metadata**: quantity (e.g., 30 Tablets), chemicalNotation (e.g., FeSO4, C6H8O6)
- **Pharmacological Synergy**: clinicalSynergyInsight (in English and Tamil clinicalSynergyInsightTa), explaining why the drugs were prescribed together, physiological mechanism, and practical administration advice (e.g., avoid taking iron with tea/dairy).

### 2. Multi-Tier Parsing with Resilient Clinical Regex Fallback

- **Tier 1 (Multimodal Vision LLM - Groq / Gemini)**: The model prompt specifically instructs extraction of patient demographics, physician license/PTR codes, exact tablet quantities, chemical formulas, and pharmacological synergy narratives.
- **Tier 2 (Heuristic Regex Parser)**: If the vision API returns empty fields or falls back to local simulation, a dedicated regex parser scans the slip for:
  - Patient patterns (Patient:, Name:, Age:, Sex:, Gender:, Address:)
  - Physician credentials (Lic No:, PTR:)
  - Medicine quantities (#\s*(\d+), Qty:, Quantity:)
  - Therapeutic synergy patterns (Iron + Vitamin C, ACE inhibitors + Diuretics, Metformin + SGLT2i, etc.).

### 3. High-Fidelity UI Presentation in PrescriptionModal.tsx

- **Doctor Slip Header**: Displays clinic name, doctor name, license/PTR badges, and diagnosis notes.
- **Patient Demographics Strip**: Displays Patient Name, Age/Gender pill, truncated Address with tooltip, and a HTA Verified ✓ security badge.
- **Clinical Synergy & Bioavailability Card**: Rendered in a high-visibility amber banner highlighting the biochemical rationale behind the co-prescription.
- **Medicine Item Badges**: Each scanned card presents the brand name, generic PMBJP name, dosage, dispensed quantity (Qty: 30), and chemical notation pill (FeSO4).

---

## 🚀 Consequences & Impact

- **Zero Loss of Prescription Provenance**: Doctors, pharmacists, and patients have a 1:1 digital audit trail of the original paper slip.
- **Improved Medication Adherence**: Patients understand the biochemical benefit of adhering to the combined regimen rather than skipping the supplementary vitamin.
- **Automated Jan Aushadhi Savings**: Automatically maps both medications to PMBJP generics for maximum affordability while preserving clinical efficacy.
