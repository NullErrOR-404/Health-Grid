---
title: Key Test Credentials & Environment Architecture
tags:
  - context
  - credentials
  - environment
created: 2026-10-02
parent: "[[00_Index]]"
---

# 🔑 Key Test Credentials & Environment Architecture

Back to [[00_Index]]

## Test Hospital Administrator Accounts

| Hospital Code | Facility Name | Username | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **HG-H002** | Govt Medical College & Hospital, Omandurar | `gmch_admin` | `GMCH#Hospital2026` | Hospital Admin / Medical Superintendent |
| **HG-H001** | Madras Medical College & Rajiv Gandhi GGH | `mmc_admin` | `MMC#Hospital2026` | Hospital Admin |
| **HG-H003** | Stanley Medical College & Hospital | `stanley_admin` | `Stanley#Hospital2026` | Hospital Admin |

## Test Citizen / Patient Accounts
- **Default Guest / Patient Session**: Unauthenticated public browsing for all triage and locator tools.
- **Mock Personal User**: `Mohamed` (`mohamed.patient@healthgrid.in`) with linked medical vault.

## Verification Secrets & Tokens
- **Google Search Console Token**: `ixCkAfcqTBWKJbQBgViU10-aGK94QfGPP_BxmUnEiUY` (In `frontend/index.html`).
- **Google OAuth Client**: Configured via Supabase Auth Dashboard.

## Multimodal Vision & OCR AI Providers (4-Tier Cascade)
| Tier | Provider | Key Variable | Active Models | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Google DeepMind | `VITE_GEMINI_API_KEY` | `gemini-3.8-flash`, `gemini-3.5-flash-lite` | Primary multimodal prescription OCR & live camera vision |
| **Tier 2** | Groq Cloud | `VITE_GROQ_API_KEY` | `qwen/qwen3.8-27b`, `openai/gpt-oss-120b` | Sub-second vernacular vision & structured JSON clinical parser |
| **Tier 3** | NVIDIA NIM | `VITE_NVIDIA_API_KEY` | `meta/llama-3.2-11b-vision-instruct`, `meta/llama-3.2-90b-vision-instruct` | Enterprise high-precision VLM cursive handwriting decipherer |
| **Tier 4** | Hugging Face | `VITE_HF_API_KEY` | `microsoft/trocr-base-handwritten` | Specialized Transformer OCR for doctor handwriting recognition |


## Related Notes
- [[Multi_Tenant_State_Engine]]
- [[Hospital_ERP_Dashboard]]
- [[Supabase_Auth]]
