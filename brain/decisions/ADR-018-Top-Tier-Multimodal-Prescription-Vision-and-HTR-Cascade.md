---
title: ADR-018 • Top-Tier Multimodal Prescription Vision & HTR Cascade Architecture
date: 2026-10-05
status: accepted
tags:
  - adr
  - ocr
  - vision
  - gemini
  - groq
  - nvidia-nim
  - trocr
  - htr
parent: "[[00_Index]]"
---

# 📜 ADR-018: Top-Tier Multimodal Prescription Vision & HTR Cascade Architecture

> [!important] Architectural Context & Problem Statement
> Previously, prescription scanning and live camera triage in `prescriptionAiService.ts` and `liveVisionDoctorService.ts` targeted legacy vision model endpoints (`gemini-2.0-flash`, `gemini-1.5-flash`, and Groq's `llama-3.2-11b-vision-preview`), which were decommissioned or returned HTTP 404/400. In addition, calls lacked client-side request timeouts, risking stalled network requests and silent fallback to mock datasets.

## 🎯 Strategic Decisions

1. **4-Tier Autonomous Multimodal Vision Cascade**:
   - **Tier 1 (Google DeepMind Multimodal)**: `gemini-3.8-flash` (Primary) and `gemini-3.5-flash-lite` (Secondary). Verified high-accuracy multimodal clinical and cursive handwritten text recognition (HTR).
   - **Tier 2 (Groq Ultra-Fast Multimodal)**: `qwen/qwen3.8-27b` providing sub-second multimodal vision inference with structured JSON output.
   - **Tier 3 (NVIDIA NIM VLM Integration)**: Hot-swappable enterprise VLM (`meta/llama-3.2-90b-vision-instruct`, `nvidia/neva-22b`) enabled dynamically when `VITE_NVIDIA_API_KEY` is present.
   - **Tier 4 (Hugging Face Open TrOCR)**: Modern serverless router endpoints (`router.huggingface.co`) targeting `microsoft/trocr-base-handwritten` for specialized cursive handwriting deciphering when `VITE_HF_API_KEY` is present.
   - **Tier 5 (Adaptive Clinical HTA Fallback Engine)**: Guarantees graceful, non-crashing patient recovery if all network/API providers are offline.

2. **Zero-Clutter Pure User Experience**:
   - As mandated, all multi-model fallbacks, timeouts, and OCR transformations execute strictly **behind the scenes**.
   - No model selector, debug logs, or unwanted selection dialogs clutter the clinical UI.
   - The user experiences a fast, seamless upload-to-insight workflow with authentic Jan Aushadhi generic mapping, dosage timetables, food safety radar, and bilingual doctor voice explanations.

3. **Strict 15-Second Abort Timeouts & Contrast Preprocessing**:
   - All network fetch calls are guarded by `AbortSignal.timeout(15000)` to eliminate infinite looping or hanging spinners.
   - HTML5 canvas preprocessing sharpens cursive ink strokes (`contrast(1.18) brightness(1.02)`) and applies clean white backgrounds to eliminate dark PNG transparency artifacts.

## 📊 Verification & Results

- Verified `gemini-3.8-flash` live endpoint returning HTTP 200 OK with multimodal image inputs.
- Verified Groq `qwen/qwen3.8-27b` and `openai/gpt-oss-120b` returning HTTP 200 OK.
- Verified Vite and TypeScript production build passes with 0 errors (`✓ built in 1.73s`).

## 🔗 Related Notes

- [[00_Index]]
- [[Active_Context]]
- [[ADR-017-Clinical-Synergy-and-Prescription-Demographic-OCR]]
- [[AI_Providers_and_LLMs]]
