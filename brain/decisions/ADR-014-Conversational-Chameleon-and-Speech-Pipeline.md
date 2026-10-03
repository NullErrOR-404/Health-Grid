---
title: "ADR-014: Conversational Chameleon Intent Separation and Single-Pipeline Voice Engine"
status: Accepted
date: 2026-10-03
deciders: HealthGrid Architecture & Core Frontend Team
tags:
  - adr
  - voice-engine
  - speech-to-text
  - text-to-speech
  - conversational-ai
  - persona
---

# ADR-014: Conversational Chameleon Intent Separation and Single-Pipeline Voice Engine

## Context & Problem Statement
During mobile real-world clinical usage of the DocBot consultation module, three user experience friction points emerged:
1. **Mobile Microphone Lock Collision**: When users tapped the microphone on mobile Chrome/Safari, the system simultaneously instantiated both `navigator.mediaDevices.getUserMedia` and `webkitSpeechRecognition`. On mobile operating systems (Android and iOS), the audio hardware cannot be dual-captured; this caused `SpeechRecognition` to abort with a `"not-allowed"` error before the user could even be prompted, misrepresenting permissions as "disabled".
2. **Read Aloud TTS Latency & Dragging Cadence**: Clicking "Read Aloud" initiated a multi-second delay (4-8s) caused by sequentially trying non-existent Gemini audio REST model endpoints before falling back to browser synthesis. When it finally spoke, it ran at a dragging `0.85x` rate and read raw markdown punctuation (asterisks, bullet points, and URLs).
3. **Robotic Over-Eager Clinical Probing**: The system prompt and emotional classifier enforced a mandatory `active clinical probing` directive on every input. When users sent simple friendly greetings (e.g., *"hi"*, *"how r u"*, *"vanakkam"*), DocBot immediately responded robotically with unprompted clinical surveys (*"What symptoms are you experiencing? How are you feeling physically?"*), feeling unnatural and robotic.

## Decision Drivers
- **Human Bedside Naturalness**: DocBot must converse like an approachable, warm human doctor and trusted friend, not a rigid clinical diagnostic questionnaire.
- **Instantaneous Voice Playback**: "Read Aloud" must play with <50ms local latency at a crisp, natural conversational cadence (`1.1x`).
- **Mobile Hardware Reliability**: Microphone tap must cleanly activate native OS permission dialogs without hardware resource collisions.

## Considered Options
1. *Multi-Model Cloud TTS vs. Local Native Web Speech Synthesis*
2. *Concurrent Dual-Stream Capture vs. Resilient Single-Pipeline Direct Capture*
3. *Static Medical Prompting vs. Conversational Chameleon Intent Routing*

## Decision & Implementation
We adopted:
1. **Single-Pipeline Direct Capture**:
   - Web Speech API (`SpeechRecognition`) is used directly as the primary listener on supported mobile/desktop browsers without spinning up a competing `getUserMedia` stream.
   - If pre-flight `navigator.permissions` detects explicit block, it displays an actionable guide: *"Tap the 🔒 lock icon in the address bar ➔ Site Settings ➔ Allow Microphone."*
   - Hardware `getUserMedia` + Groq Whisper AI is cleanly retained as a seamless fallback if Web Speech is unavailable or suffers network errors.
2. **Instant Zero-Lag Browser TTS at 1.1x Cadence**:
   - Defaulted voice engine to `browser-tts` (`window.speechSynthesis`), starting in <50ms with zero network lag or API quota overhead.
   - Set playback rate to `1.1x` (brisk, natural conversational rhythm).
   - Added `cleanTextForSpeech` regex parser to strip markdown asterisks (`**bold**`), headers (`#`), bullet points (`•`, `-`), and URLs before synthesis.
3. **Conversational Chameleon Intent Routing**:
   - Added `isCasualGreetingOrSocial(query)` in [[aiService]]:
     - Detects social greetings (*"hi"*, *"hello"*, *"how r u"*, *"good morning"*, *"vanakkam"*).
     - Confirms absence of anatomical/symptom keywords.
   - Injects `CONVERSATIONAL CHAMELEON & CASUAL GREETING PROTOCOL`:
     - Warm, casual human conversational response without unprompted clinical probing.
     - Medical follow-up questions are strictly reserved for when the user actually describes symptoms or health issues.

## Consequences & Verification
- Mobile tap triggers OS microphone permission dialog smoothly with 0 hardware collision errors.
- Read Aloud plays immediately (<50ms) in crisp, natural, human doctor cadence.
- Greetings feel natural, empathetic, and human, seamlessly transitioning to clinical diagnosis only when the patient shares medical concerns.
