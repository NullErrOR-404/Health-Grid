# ADR-052: Collapsible Clinical Canvas, Deep Clinical Research Engine & Duplex Ambient Scribe

## Status
**ACCEPTED** - Implemented, Built (`npm run build` PASS), Verified in Real Browser via Subagent & Video Session Recording.

## Context & Motivation
While mainstream frontier LLMs (ChatGPT, Claude, Gemini) provide fluent conversational chat and generalized reasoning, applying them to clinical healthcare workflows exposes four critical limitations:
1. **Chat Stream Congestion**: Dense clinical artifacts (7-day medication dosage schedules, longitudinal biomarker charts, diet plans, SOAP notes) overwhelm linear conversational bubbles, making patient review and clinician edits cumbersome.
2. **Lack of Deep Biomedical Grounding & Guideline Arbitration**: Mainstream LLMs generate high-level text summaries without systematic GRADE certainty grading, without contrasting national (ICMR Standard Treatment Guidelines, Indian Pharmacopoeia) against international (WHO, KDIGO, NICE) recommendations, and without transparent clinical uncertainty disclosure.
3. **Absence of Duplex Ambient Scribe & Legal Signature**: General conversational voice bots lack dual-channel speaker diarization (Doctor vs. Patient), explicit DPDP Act 2023 patient consent notification, and SHA-256 cryptographic locking for tamper-evident medical record keeping.
4. **No Spatial Anatomical Localization**: Describing musculoskeletal pain or dermatological lesions purely in text fails to capture pain radiation paths, dermatomes, and Visual Analog Scale (VAS 1-10) severity.

## Decision & Architectural Scope

### 1. Collapsible Dynamic Clinical Canvas (Side-by-Side Generative Artifact Workspace)
- **Chat-First Workspace Paradigm**: The chat interface remains the primary screen by default. The Clinical Canvas opens on demand when an interactive artifact is emitted or requested.
- **Side Panel & Fullscreen Mode**: Expandable right-hand workspace with Picture-in-Picture (PiP) docking, tabbed multi-artifact switching, and instant PDF/Print export.
- **Generative Artifact Catalog**:
  - `MEDICATION_PLAN`: 7-day pill schedule, Morning/Afternoon/Evening/Night dosage grid, adherence toggles, and PMBJP Jan Aushadhi generic savings calculator.
  - `ANATOMICAL_BODY_MAP`: Interactive dual-plane vector SVG (Anterior & Posterior human anatomy), clickable region nodes, VAS 1-10 pain slider, and radiation path selector with 1-tap "Send to Chat".
  - `DEEP_RESEARCH`: Structured biomedical consensus reports with GRADE badges, guideline comparison tables, and clickable citations.
  - `SOAP_NOTE`: Ambient clinical consultation documentation with ICD-10 suggestions, proposed Rx, and SHA-256 digital signature lock.
  - `LAB_TRENDS`: Longitudinal Recharts time-series with reference range bands (HbA1c, FBS, Serum Creatinine) and out-of-range indicators.
  - `DIET_PLAN`: Culturally grounded South Indian medical nutrition therapy (Kuthiraivali, Samai, Ragi, Pavakkai) with glycemic indices and restricted foods.

### 2. Autonomous Deep Clinical Research Engine (`clinicalResearchService.ts`)
- **Pipeline Progress Transparency**: Streams real-time pipeline phases directly in chat:
  1. Formulating clinical MeSH query & hypothesis.
  2. Querying ICMR STGs, Indian Pharmacopoeia & PubMed/PMC clinical trials.
  3. Evaluating GRADE certainty (High, Moderate, Low, Very Low).
  4. Cross-verifying CDSCO contraindications and synthesizing findings.
- **Guideline Arbitration Matrix**: Compares Indian national protocols against international consensus with explicit limitations and uncertainty disclosures.

### 3. Duplex Voice Tele-Clinic & Ambient Clinical Scribe (`DuplexVoiceOverlay.tsx`, `ambientScribeService.ts`)
- **Duplex Turn-Taking Voice**: Real-time voice interaction with live interruptibility, kinetic waveform visualizer (`AudioVisualizerCanvas`), and bilingual Tamil / Tanglish / English speech recognition.
- **Ambient Scribing Mode**:
  - Prominent DPDP Act 2023 patient consent banner and recording status.
  - Speaker channel toggle (Doctor vs. Patient diarization).
  - Live transcript accumulator with timestamps.
  - 1-tap "Synthesize SOAP to Canvas" generating structured Subjective, Objective, Assessment, and Plan with SHA-256 cryptographic sealing.

### 4. Zero-Trust Action Confirmation & Explicit Clinical Review Gate
- In accordance with clinical safety principles, all orders, prescriptions, and changes drafted in the Canvas require explicit review and confirmation before signing or executing.
- Preserves zero frontend secrets and complete user data isolation.

## Consequences & Verification
- **Build Status**: Verified with `npm run build` (`tsc -b && vite build`) transforming 2664 modules cleanly in 2.38s with 0 errors.
- **Browser Subagent E2E**: Successfully verified in automated Chrome session:
  - Quick action chips tested and screenshotted.
  - Anatomical Pain Map SVG interactive nodes & VAS slider tested.
  - Ambient Scribe consent banner & kinetic waveform audio visualizer tested.
  - Deep Clinical Research evidence table and GRADE badges verified.
  - Session recording saved: `canvas_voice_test_1791901762983.webp`.

## Related Links
- [[00_Index]]
- [[Active_Context]]
- [[ADR-037-DocBot-Staged-Attachments-MarkItDown-Token-Optimization-and-Clinical-Differentiators]]
- [[ADR-039-Agentic-Doctor-Cross-Site-Execution-Zero-Trust-Memory-and-SEO-GEO]]
- [[ADR-049-10-Stage-Clinical-Encounter-Workspace-Persistence-and-Digital-Signature]]
- [[ADR-051-Enterprise-Zero-Trust-Cybersecurity-Hardening]]
