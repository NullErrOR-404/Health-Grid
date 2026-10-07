# ADR-041: Living Clinical Case Dossier, Adaptive History Taking, and Universal EQ Intelligence

## Status
**ACCEPTED & IMPLEMENTED** (2026-10-07)

## Context & Problem Statement
In previous iterations, the AI Doctor was constrained by a strict 2-to-3 sentence conciseness prompt that mandated: *"When a patient describes a health concern or symptom, state what it likely indicates, give one practical immediate step"*. This caused the AI to jump prematurely to a clinical conclusion or self-diagnosis on turn 1 (e.g. diagnosing stomach pain as indigestion immediately without asking about onset, location, or severity).

In professional clinical medicine, an experienced physician follows the **SOCRATES** history-taking method (Site, Onset, Character, Radiation, Associated symptoms, Timing/triggers, Relieving factors, Severity) to systematically narrow down differential diagnoses before forming a conclusion. Furthermore:
1. When switching across diverse open-weight and multimodal models (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `openai/gpt-oss-20b`, `gemini-3.8-flash`), clinical context could drift without a shared working memory blackboard.
2. Patients felt trapped if they simply wanted an immediate assessment without answering questions.
3. The AI's persona was overly defensive, refusing non-medical queries, creative prompts, jokes, or everyday discussions with robotic disclaimers.

---

## Architectural Decisions

### 1. The Synced Brain: Living Clinical Case Dossier (`LivingClinicalDossier`)
We implemented a shared clinical working memory blackboard in `frontend/src/services/aiService.ts` that persists throughout the consultation session and is injected directly into the system instructions of all participating AI models:

```typescript
export interface LivingClinicalDossier {
  chiefComplaint: string;
  symptomTimeline: string;
  severityLevel?: string;
  triggersAndAggravators: string[];
  relievingFactors: string[];
  associatedSymptoms: string[];
  ruledOutSymptoms: string[];
  pastMedicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  investigativeTurnCount: number;
  diagnosticCertaintyScore: number; // 0 to 100
  investigativePhase: 'EXPLORING' | 'NARROWING' | 'CONCLUDED' | 'EMERGENCY';
  summaryDossier: string;
}
```

On every user interaction, `updateLivingClinicalDossier()` parses clinical entities, pertinence negatives, symptom chronologies, and calculates a multi-factor **Diagnostic Certainty Confidence Score (0-100%)**.

### 2. Multi-Phase Clinical Investigation Gating
The engine transitions across 4 distinct clinical states:
1. **`EXPLORING` / `NARROWING` (Turn 1 to 2, Certainty < 75%)**:
   - Acknowledges patient discomfort with warm bedside empathy (1 sentence).
   - Asks 1 to 2 sharp, targeted clinical questions to narrow down the differential cause.
   - Explains that systematically narrowing symptoms step-by-step is how good doctors find root causes.
   - Provides dynamic quick-reply chips with `[ 🩺 Give me your initial diagnosis now ]` so the patient retains 100% conclusion autonomy.
2. **`CONCLUDED` (Certainty $\ge 75\%$, Turns $\ge 3$, or Patient Explicit Diagnosis Request)**:
   - Delivers primary probable cause and 1-2 possible differentials with clinical logic connecting their specific timeline and triggers.
   - Provides practical relief steps (hydration, rest, PMBJP Jan Aushadhi generic medicines with authentic pricing).
   - Notes red-flag warning signs indicating when to visit a local clinic or hospital.
3. **`EMERGENCY` (Acute Red Flags)**:
   - Bypasses questions immediately. Instructs 108 Emergency Ambulance dispatch and urgent casualty care.

### 3. Universal Emotional IQ, Humor, and Non-Medical Versatility
The emotional analyzer was expanded to recognize:
- `'humorous_playful'`: Replies with wit, clever humor, clean jokes, or playful banter like a charismatic doctor friend.
- `'curious_general'`: Answers general queries (coding, physics, philosophy, roleplay, ELI5) with top-tier intellect without robotic disclaimers.
- `'exhausted_frustrated'`: Validates patient exhaustion with deep human warmth and minimal burden.

### 4. Resilient Interactive Options Envelope Parser
The options parser in `cleanAndSanitizeResponse()` was enhanced with robust regex matching:
```typescript
const optionsRegex = /<<<OPTIONS(?:[^\n>]*)?>>>([\s\S]*?)(?:<<<END_OPTIONS>>>|$)/i;
```
This guarantees that options envelopes (single-tap pills and multi-select cards) render reliably, and any trailing unclosed tags are deterministically stripped from user-visible prose.

---

## Verification & Validation
1. **Turn 1 History Taking**: Submitted *"Doctor, I have severe pain in my stomach since this morning"*. Verified that DocBot did NOT diagnose on turn 1, but warmly asked location/nature of pain and accompanying symptoms with interactive chips.
2. **Turn 2 Conclusion Transition**: Submitted *"It is a sharp cramping in the lower stomach, no fever or vomiting. What is your diagnosis?"*. Verified that DocBot concluded with primary cause (gastroenteritis/muscle spasm), differentials (gas, early appendicitis), immediate relief steps (Jan Aushadhi Paracetamol 650mg at ₹4.20, hydration), and emergency red flags.
3. **Humor & ELI5 Versatility**: Submitted *"Tell me a funny medical joke and explain gravity like I'm 5"*. Verified witty clean joke (*"Why did the skeleton refuse to go to the party? Because it had no body to go with!"*) and an intuitive gravity analogy (*"Earth hugging everything tightly"*) with zero robotic disclaimers.
4. **Zero-Trace UI**: Confirmed model selector dropdown and quota progress bars remain completely hidden.
5. **Production Build**: Verified `tsc -b && vite build` built with exit code 0.
