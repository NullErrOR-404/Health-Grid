# 🏥 HealthGrid 8B Clinical LLM Fine-Tuning Hub

This directory contains the production-grade fine-tuning pipeline for **HealthGrid DocBot**, training **Meta Llama-3.1-8B-Instruct** (or **Qwen-2.5-7B-Instruct**) into an autonomous clinical physician consultant.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/NullErrOR-404/Health-Grid/blob/main/notebooks/HealthGrid_Llama3_8B_Clinical_FineTuning.ipynb)

---

## ⚡ 1-Click Fine-Tuning on Google Colab (Free T4 GPU)

You can train the 8-billion parameter model completely **free of cost** using Google Colab's free T4 GPU:

1. Click the **[Open In Colab](https://colab.research.google.com/github/NullErrOR-404/Health-Grid/blob/main/notebooks/HealthGrid_Llama3_8B_Clinical_FineTuning.ipynb)** badge above.
2. In Colab, click **Runtime ➔ Change runtime type** and ensure **T4 GPU** is selected (it is free).
3. Run each cell sequentially:
   - **Step 1**: Installs `unsloth`, `trl`, `peft`, and `transformers`.
   - **Step 2**: Loads `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit` in 4-bit precision.
   - **Step 3**: Injects QLoRA adapters ($r=16, \alpha=32$) on all linear projection layers.
   - **Step 4**: Downloads the verified HealthGrid clinical dataset from GitHub.
   - **Step 5**: Runs supervised fine-tuning (`SFTTrainer`) in ~15-20 minutes.
   - **Step 6**: Tests clinical reasoning, diagnostic differential, and generic price savings.
   - **Step 7**: Uploads the fine-tuned model to your **Hugging Face Hub** account.

---

## ☁️ Free-Tier Cloud Deployment for the Deployed Website

Once uploaded to Hugging Face Hub (e.g., `your-username/healthgrid-clinical-llama-3.1-8b`):

1. **Zero-Cost Serverless Inference**:
   Hugging Face automatically exposes your model via their **Free Serverless Inference API**:

   ```http
   POST https://router.huggingface.co/hf-inference/models/your-username/healthgrid-clinical-llama-3.1-8b
   Authorization: Bearer <YOUR_HF_TOKEN>
   ```

2. **Wire to HealthGrid Web & Mobile**:
   Update `frontend/.env` (and your Vercel Project Environment Variables):

   ```env
   VITE_HF_API_KEY=hf_yourWriteOrReadTokenHere
   VITE_HF_FINE_TUNED_MODEL=your-username/healthgrid-clinical-llama-3.1-8b
   ```

3. When set, HealthGrid's `aiService.ts` automatically routes complex clinical inquiries to your custom fine-tuned 8B model first, falling back to Groq LPU and Google Gemini.

---

## 📊 Dataset Composition

The training data (`data/healthgrid_clinical_agent_train.jsonl`) incorporates:

- **Medical-O1 Reasoning**: Clinical chain-of-thought (`<thought>...</thought>`) before generating final patient prose.
- **MedQA-USMLE**: Board-certified differential diagnoses and pharmacological mechanisms.
- **ChatDoctor**: Authentic doctor-patient bedside dialogues and active symptom listening.
- **Jan Aushadhi (PMBJP)**: Generic medicine substitutions with 50% to 90% cost savings against commercial brands.
- **DPDP Act 2023 & ABDM**: Zero-trust privacy defense rejecting unauthorized records disclosure attempts.
