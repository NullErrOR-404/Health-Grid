---
title: ADR-045 Billion-Parameter Clinical LLM Fine-Tuning Pipeline & Free-Tier Cloud Serving
tags:
  - adr
  - architecture
  - ai
  - fine-tuning
  - llama-3.1-8b
  - unsloth
  - qlora
  - huggingface
  - serverless
created: 2026-10-08
last_updated: 2026-10-08
parent: "[[00_Index]]"
---

# 📜 ADR-045: Billion-Parameter Clinical LLM Fine-Tuning Pipeline & Free-Tier Cloud Serving

Back to [[00_Index]]

> [!NOTE]
> **Status**: Accepted & Implemented
> **Deciders**: Antigravity AI Engineering Team, Lead Clinical Architect
> **Supercedes**: Extends [[ADR-040-Autonomous-Clinical-Model-Arbitration-and-Zero-Trace-UI]] and [[ADR-043-Dynamic-Live-Clinic-Supabase-Telemetry-and-Frontier-Model-Pipeline]]

---

## 1. Context & Problem Statement

HealthGrid requires high diagnostic acumen, empathetic clinical history-taking (SOCRATES protocol), Jan Aushadhi (PMBJP) generic drug substitutions, and strict DPDP Act 2023 zero-trust patient privacy defense.

While commercial frontier models (e.g. GPT-4o, Claude 3.5 Sonnet) offer high reasoning capabilities, relying solely on proprietary closed APIs carries operational cost vulnerabilities, rate limits, and lack of sovereign control over medical weights. Furthermore, standard off-the-shelf open-weight models lack native knowledge of the Indian Pharmacopeia, PMBJP generic formulation pricing, 108 Emergency Ambulance triage codes, and Tamil/Tanglish vernacular idioms.

The team required:
1. An **8-Billion parameter clinical model** (the industry-standard sweet spot delivering high differential diagnostic depth while fitting into accessible cloud hardware).
2. A **100% free-tier fine-tuning pipeline** runnable on free cloud GPUs (Google Colab / Kaggle) without costly compute clusters.
3. A **100% free-tier cloud deployment** mechanism so the entire live deployed production web app ([`healthgrid-app.vercel.app`](https://healthgrid-app.vercel.app)) and native Android APK can serve all users without paying for dedicated GPU VMs.

---

## 2. Decision Tree & Architectural Choices

```
Target Model Scale: 8-Billion Parameters (Meta Llama-3.1-8B-Instruct / Qwen-2.5-7B)
  │
  ├── Training Framework: Unsloth AI QLoRA (4-bit NF4 Quantization)
  │     ├── 2x-5x faster training speed
  │     ├── 70% reduction in VRAM consumption (fits into 15GB T4 GPU)
  │     └── Preserves 100% mathematical precision
  │
  ├── Compute Environment: Google Colab Free T4 GPU Notebook (.ipynb)
  │     └── 1-Click execution via GitHub badge
  │
  ├── Dataset Composition: Multi-Task Clinical Reasoning & Sovereign Governance
  │     ├── FreedomIntelligence/Medical-O1-Reasoning-Dataset (<thought> CoT)
  │     ├── MedQA-USMLE (Board-level differential diagnoses)
  │     ├── Lavita/ChatDoctor-HealthCareMagic-100k (Bedside dialogues)
  │     ├── PMBJP Jan Aushadhi Formulary (50% to 90% generic price savings)
  │     └── DPDP Act 2023 & ABDM Zero-Trust Impersonation Defenses
  │
  └── Cloud Serving & Web Integration: Hugging Face Serverless Inference API
        ├── Free Router Endpoint: https://router.huggingface.co/hf-inference/models/<id>
        ├── Authenticated via existing VITE_HF_API_KEY
        └── Automatic cross-provider failover to Groq LPU & Google Gemini
```

---

## 3. Technical Implementation

### A. Dataset Synthesis (`scripts/prepare_healthgrid_hf_dataset.py`)
Generates balanced ChatML datasets (`data/healthgrid_clinical_agent_train.jsonl` and `data/healthgrid_clinical_agent_val.jsonl`) blending:
1. **Clinical Reasoning (`<thought>`)**: Formulates differential diagnostic hypotheses before responding.
2. **Generic Price Grounding**: Calculates explicit rupee and percentage savings for high-volume chronic drugs (Metformin, Telmisartan, Amlodipine, Pantoprazole, Atorvastatin, Azithromycin).
3. **Authority Impersonation Defense**: Rebuffs unauthorized requests to inspect patient records from high-ranking officials (CMO, police, auditor) citing the DPDP Act 2023.

### B. 1-Click Google Colab Notebook (`notebooks/HealthGrid_Llama3_8B_Clinical_FineTuning.ipynb`)
Pre-configured for Google Colab's free T4 GPU:
- Step 1: Installs `unsloth`, `trl`, `peft`, `bitsandbytes`, `transformers`.
- Step 2: Loads `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit` in 4-bit NF4.
- Step 3: Configures QLoRA adapters ($r=16, \alpha=32$) on `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.
- Step 4: Pulls training data directly from GitHub.
- Step 5: Trains via `SFTTrainer` (learning rate $2\times 10^{-4}$, 120 steps).
- Step 6: Tests clinical responses.
- Step 7: Pushes adapter directly to Hugging Face Hub using `HF_TOKEN`.

### C. Free Cloud Serving via Serverless Hugging Face Inference Router
- **Endpoint**: `https://router.huggingface.co/hf-inference/models/${hfModelId}/v1/chat/completions`
- **Cost**: **$0.00** (Included in free Hugging Face tier).
- **Wiring in `aiService.ts`**:
  ```typescript
  if (model.provider === 'huggingface') {
    return await this.callHuggingFace(...);
  }
  ```
- **Failover Safety**: If the Hugging Face serverless endpoint encounters cold-start latency or quota limits, the arbiter automatically falls over to Groq LPU (`qwen/qwen3.8-27b` / `openai/gpt-oss-120b`) and Google Gemini without user disruption.

---

## 4. Operational Instructions

1. **Fine-Tuning on Colab**:
   Open [`HealthGrid_Llama3_8B_Clinical_FineTuning.ipynb`](file:///C:/HealthGrid/notebooks/HealthGrid_Llama3_8B_Clinical_FineTuning.ipynb) in Colab with T4 GPU enabled and run all cells.
2. **Configuring Environment**:
   In `frontend/.env` (and Vercel environment variables):
   ```env
   VITE_HF_API_KEY=hf_yourWriteToken
   VITE_HF_FINE_TUNED_MODEL=your-username/healthgrid-clinical-llama-3.1-8b
   ```
3. **Instant Experience**:
   Users can select **HealthGrid Llama-3.1 8B Clinical** from the model dropdown in DocBot or allow the clinical arbitrator to automatically route complex medical cases to it.
