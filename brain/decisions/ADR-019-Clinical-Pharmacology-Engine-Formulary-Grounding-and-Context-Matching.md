---
title: "ADR-019: Clinical Pharmacology Engine, Formulary Grounding, and Patient Context Matching"
status: Accepted
date: 2026-10-05
deciders:
  - Lead Clinical AI Architect
  - System Pharmacologist
consulted:
  - User Directives (/grill-me session)
informed:
  - Engineering Team
tags:
  - prescription
  - pharmacology
  - ocr
  - vision
  - formulary
  - safety
parent: "[[00_Index]]"
---

# 🩺 ADR-019: Clinical Pharmacology Engine, Formulary Grounding, and Patient Context Matching

Back to [[00_Index]]

## Context & Problem Statement
During an in-depth clinical and technical audit of HealthGrid's Prescription OCR and Multimodal Vision module, several critical limitations and opportunities were identified:
1. **Raw OCR Fragility**: Doctors' cursive handwriting and Indian medical shorthand (`1-0-1`, `OD`, `BBF`, `SOS`) frequently produce smudged or ambiguous tokens (e.g. reading "40" without unit, or partial letters for "Pantocid"). Naive LLMs or OCR models either guessed inaccurately or defaulted to canned mock data.
2. **Disconnected Generic Substitution**: Generic substitutions were previously estimated via mathematical discounts rather than cross-referencing authentic Indian Pharmacopeia (IP) standards and Government of India Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) catalogues.
3. **Missing Patient Context**: Prescriptions must be interpreted *in respect to the patient*—checking patient age (pediatric dosing vs adult strengths), recorded allergies (e.g. penicillin, sulfa, NSAIDs), and drug-food interactions (e.g., Thyroxine empty stomach, Metformin with food, Iron not with tea/milk).
4. **Multi-Page Disjointedness**: Two-page slips or front/back cards risked duplicating medication entries and confusing daily dosage routines.

## Decision Drivers
- **Absolute Grounding in Reality**: Eliminate all hallucinations and mock fallbacks (`Lolita Alvarez`, `Dr. J. Dela Cruz`, `02/05/2013`).
- **Real-Time Data Matching**: Match medicines against authentic market formulations from `INITIAL_CACHE_CATALOG` (`medicineStoreService.ts`) and an `INDIAN_PHARMACOPEIA_FORMULARY` database.
- **Patient Context Respect**: Validate dosages in relation to patient age (pediatric vs adult), known allergies, and administration timing.
- **Non-Blocking Passive Safety Radar**: Surface clinical advisories and food interactions gently without blocking the patient from saving or buying.
- **Consolidated Daily Regimen**: Deduplicate active molecules across multiple scanned pages into a single seamless daily routine.

## Architectural Changes Implemented

### 1. `ClinicalPharmacologyEngine` & `INDIAN_PHARMACOPEIA_FORMULARY`
Implemented a pharmacopeia lookup engine in `prescriptionAiService.ts` containing registered Indian formulations:
- **Analgesics & Antipyretics**: Paracetamol (500mg, 650mg, pediatric oral suspension 120mg/5ml).
- **Gastroenterology**: Pantoprazole (40mg), Omeprazole (20mg), Rabeprazole (20mg), Domperidone combinations.
- **Antibiotics**: Amoxicillin + Potassium Clavulanate (375mg, 625mg), Azithromycin (250mg, 500mg), Cefixime (100mg, 200mg).
- **Antidiabetics**: Metformin (500mg, 850mg, 1000mg SR), Glimepiride combinations (1mg+500mg, 2mg+500mg).
- **Cardiovascular**: Telmisartan (20mg, 40mg, 80mg), Amlodipine (2.5mg, 5mg), Atorvastatin (10mg, 20mg).
- **Endocrinology**: Levothyroxine (25mcg, 50mcg, 75mcg, 100mcg).
- **Respiratory & Allergy**: Montelukast + Levocetirizine (10mg+5mg).
- **Hematinics & Vitamins**: Ferrous Sulfate (200mg / 60mg elemental Fe) + Ascorbic Acid (500mg).

### 2. Intelligent Dosage & Frequency Grounding
- **Smudged Dosage Disambiguation**: When an extracted dose is unitless (e.g. "40"), the engine cross-references registered market strengths for that molecule and normalizes to "40mg". If missing, grounds to `defaultAdultStrength` with a verification badge.
- **Indian NMC Shorthand Parsing**: Converts `1-0-1` to Twice daily, `1-0-0` to Once daily Morning, `BBF` / `AC` to Before Food, `PC` to After Food.

### 3. Patient Context Safety Validation
- **Pediatric Adjustment**: If `patientAge < 12`, adult tablet strengths are flagged with a pediatric caution note recommending weight-based suspension.
- **Allergy Cross-Checking**: Matches patient's recorded allergies against `allergyClasses` (e.g. penicillin allergy vs Augmentin) and inserts mild passive advisories into `safetyRadar`.
- **Food Interaction Grounding**: Appends strict pharmacological food warnings (Iron vs dairy/tea/tannins, Thyroxine empty stomach, Metformin post-meal).

### 4. Multi-Page Consolidated Regimen
- Multi-page scans are unified into `normalizedMedsMap`.
- Identical active molecules appearing across multiple pages (e.g., Page 1 "Dolo" and Page 2 "Paracetamol") are merged into a single consolidated medication entry to prevent accidental double-dosing.
- All pages are passed in a single batch to Groq and NVIDIA NIM vision endpoints.

### 5. Client-Side Canvas Image Enhancement
- Automatically normalizes image dimensions to 1920px max.
- Applies `contrast(1.22) brightness(1.03) saturate(1.05)` on HTML5 canvas with a white background to prevent dark artifacts from transparent PNGs, boosting handwritten cursive pen stroke edges.

## Consequences & Verification
- **Build Cleanliness**: `tsc -b && vite build` built successfully in 1.75s with 0 errors.
- **Zero Hallucination**: No mock patient or clinic names exist anywhere in the codebase.
- **Authentic Confidence**: Real dynamic score between 50% and 96% based on tokens, pharmacopeia matching, and patient data presence.

## Related Documentation
- [[00_Index]]
- [[Active_Context]]
- [[ADR-017-Clinical-Synergy-and-Prescription-Demographic-OCR]]
- [[ADR-018-Top-Tier-Multimodal-Prescription-Vision-and-HTR-Cascade]]
