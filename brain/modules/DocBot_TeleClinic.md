---
title: DocBot Tele-Clinic & Multimodal Clinical Triage
tags:
  - module
  - docbot
  - ai-triage
  - teleclinic
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🤖 DocBot Tele-Clinic & Multimodal Clinical Triage

Back to [[00_Index]]

## Overview
DocBot is HealthGrid's 24/7 AI Family Doctor and clinical triage assistant. It provides autonomous patient consultations, live camera symptom analysis, generic medication recommendations, and emergency red-flag escalations.

## Technical Architecture
- **Primary View**: `frontend/src/components/ChatbotPage.tsx`
- **Voice Modal**: `frontend/src/components/VoiceChatModal.tsx`
- **Vision Doctor Service**: `frontend/src/services/liveVisionDoctorService.ts`
- **Prescription AI OCR**: `frontend/src/services/prescriptionAiService.ts`
- **Dual AI Engine**:
  - [[AI_Providers_and_LLMs]]: Groq LPU (GPT-OSS 120B / 20B) for instant <300ms text responses.
  - Google Gemini 3.8 / 1.5 Flash for vision image analysis, Tamil medical OCR, and fallback reasoning.
  - Sarvam AI Bulbul V3 / Gemini Live for streaming bidirectional audio.

## Clinical Safety Disclaimers
Under National Medical Commission (NMC) Telemedicine Practice Guidelines, DocBot includes:
- Non-diagnostic triage categorization (Mild, Moderate, Severe, Emergency).
- Immediate redirection to [[Emergency_108_Ambulance]] upon detecting acute chest pain, stroke symptoms, or severe trauma.

## Related Notes
- [[Emergency_108_Ambulance]]
- [[Generic_Medicines_PMBJP]]
- [[AI_Providers_and_LLMs]]
