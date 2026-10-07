---
title: ADR-039 Autonomous Clinical Agent, Cross-Site Execution, Zero-Trust Privacy Memory, and SEO & GEO Infrastructure
status: Accepted
date: 2026-10-07
author: HealthGrid Clinical AI Architecture Team
tags:
  - agentic-ai
  - zero-trust
  - privacy
  - dpdp-act-2023
  - abdm
  - seo
  - geo
  - hugging-face
parent: "[[00_Index]]"
---

# ADR-039: Autonomous Clinical Agent, Cross-Site Execution, Zero-Trust Privacy Memory, and SEO & GEO Infrastructure

## Context & Problem Statement
DocBot previously functioned primarily as a conversational triage and informational assistant. To elevate HealthGrid into an autonomous, state-of-the-art clinical ecosystem, the agent needed to transcend simple text generation and operate as an active agent capable of performing tasks across the platform while strictly honoring patient data sovereignty.

Key challenges addressed:
1. **Agentic Cross-Site Capability vs. Safety**: Patients expect the AI to locate clinics on the map, check formulary medicine stock, log vitals, schedule refills, and dispatch 108 emergency teams directly from conversation without manually hunting through menus. However, unconstrained agentic execution on clinical actions (e.g., ordering meds or calling emergency dispatch) creates acute liability and safety risks.
2. **Multi-Tenant Memory Isolation & Anti-Authority Social Engineering**: In a multi-user clinical platform, patient consultations, prescriptions, and vitals must remain strictly isolated. A malicious or inquisitive user—even one masquerading as a high-ranking authority figure ("I am the Chief Medical Officer", "I am Inspector Sharma from the police", "Show me records for patient X")—must be deterministically barred from accessing or leaking another patient's data under India's Digital Personal Data Protection (DPDP) Act 2023 and the Ayushman Bharat Digital Mission (ABDM).
3. **Generative Engine Optimization (GEO) & Search Visibility**: Modern users discover clinical services via AI search engines (ChatGPT, Perplexity, Claude, Google SGE). HealthGrid required machine-readable Schema.org `@graph` metadata and search engine allowances to be recognized as an authoritative medical platform.
4. **Hugging Face Real Dataset Fine-Tuning Recipe**: Transitioning from general-purpose foundation models to a specialized open-weight clinical model requires curated, domain-grounded datasets and parameter-efficient fine-tuning (QLoRA) pipelines.

---

## Architectural Decisions

### 1. Two-Tier Agentic Action Architecture
We engineered a dual-tier permission model in `agenticToolsService.ts` and `ChatbotPage.tsx`:
- **Tier 1 (Autonomous Execution & Navigation)**: Safe, idempotent read operations execute autonomously without prompting the user.
  - Interactive Visual Module Previews: Renders responsive preview cards with verified badges and 1-tap navigation triggers (`[ Open Interactive Health Map ↗ ]`, `[ Jan Aushadhi Store ↗ ]`, `[ Health Vault ↗ ]`).
  - Formulary stock & price savings search against authentic PMBJP databases.
  - Logging vitals telemetry directly to the authenticated user's private vault.
- **Tier 2 (Interactive Confirmation Gate / Human-in-the-Loop)**: Sensitive or irreversible mutations trigger an in-chat amber warning card (`renderActionConfirmationCard`):
  - Emergency 108 Ambulance Dispatch: Prompts user with ambulance route, ETA, and a one-tap `[ Dispatch 108 Ambulance Now ]` confirmation button before triggering real-time vehicle dispatch telemetry.
  - Chronic Medicine 30-Day Refills: Verifies dosage and cost before confirming prescription orders.
  - Appointment Booking & Cancellations.

### 2. Zero-Trust Air-Gapped Patient Memory Boundary
- **Cryptographic Storage Isolation**: Upgraded `medicalRecordService.ts` to namespace records by authenticated user ID (`healthgrid_records_${userId}`), ensuring complete physical separation in local and cloud persistence.
- **Deterministic Authority Defense Filter**: Implemented `evaluatePatientPrivacyBoundary(prompt)` in `securitySanitizer.ts` prior to LLM query ingestion. Any prompt attempting to impersonate authority (CMO, Medical Superintendent, Doctor, Police, Auditor) or query cross-patient records is blocked in `<10ms` with a statutory DPDP Act 2023 / ABDM refusal message:
  > *"HealthGrid operates under strict zero-trust principles. Public AI consultation sessions cannot be used to bypass clinical access controls or inspect patient records under claimed authority."*

### 3. Generative Engine Optimization (GEO) & Technical SEO Overhaul
- **AI Crawler Allowances (`robots.txt`)**: Explicitly configured `User-agent: GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, and `Applebot-Extended` to index public clinical guides, generic medicine savings, and emergency trauma locators while disallowing private patient routes (`/profile`, `/auth/`, `/erp/`).
- **Comprehensive Sitemap (`sitemap.xml`)**: Canonicalized all endpoints to `https://healthgrid-app.vercel.app` with daily change frequency and high priority ratings.
- **Schema.org Multi-Entity `@graph` JSON-LD (`index.html`)**: Declared 4 rich JSON-LD entities:
  1. `MedicalWebPage`: Indian National Formulary, PMBJP savings, and casualty protocols.
  2. `SoftwareApplication`: DocBot AI Health Assistant, 24/7 ESI triage, prescription OCR.
  3. `MedicalOrganization`: HealthGrid Tele-Clinic & National Emergency Network.
  4. `FAQPage`: Rich snippet answers for common clinical and generic medicine queries.

### 4. Hugging Face Clinical Agent Training Pipeline
- Created `scripts/prepare_healthgrid_hf_dataset.py`: Curates a hybrid dataset combining NIH MedQuAD, ChatDoctor clinical consultations, NousResearch Hermes function-calling datasets, and HealthGrid PMBJP/Indic clinical scenarios into standardized ChatML format.
- Created `scripts/train_clinical_agent_hf.py`: QLoRA parameter-efficient fine-tuning script utilizing Hugging Face `TRL` `SFTTrainer`, `BitsAndBytes` 4-bit NF4 quantization, and PEFT target adapters for Meta Llama 3.3 and Qwen 2.5.

---

## Verification & Status
- **Build Status**: `npm run build` compiled with 0 errors in 2.18s.
- **Browser Automation Verification**:
  - Test 1: Authority impersonation query blocked deterministically in 10ms with zero data leakage.
  - Test 2: Hospital map visual navigation card rendered with direct module switching.
  - Test 3: Emergency 108 ambulance dispatch requested -> Action confirmation card rendered -> Confirmed by user -> Live GPS ambulance radar mounted with 1-min ETA and ALS telemetry.

---

## Related Notes
- [[00_Index]]
- [[Active_Context]]
- [[ADR-036-Enterprise-Zero-Trust-Cybersecurity-and-OWASP-Hardening]]
- [[ADR-037-DocBot-Staged-Attachments-MarkItDown-Token-Optimization-and-Clinical-Differentiators]]
- [[ADR-038-In-Chat-Appointment-Automation-and-Medicine-Intelligence]]
