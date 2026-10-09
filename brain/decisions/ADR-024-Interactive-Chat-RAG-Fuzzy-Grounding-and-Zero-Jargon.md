# ADR-024: Interactive Chat RAG, Fuzzy Clinical Grounding, Zero-Asterisk Hygiene & Plain-Language Engine

## Status

Accepted

## Date

2026-10-05

## Context

DocBot serves as the frontline clinical triage and guidance AI assistant for HealthGrid users across urban and rural Tamil Nadu. Users frequently interact using colloquial phrasing, phonetic misspellings of medication or symptom names (`paracitamol`, `doloo`, `metformn`, `shuger`, `nenjerichal`, `mandai idi`), and range in health literacy from pediatric caregivers to rural elders.

Previous iterations exhibited:

1. Occasional markdown formatting artifacts (e.g. `**` bolding or `*` asterisks) leaking into the chat bubble.
2. Clinical jargon (e.g. *analgesic*, *dyspnea*, *pyrexia*) that hindered comprehension for everyday citizens.
3. Chat interactions that were purely text-bound without dynamic, interactive choosing mechanisms (such as instant follow-up pills or multi-select symptom checkboxes).
4. Sub-optimal retrieval on typo-laden or phonetic Tamil/English queries.

## Decisions Made

### 1. Phonetic & Fuzzy Clinical Grounding Engine (`fuzzyClinicalMatcher.ts`)

- Implemented a clinical entity dictionary covering common Indian pharmaceuticals, ICMR-standard symptoms, regional Tamil/Tanglish health terms, vital metrics, and apex referral centers.
- Utilized Levenshtein distance combined with Soundex phonetic encoding to match misspellings to canonical clinical concepts.
- Integrated `enrichQueryWithFuzzyGrounding()` into the query pipeline to extract detected entities, canonical equivalents, and query enhancement terms.

### 2. Upgraded Hybrid Vector RAG (`vectorRagService.ts`)

- Boosted vector embeddings using fuzzy grounding matches and expanded clinical vocabulary weights.
- Added comprehensive ICMR clinical guidelines for pediatric fever, weight-based paracetamol dosing, WHO-ORS dehydration rehydration protocols, and pregnancy drug safety.
- Expanded PMBJP Jan Aushadhi generic formulary entries (WHO-ORS ₹4.50, Cetirizine ₹4.50, Amox-Clav 625mg ₹60.00).
- Auto-ingested live patient telemetry from `healthMemoryService` directly into retrieval context.

### 3. Strict Zero-Asterisk & Zero-Jargon Post-Processing (`aiService.ts`)

- System prompt mandates a 6th-grade reading level, empathetic tone, zero asterisks, and plain everyday terminology.
- Implemented deterministic regex sanitization in `cleanAndSanitizeResponse`:
  - `replace(/\*{1,3}/g, '')` strips all markdown asterisks before text reaches the user.
  - Heading hash (`#`) removal and whitespace normalization (`\n{3,}` -> `\n\n`).
  - Secondary automated substitution replacing persistent academic jargon (e.g. *dyspnea* -> *breathing difficulty*, *edema* -> *swelling*).

### 4. Adaptive Interactive Choosing Options & Direct Action Shortcuts (`ChatbotPage.tsx`)

- DocBot emits structured envelopes: `<<<OPTIONS:type=single_tap|multi_select>>>[Option 1 | Option 2]<<</OPTIONS>>>`.
- Front-end parses and renders:
  - **Single-tap quick pills**: One-click pills with subtle hover micro-animations that fire follow-up queries or execute immediate platform action shortcuts (`🚨 Call 108 Emergency`, `🏥 Find Nearest Hospital`, `💊 Locate Jan Aushadhi Kendra`, `📹 Start Live Video Doctor`, `🩺 Record Today's Vitals`).
  - **Multi-select checklist cards**: Interactive checkbox cards for symptom triage (e.g. fever duration, associated red flags) with a "Send Selected (N) →" submission trigger.
  - **Contextual Color Accents**: High-contrast rose pills for emergency actions, emerald for pharmacy kendras, blue for live video consultations, and amber for vitals telemetry.
- Full bilingual support (English & Tamil) for all interactive choosing controls.

### 5. Clinical Threshold, Tone Tuning & Zero-Filler Bedside Manner (`aiService.ts`)

- Enforced a direct-to-the-point bedside manner starting immediately with practical clinical guidance, eliminating generic opening pleasantries ("I understand your concern...").
- Limited conversational triage to **1 to 2 targeted follow-up questions maximum** per turn to avoid overwhelming patients.
- Condensed safety disclaimers to a single, warm closing sentence directing patients to in-person clinics if symptoms do not improve.
- Expanded vernacular Tanglish & regional colloquialisms dictionary (`mudhugu vali`, `neer kaduppu`, `kirukiruppu`, `thondai kattu`, `aripu`, `seethabethi`).

## Consequences

- **User Experience**: Drastically reduced cognitive load for everyday users; interactions are faster, delightfully tactile, and more engaging via one-tap action pills.
- **Clinical Safety**: Grounded against authentic ICMR and PMBJP databases without hallucinated prices or dangerous dosage assumptions.
- **Visual Hygiene**: Clean, asterisk-free, beautifully formatted responses with zero formatting leaks.
