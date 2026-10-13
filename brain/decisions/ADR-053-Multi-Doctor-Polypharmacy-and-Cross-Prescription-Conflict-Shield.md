# ADR-053: Multi-Doctor Polypharmacy & Cross-Prescription Conflict Shield (360° Omnipresent Safety Engine)

## Status
**ACCEPTED** - Implemented, Built (`npm run build` PASS, 0 errors), Verified in Real Browser via Subagent & WebP Session Recording.

## Context & Motivation
In fragmented healthcare ecosystems (particularly across private hospitals, government multi-specialty centers, and community clinics in India), patients frequently consult multiple specialists in parallel (e.g., Cardiologist at Apollo, Orthopedic Surgeon at GMCH, General Practitioner). This fragmentation creates three critical hazards that mainstream health softwares fail to solve:

1. **Silent Duplicate Molecules (Brand Masking)**: Different doctors prescribe different commercial brand names containing the exact same active pharmaceutical ingredient (e.g., *Rosuvas 10* from cardiology + *Rozavel 10* from neurology), causing accidental lethal drug double-dosing.
2. **Cross-Specialty Pharmacological Collisions**: Unaware of concurrent orders, specialists co-prescribe contraindicated drug pairs:
   - **Blood Thinner + NSAID** (e.g., *Aspirin / Ecosprin 75* or *Clopidogrel* + *Aceclofenac / Hifenac* or *Ibuprofen*), multiplying gastric ulceration and severe internal hemorrhage risks.
   - **ACE Inhibitor + NSAID** (e.g., *Ramipril / Cardace* + *Aceclofenac*), causing dual arteriolar vasoconstriction in the glomerulus and precipitating Acute Kidney Injury (AKI).
   - **Statin + Macrolide** (e.g., *Atorvastatin* + *Azithromycin / Clarithromycin*), inducing CYP3A4 inhibition and fatal rhabdomyolysis.
3. **The "Discontinued vs. Prescribed" Blind Spot**: Traditional hospital EHRs only see their own prescriptions and assume all past orders are actively taken. Real patients stop medications due to side effects, alter dosages, or continue taking old courses indefinitely without doctor knowledge.

## Decision & Architectural Scope

### 1. Deterministic Multi-Doctor Pharmacology Engine (`medicationSafetyService.ts`)
- **Brand-to-Salt Normalization**: Normalized Indian brand directory (200+ brands mapped to INN active salts, strengths, and therapeutic classes).
- **Multi-Factor Interaction Matrix (ICMR STG & National Formulary of India Grounded)**:
  - Detection of duplicate active molecules across distinct doctor orders.
  - Severity classification: `CONTRAINDICATED_SEVERE`, `MAJOR_MONITORING_REQUIRED`, `MODERATE_PRECAUTION`.
  - Evidence-based biological mechanisms (e.g., efferent vs. afferent renal arteriolar hemodynamic collapse).
  - Alternative safe substitutions (e.g., recommending Paracetamol 650mg over systemic NSAIDs for cardiac patients).
  - Cumulative organ burden indexing (Nephrotoxic, Hepatotoxic, Bleeding, QTc Prolongation).
  - Contextual modifiers: Age, eGFR renal clearance, and documented patient allergies (e.g., Penicillin).

### 2. Dual-Persona Reconciliation Layer
- **Patient Autonomy Without Order Mutation**: Patients report actual intake status (`STILL_TAKING`, `STOPPED`, `TAKING_DIFFERENTLY`, `UNSURE`, `DISCUSS_WITH_DOCTOR`) along with reasons and dates.
- **Immutable Prescriber Provenance**: Doctor provenance (Doctor Name, Facility, Date, Original Dosage) is strictly immutable. Patient reports annotate the reconciliation view without deleting or invalidating original legal doctor orders.
- **Real-Time Safety Recalculation**: When a patient marks a conflicting medication as `STOPPED`, the collision radar immediately updates in real-time.

### 3. Unified Medication Cabinet & Safety Radar (`MedicationCabinetWorkspace.tsx`)
- **Safety HUD**: Real-time Polypharmacy Safety Score (0-100), active molecule tally, doctor count, and monthly generic savings estimator via PMBJP Jan Aushadhi.
- **Pharmacological Conflict Cards**: Expandable clinical collision cards with mechanism explanations, risk warnings, and literature citations (*Indian Journal of Nephrology*, *NICE NG136*, *ICMR*).
- **Doctor Discussion Brief (SBAR)**: 1-tap generation of a structured clinical handover note (Situation, Background, Assessment, Recommendation) ready for printing or copying before the next doctor visit.

### 4. Interactive Clinical Canvas Integration (`PolypharmacyShieldArtifact.tsx`)
- Registered under `ClinicalCanvas` as `POLYPHARMACY_CONFLICT` with `ShieldAlert` icon.
- Integrates seamlessly with DocBot (`ChatbotPage.tsx`) via quick action tray `[ 🛡️ Polypharmacy Shield ]` and automatic in-chat alert cards.
- Provides 1-tap "Send Polypharmacy Brief to AI Consultation" for deep clinical arbitration.

### 5. Clinician Encounter Cross-Specialist Workspace (`ClinicalEncounterWorkspace.tsx`)
- Integrated into Stage 7 (Orders & Prescriptions) of the 10-Stage Clinical Encounter.
- Real-time collision checking between existing multi-doctor medications and newly drafted orders.
- **Audited Clinical Override Modal**: If a physician consciously chooses to co-prescribe despite an alert (e.g., short-term monitored regimen with mucosal PPI protection), they must select a clinical justification, supply a safety monitoring plan, and digitally sign with a SHA-256 cryptographic audit record.

## Verification & Browser Evidence
- **TypeScript Compilation**: `tsc -b && vite build` passed cleanly with 0 errors across all 2667 modules.
- **Browser E2E Verification 1**: Unified Medication Cabinet HUD, collision cards, ICMR citations, patient taking status toggle (`Stopped` instantly recalculating collisions from 2 to 1), and SBAR Doctor Discussion Brief clipboard copy verified.
  - Recording: `polypharmacy_shield_verify_1791905717569.webp`.
- **Browser E2E Verification 2**: DocBot chat quick action pill `[ 🛡️ Polypharmacy Shield ]` opening Clinical Canvas side-by-side with 90/100 safety score and conflict details, followed by 375x812 mobile viewport test showing clean stacking and touch targets >= 44x44px.
  - Recording: `chat_canvas_mobile_verify_1791905873550.webp`.

## Related Links
- [[00_Index]]
- [[Active_Context]]
- [[ADR-019-Clinical-Pharmacology-Engine-Formulary-Grounding-and-Context-Matching]]
- [[ADR-047-HealthGrid-Clinician-Operating-System-and-Clinical-Workflow-Architecture]]
- [[ADR-049-10-Stage-Clinical-Encounter-Workspace-Persistence-and-Digital-Signature]]
- [[ADR-052-Collapsible-Clinical-Canvas-Deep-Research-and-Ambient-Scribe]]
