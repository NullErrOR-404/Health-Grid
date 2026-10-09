# ADR-027: Intelligent Triage Gating, Strict Conciseness & Open-Weight Fine-Tuning Pipeline

## Status

Accepted

## Date

2026-10-06

## Context

Previously, users noticed the chatbot asking unsolicited clinical questions or popping up the multi-step Clinical Triage Assessment wizard unexpectedly when nothing acute was said, or even on casual/generic questions.

Investigation revealed two root causes:

1. `generateDynamicTriageWizard` evaluated `combined =`${qLower} ${cLower}``, combining the user's query with the AI model's generated response. If the AI mentioned symptoms (e.g. fever or headache) in its explanation or advice, it falsely matched triage condition criteria.
2. In `generateDynamicTriageWizard`, if no specific condition matched, it returned `wiz-general` as a default fallback for almost any non-greeting query. This forced an interactive survey questionnaire into conversations where users only asked simple or non-clinical questions.
3. For routine and general intelligence questions, replies often contained verbose clinical framing or throat-clearing preambles instead of answering concisely in 2 to 3 sentences.

## Decisions Made

### 1. Precision Triage Gating (`aiService.ts`)

- Eliminated `wiz-general` auto-fallback completely. Interactive triage cards are never spawned unless explicitly warranted.
- Restricted condition triggering strictly to the user's input (`userQuery` / `qLower`), completely disconnecting the AI model's own response text (`cLower`) from the triage trigger evaluator.
- Condition branches (Chest, Pediatric, Headache, Stomach, Fever) now require active personal symptom indicators (e.g., "my chest", "i have fever", "suffering from", "hurts") or explicit requests for checkups ("check my fever", "triage me").
- Generic or informational queries (e.g., "what causes fever?", "tell me about high blood pressure") receive direct informational answers and never trigger the interactive triage survey card.
- Provided an on-demand, non-intrusive option pill `[ 🩺 Start Guided Checkup ]` in fallback option trays so users can initiate triage whenever they desire without being forced into it.

### 2. Strict 2-to-3 Sentence Conciseness & General Intelligence (`aiService.ts`)

- Updated system prompt directives:
  - Strict 2 to 3 sentences maximum for routine queries, greetings, and general knowledge questions.
  - No filler, no throat-clearing pleasantries ("I understand you are asking...", "As an AI..."), and zero unsolicited medical disclaimers on non-medical topics (e.g. tech, science, general advice).
  - Preserved deep clinical rigor when red-flag emergencies are detected, while keeping the conversational style punchy, direct, and accessible at a 6th-grade reading level.
  - Zero markdown asterisks everywhere.

### 3. Open-Weight Model Architecture & Fine-Tuning Pipeline (`fineTuningToolkit.ts`, `aiService.ts`)

- Configured live Groq open-weight endpoints:
  - `openai/gpt-oss-120b`: Flagship 120B parameter open-weight reasoning model with chain-of-thought capabilities.
  - `qwen/qwen3.8-27b`: High-throughput multilingual vernacular model.
  - `openai/gpt-oss-20b`: Low-latency 20B open-weight model for rapid interactions.
- Enhanced `fineTuningToolkit.ts`:
  - Added `GENERAL_INTELLIGENCE` dataset category with multi-domain conversational pairs demonstrating concise 2-3 sentence replies without unsolicited medical warnings.
  - Implemented `exportHuggingFaceDatasetsJsonl()` exporting prompt/completion pairs directly to Hugging Face Hub dataset format.
  - Built an end-to-end, reproducible Unsloth and Hugging Face TRL `SFTTrainer` QLoRA fine-tuning training script (`exportUnslothTrainingScript()`) optimized for Meta Llama-3.3-70B-Instruct and Llama-3.1-8B-Instruct with 4-bit quantization, LoRA rank 16, and Alpaca/ChatML formatting.

## Consequences

- **User Experience**: The chatbot no longer bombards users with sudden triage cards. Everyday conversations stay crisp, direct, and pleasant.
- **Versatility**: Possesses broad general intelligence on everyday queries while remaining clinically safe and grounded on medical matters.
- **Future-Proofing**: Full dataset and Unsloth/Hugging Face training pipelines enable rapid local or cloud fine-tuning of open-weight LLMs tailored specifically to HealthGrid's conversational constraints.
