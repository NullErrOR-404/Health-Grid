---
title: ADR-056 Universal Humane Neural Voice & Zero-Robot TTS Architecture
tags:
  - voice
  - tts
  - zero-robot
  - gemini-live
  - edge-gateway
  - mobile-audio
  - ui-abstraction
created: 2026-10-14
status: ACCEPTED
author: Antigravity AI Engine
parent: "[[00_Index]]"
---

# 🎙️ ADR-056: Universal Humane Neural Voice & Zero-Robot TTS Architecture

## Context & Problem Statement

Prior to this decision, the HealthGrid text-to-speech (TTS) pipeline suffered from several critical clinical and experiential bottlenecks:
1. **Robotic Native Browser Fallback Trap**: `SpeechEngine` defaulted its `engine` setting to `'browser-tts'`. Unless an optional Sarvam API key was manually populated in the UI, every voice interaction on the platform (Chatbot, Voice Chat, Prescription reading, Duplex voice, Live Vision Doctor) dropped immediately into `window.speechSynthesis` / `new SpeechSynthesisUtterance()`. The resulting voice sounded robotic, mechanical, monotone, and jarring to anxious patients.
2. **Exposed Technical UI**: `VoiceChatModal` exposed internal voice model selectors, provider toggles (`✨ Gemini Live Voice`, `🇮🇳 Sarvam AI Bulbul`), and settings popovers directly to the patient screen, violating clinical abstraction.
3. **Mobile Platform Inconsistency**: The React Native mobile client relied on `expo-speech` (the mobile OS built-in robotic TTS engine) instead of streaming high-fidelity clinical speech.
4. **Free-Tier Sustainability Requirement**: The user required 100% free-tier voice agents with zero paid subscriptions, demanding a warm, empathetic, natural bedside clinician voice while completely eliminating the robotic browser TTS.

---

## Architectural Decisions

### 1. Pure Zero-Robot Policy & Eradication of Browser TTS
- **Complete Deletion of `SpeechSynthesisUtterance`**: Removed all references to `window.speechSynthesis` and `SpeechSynthesisUtterance` across the entire codebase.
- **Silent Fallback Guarantee**: If all neural streams fail or the client is completely offline, the platform suppresses speech synthesis silently (`speechEngine.finishSpeaking()`). It strictly **never** falls back to robotic browser synthesis and avoids noisy, disruptive toasts.

### 2. Multi-Agent Universal Neural Voice Cascade
The platform standardizes on a single universal humane bedside clinician voice: **`Aoede`** (warm, empathetic, reassuring, natural cadence), fluent in both Indian English (`en-IN`) and native Tamil (`ta-IN`):
- **Tier 1 — Serverless Edge Gateway (`/api/ai/tts`)**:
  - Edge serverless function with OWASP security headers, CORS protection, and in-memory audio caching (`audioCache` holding up to 150 synthesized phrases).
  - Uses Google Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts` / `gemini-3.8-flash-lite-tts`) via the existing free Gemini API key (`GEMINI_API_KEY`).
  - Converts audio into 24kHz standard WAV binary buffers (`audio/wav`).
- **Tier 2 — Direct Client Gemini Audio Generation**:
  - In local standalone environments or edge network delays, `speechEngine` transparently cascades to direct client-side Gemini 3.8 Flash TTS via `VITE_GEMINI_API_KEY`.
- **Tier 3 — Vernacular Tamil Fallback (Sarvam AI Bulbul V3)**:
  - If a Sarvam subscription key is provided, routes Tamil speech to Sarvam Bulbul V3 (`meera` speaker).
- **Tier 4 — Silent Fallback**:
  - Graceful termination with zero robotic speech.

### 3. Complete UI Abstraction ("User Should Only Hear Audio")
- Purged all engine toggle buttons, provider pills, and settings popovers from `VoiceChatModal.tsx`.
- Removed technical model selectors from the user's face.
- Kept clean, accessible clinical controls: gentle speech pace toggle (0.85x / 1.0x) and dynamic duplex barge-in stop button (`speechEngine.stopSpeaking()`).

### 4. Full-Platform Edge Integration with Mobile Client
- Replaced `expo-speech` in `mobile/package.json` with modern `expo-audio`.
- Updated `mobile/src/screens/ChatScreen.tsx` to stream remote 24kHz audio from `https://healthgrid-app.vercel.app/api/ai/tts` using `createAudioPlayer`, sharing the identical humane clinician voice across Web and Mobile.

---

## Consequences & Verification

### Positive Impacts
- **Human Clinical Warmth**: Replaces monotone robotic utterances with expressive, reassuring, bedside-quality clinician voice.
- **Zero Paid Subscriptions**: 100% powered by the Google Gemini free tier (15 RPM / 1M TPM) and Edge serverless gateway caching.
- **Pristine Clinical UX**: Patients only experience voice; zero technical model toggles or engine pills.
- **Ecosystem Consistency**: Web and mobile deliver the exact same unified, empathetic voice.

### Build & Verification Evidence
- `api/ai/tts.ts`: Direct test verified status 200, generating 263KB `audio/wav` audio stream in < 2s.
- `mobile/`: `npx tsc --noEmit` passed with 0 errors.
- `frontend/`: `npm run build` (`tsc -b && vite build`) passed with 0 errors across 2,667 modules in 2.78s (Bundle: `index-CC3dj0AU.js`).
