---
title: AI Providers, LLM Fallbacks & Multimodal Services
tags:
  - integration
  - ai
  - llm
  - groq
  - gemini
  - sarvam
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🧠 AI Providers, LLM Fallbacks & Multimodal Services

Back to [[00_Index]]

## Overview

HealthGrid implements a resilient multi-provider AI architecture ensuring uninterrupted clinical consultation even during rate limits or provider outages.

## Provider Topology & Capabilities

```mermaid
graph TD
    DOCBOT[DocBot AI Consultation] --> ROUTER[aiService.ts Engine]
    ROUTER -->|Primary Fast Text <300ms| GROQ[Groq LPU: GPT-OSS 120B / 20B]
    ROUTER -->|Vision OCR & Image Triage| GEMINI[Google DeepMind: Gemini 1.5/3.8 Flash]
    ROUTER -->|Tamil Speech & Voice Audio| SARVAM[Sarvam AI: Bulbul V3 Audio]
    ROUTER -->|Live Bidirectional Audio| GEMINILIVE[Gemini Live Aoede/Charon]
```

## Service Files

- `frontend/src/services/aiService.ts`: Core orchestrator with automatic fallback to Gemini if Groq exhausts quota.
- `frontend/src/services/speechService.ts`: Voice input/output with Sarvam and Gemini Live audio.
- `frontend/src/services/prescriptionAiService.ts`: Multimodal handwritten prescription digitization via Gemini Flash OCR.
- `frontend/src/services/liveVisionDoctorService.ts`: Real-time camera symptom inspection (rashes, throat inflammation, eye redness).

## Related Notes

- [[DocBot_TeleClinic]]
- [[Data_Sovereignty_and_Security]]
