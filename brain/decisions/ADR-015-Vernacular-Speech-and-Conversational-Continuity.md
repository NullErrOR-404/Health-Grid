---
title: "ADR-015: Vernacular Speech Recognition, Tanglish Normalization, and Multi-Turn Conversation Continuity"
status: Accepted
date: 2026-10-03
deciders: HealthGrid Architecture & Clinical UX Team
tags:
  - adr
  - vernacular-speech
  - tanglish-normalizer
  - groq-whisper
  - conversational-continuity
---

# ADR-015: Vernacular Speech Recognition, Tanglish Normalization, and Multi-Turn Conversation Continuity

## 🎯 Status
**Accepted & Implemented** (October 2026)

---

## 🏥 Context & Problem Statement
During clinical evaluations with bilingual patients across Tamil Nadu:
1. **Repeated Greetings Friction**: In multi-turn consultations, traditional LLMs greet the patient anew on every turn ("Hello", "Vanakkam", "How can I help you?"), breaking conversational flow and sounding robotic.
2. **Regional Dialect & Tanglish Misinterpretation**: Colloquial symptom descriptions like *"mandai idi"* (severe migraine/headache) or *"udambu soodu"* (body heat/feverishness) could be misinterpreted if not properly normalized and mapped to clinical ontologies.
3. **Speech Recognition Latency vs Accuracy Trade-off**: Standard cloud ASR creates a 2–3 second delay before text appears, whereas local Web Speech API is fast (0ms) but struggles with Indian English and Tamil medical terms.

---

## 💡 Decisions Made

### 1. Hybrid Ultra-Fast Speech Architecture
- **Real-Time Stream**: Initiates Web Speech API concurrently for instantaneous (0ms) interim visual word feedback in the chat bar.
- **SOTA Whisper Polish**: Streams recorded Opus/WebM audio directly to Groq Whisper Large-v3-Turbo with a specialized clinical Indic prompt:
  ```text
  Clinical medical symptoms in Tamil, Tanglish, and English: kaichal, thala vali, mandai idi, fever, headache, nenju vali, stomach pain, tablet, marunthu, udambu soodu, sali, irumal, nenjerichal, asathi
  ```
- **Failover Resiliency**: If network drops or Whisper fails, the live Web Speech transcript is preserved seamlessly.

### 2. Tanglish & Vernacular Medical Normalizer (`TanglishNormalizer`)
- Built an extensive clinical dictionary of Tamil and Tanglish terms mapped to English medical concepts and SNOMED-CT / ICD-10 identifiers:
  - *mandai idi* / *thala vali* ➔ Headache / Migraine (Tension, stress, lack of sleep)
  - *udambu soodu* ➔ Feverish feeling / Body heat / Dehydration
  - *nenju eriyudhu* / *nenjerichal* ➔ Acidity / Heartburn / GERD
  - *nenju vali* / *nenjula weight* ➔ Chest Pain / Cardiac Emergency Red Flag
  - *vayiru perattuthu* / *kumattal* ➔ Nausea / Queasiness
  - *kai kaal kodaichal* / *asathi* ➔ Body Ache / Generalized Weakness
- Integrated red-flag detection flagging emergency phrases for immediate 108 triage.

### 3. Conversation Continuity Protocol
- System prompt dynamically detects conversation state:
  - **Turn 0 (First greeting)**: Warm greeting with clinical bedside reassurance. If casual ("hi"), conversational chameleon applies without unprompted symptom surveys.
  - **Turn > 0 (Ongoing consultation)**: **STRICT BAN on greetings**. Prohibits "Hello", "Hi", "Vanakkam", "Namaste", or re-introductions. Direct, focused clinical attention to the patient's ongoing thoughts and symptoms.
- Increased conversation context window from 4 to 8 turns to retain long clinical histories.

---

## 🔬 Consequences & Clinical Benefits
- **Zero-Latency Bedside Experience**: Instant visual feedback while speaking, followed by precision transcription.
- **Natural Human Flow**: Consultations feel like speaking to a real family physician in Chennai or Coimbatore rather than an AI chatbot.
- **Clinical Safety**: Emergency red-flags in regional dialect are detected and prioritized instantly.

---

## 🔗 Related Notes
- [[ADR-011-Family-Beneficiary-Profiles]]
- [[ADR-012-Beneficiary-to-Independent-Account-Porting]]
- [[ADR-013-Beneficiary-OTP-Verification-and-Emergency-Sync]]
- [[ADR-014-Conversational-Chameleon-and-Speech-Pipeline]]
- [[00_Index]]
- [[Active_Context]]
