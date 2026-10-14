# ADR-055: Situational AI Quick Actions & Pure Zero-Fallback Architecture (Zero-Emoji SVG Design)

## Status
**ACCEPTED** - Implemented, Built (`npm run build` PASS, 0 errors across 2,667 modules), Tested, and Synchronized across Web and Mobile.

## Context & Motivation
HealthGrid's AI Doctor (DocBot) previously presented interactive choosing options and follow-up chips on **every single message**. Even when the patient sent casual pleasantries ("hi", "how are you", "good morning"), non-medical questions, or expressions of gratitude, the platform rendered multiple tiers of action pills:
1. Hardcoded conversational fallback pills ("How does HealthGrid work?", "Check generic medicine savings", "Tell me more").
2. Contextual follow-up chips with generic fallback questions ("Explain in simple terms", "Red flag signs to watch for").
3. Miscellaneous emoji decorations (`💊`, `⚠️`, `📋`, `🌡️`, `🏥`, `🔍`, `🩺`) embedded directly in button strings.

This created persistent UI clutter, felt overly robotic, and distracted users from clean conversational bedside dialogue. The requirement under `/grill-me` was to elevate the AI capability so that:
- The AI offers quick actions **only when genuinely necessary**.
- A **Pure Zero-Fallback** policy is enforced: if the model does not emit interactive options, no options or pills are fabricated.
- All emojis are eradicated from option buttons and replaced exclusively with clean, scalable **SVG icons** (Lucide React).

## Decision & Architectural Scope

### 1. Situational Interactive Choosing Options Protocol (`aiService.ts`)
- Replaced the mandatory prompt directive ("At the very end of your response, you MUST provide 2 to 4 options...") with `SITUATIONAL INTERACTIVE CHOOSING OPTIONS PROTOCOL`:
  - **Required Situations**:
    1. Actively conducting SOCRATES clinical history taking and asking the patient a specific branching question (e.g. symptom duration, severity, triggers, accompanying red flags).
    2. The patient explicitly asks for choices, alternatives, or next steps (e.g. "what are my choices?", "what should I do next?").
    3. Acute emergency decisions where immediate choices are vital (e.g. Call 108 Ambulance vs Nearest 24/7 Casualty).
  - **Strictly Prohibited Situations**:
    1. Casual greetings, pleasantries, or friendly check-ins ("hi", "vanakkam", "how are you").
    2. Non-medical queries, creative writing, philosophy, coding, or playful banter.
    3. Informational or educational answers where no question was asked to the patient.
    4. Concluded clinical summaries where the diagnostic plan is already finalized.
  - **Zero-Emoji Directive**: The model is strictly instructed never to include emojis in option labels.

### 2. Pure Zero-Fallback Engine (`aiService.ts`)
- Completely deleted the hardcoded fallback options generator (`if (!suggestedOptions) { ... }`).
- When the AI model does not emit `<<<OPTIONS>>>`, `suggestedOptions` strictly remains `undefined`.
- If the model emits options during early symptom exploration (`EXPLORING` or `NARROWING`), the system ensures "Give me your initial diagnosis now" is available as a clean text option so the patient retains conclusion control, but never synthesizes options from scratch if the model emitted none.
- Added unicode emoji regex sanitization (`/[\u{1F600}-\u{1F64F}...]/gu`) in the options parser to guarantee clean text strings.

### 3. Situational Clinical Follow-up Chips (`clinicalChatEngine.ts`, `aiService.ts`)
- Removed default generic chips from `clinicalChatEngine.generateBilingualFollowUpChips`. If no specific medication or fever/infection clinical triggers are present, it returns an empty array `[]`.
- Stripped all emoji characters (`💊`, `⚠️`, `📋`, `🌡️`, `🏥`, `🔍`) from chip labels.
- In `aiService.ts`, `followUpChips` are suppressed if the query is a casual greeting (`isCasualGreetingOrSocial`) OR if `suggestedOptions` is already present, eliminating dual-row pill clutter.

### 4. Zero-Emoji Pure SVG UI Presentation (`ChatbotPage.tsx`)
- Updated single-tap and multi-select option renderers:
  - Sanitizes residual emojis from option strings before rendering.
  - Dynamically mounts contextual Lucide SVG icons:
    - `AlertCircle` for emergency ambulance options.
    - `Pill` for medication and Jan Aushadhi generic options.
    - `Video` for video consultation options.
    - `Stethoscope` for diagnostic conclusion options.
    - `ArrowRight` for action direction.
  - Checkboxes use clean `<CheckSquare />` and `<Square />` SVG primitives.
- Follow-up chips use `<Sparkles />` and `<ArrowRight />` SVGs.

### 5. Mobile Synchronization (`mobileAiService.ts`)
- Updated mobile DocBot system prompt rule 4 to `SITUATIONAL CHOOSING CHIPS`, aligning Expo mobile clients with the same zero-emoji, situational quick-action standard.

## Verification & Build Results
- **TypeScript & Vite Compilation**: `npm run build` executed in `frontend/` passed cleanly with **0 errors** in 2.91s across all 2,667 modules.
- **Local Dev Server**: Validated `http://localhost:5173/` responding HTTP 200 OK.
- **Git State**: Cleanly versioned across `aiService.ts`, `ChatbotPage.tsx`, `clinicalChatEngine.ts`, and `mobileAiService.ts`.

## Related Links
- [[00_Index]]
- [[Active_Context]]
- [[ADR-024-Interactive-Chat-RAG-Fuzzy-Grounding-and-Zero-Jargon]]
- [[ADR-041-Living-Clinical-Case-Dossier-Adaptive-History-Taking-and-Universal-EQ]]
- [[ADR-054-Comprehensive-RBAC-Persona-Gating-and-Zero-Trace-Data-Isolation]]
