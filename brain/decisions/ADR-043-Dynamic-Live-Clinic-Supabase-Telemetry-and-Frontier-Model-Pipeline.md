# ADR-043: Dynamic Live Clinic, Real-Time Supabase Telemetry, Client-Side Transcript Caching, and Frontier Model Pipeline

## Context

Following the visual overhaul in [[ADR-042-AI-Live-Clinic-and-Records-Hub-Pixel-Perfect-Redesign-and-Mobile-Optimization]], the user requested deep functional honing of the AI Live Clinic consultation module:

1. **Remove Doctor Image (PIP)**: Completely eliminate the static doctor portrait/PIP overlay from the center live screen viewport to maximize full-bleed visual inspection.
2. **Dynamic Live Transcript with Local Cache**: Eliminate all hardcoded dialogue messages (`t1`..`t4`). Capture live dynamic turns in real-time and cache them locally on the user's device (`localStorage`) with a searchable history and instant restore capability.
3. **Real-Time Supabase Credentials & Latency Telemetry**: Replace simulated/static session attributes with genuine live data from the authenticated Supabase session (`patients`, `appointments`), and measure round-trip cloud network ping latency (`performance.now()`) with dynamic status badges.
4. **Dynamic AI Assistant Verification**: Eliminate rigid, hardcoded clinical checklists (`c1`..`c4`). Ground AI observations dynamically in multimodal visual inspection results and live speech, updating interactive confirmation chips on the fly.
5. **Frontier Clinical Model Fine-Tuning Pipeline**: Expand open-weight fine-tuning pipelines using state-of-the-art medical reasoning datasets (Medical-O1 CoT, MedQA-USMLE, ChatDoctor, UltraChat, Hermes Function Calling) targeting frontier architectures (Llama-3.3-70B, Qwen-2.5-72B) with direct Hugging Face Hub upload capabilities.

---

## Decision

### 1. Doctor PIP Elimination & Kinetic Audio Pulse (`LiveVisionDoctorModal.tsx`)

- **Full-Bleed Visual Canvas**: Completely removed the circular doctor headshot picture-in-picture (PIP) element from the center video feed on both desktop and mobile viewports.
- **Dynamic Voice Feedback**: Introduced a floating glassmorphic indicator (`DocBot Speaking` with 4 kinetic equalizer bars) that renders exclusively when `isDoctorSpeaking` is true, providing non-intrusive auditory feedback without occluding patient video.

### 2. Zero-Trace Local Device Transcript Caching (`LiveVisionDoctorModal.tsx`)

- **Dynamic Transcript State**: Initialized transcript state to empty `[]` or active cached session (`healthgrid_live_session_transcripts_${sessionId}`).
- **Local Persistence & Zero-Trust Privacy**: Each speech utterance (user or AI) is immediately synchronized to the browser's `localStorage` alongside timestamp and speaker metadata. No ephemeral audio transcripts are retained on server disks, complying with DPDP Act 2023.
- **Device History Drawer**: Left sidebar includes a "Device History" view showing past cached consultations on the device with a 1-tap "Restore →" action and 1-tap "Copy Transcript" clipboard integration.

### 3. Real-Time Supabase Telemetry & Session Grounding

- **Real-Time PostgreSQL Querying**: On mount, queries `public.appointments` and active user session from `supabase` client.
- **Live Cloud Ping Latency**: Calculates real round-trip network ping using high-precision performance timers (`performance.now()`). Displays exact millisecond latency (e.g. `908ms`, `<120ms`) paired with adaptive network health tags (`Excellent`, `Good`, `Fair`).
- **Authenticated Identity**: Automatically binds authenticated citizen name, HealthGrid ID, and active Consultation ID to the Live Clinic header and session details panel.

### 4. Dynamic Multimodal Clinical Reasoning (`liveVisionDoctorService.ts`)

- **Open-Ended Clinical Gating**: Upgraded system prompt instructions to eliminate pre-scripted interrogations. AI reasoning dynamically analyzes camera frames, vital clues, and patient statements.
- **Adaptive Checklist Generation**: Parses `dynamicChecklist` arrays dynamically from vision inference outputs with unique generated IDs, clinical confidence ratings, and follow-up prompts.
- **Bidirectional Feedback Loop**: User confirmations on dynamically generated checklist items feed directly back into subsequent AI reasoning turns via `confirmChecklistItem` and `Next →` navigation.

### 5. Frontier Clinical Model Training Pipeline (`scripts/`)

- **Dataset Synthesis (`scripts/prepare_healthgrid_hf_dataset.py`)**:
  - Blends gold-standard datasets:
    - `FreedomIntelligence/Medical-O1-Reasoning-Dataset` (Deep clinical Chain-of-Thought).
    - `MedQA-USMLE` (Differential clinical diagnosis).
    - `Lavita/ChatDoctor-HealthCareMagic-100k` (Authentic patient-doctor dialogues).
    - `HuggingFaceH4/ultrachat_200k` (Empathetic bedside manner).
    - `NousResearch/hermes-function-calling-v1` (Structured clinical tool invocations).
  - Generates ChatML-formatted training and validation splits (`healthgrid_clinical_agent_train.jsonl`, `healthgrid_clinical_agent_val.jsonl`).
- **Distributed QLoRA Training Engine (`scripts/train_clinical_agent_hf.py`)**:
  - Configured for `meta-llama/Llama-3.3-70B-Instruct` and `Qwen/Qwen2.5-72B-Instruct` using 4-bit NormalFloat (NF4) quantization, LoRA rank $r=64$, $\alpha=16$, and FlashAttention-2.
  - Automatic Hugging Face Hub model push (`push_to_hub`) utilizing `VITE_HF_API_KEY`.
  - Built-in dataset validation and fallback safety guards for environments without local CUDA.

---

## Verification & Status

- **TypeScript & Vite Build**: Passed with 0 errors (`tsc -b && vite build` in 2.14s).
- **Desktop Chrome DevTools**: Verified full-bleed viewport without doctor PIP, live Supabase ping (908ms), and Device History tab (`desktop_dynamic_live_clinic_verified_1791392816802.png`).
- **Mobile Viewport (390x844)**: Verified minimal fullscreen camera, AI drawer with dynamic checklist, and device cached transcript badge (`mobile_dynamic_live_clinic_verified_1791392890534.png`).
- **Recording**: Full interaction session captured in `verify_dynamic_live_clinic_1791392678785.webp`.
- **Status**: Completed, tested, and staged for production deployment.
