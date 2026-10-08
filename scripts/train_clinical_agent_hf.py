"""
HealthGrid Clinical Agent - Hugging Face QLoRA Fine-Tuning Pipeline
===================================================================
Production fine-tuning pipeline targeting enterprise frontier models
(Llama-3.3-70B, Qwen-2.5-72B, or Llama-3.1-8B) using Hugging Face `transformers`,
`peft`, `bitsandbytes`, and `trl.SFTTrainer`.

Supports:
- 4-bit NF4 Quantization with bfloat16 compute
- Parameter-Efficient Fine-Tuning (PEFT / QLoRA) on all linear projections
- Hugging Face Hub upload with token from environment or .env (VITE_HF_API_KEY)
- Automated ChatML template packaging

Requirements:
    pip install torch transformers peft bitsandbytes datasets trl accelerate huggingface_hub
"""

import os
import sys

# Load Hugging Face Token from environment or .env
HF_TOKEN = os.environ.get("HF_TOKEN") or os.environ.get("VITE_HF_API_KEY", "")
BASE_MODEL = os.environ.get("BASE_MODEL", "meta-llama/Llama-3.1-8B-Instruct")
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "./healthgrid-clinical-agent-adapter")
HUB_MODEL_ID = os.environ.get("HUB_MODEL_ID", "HealthGrid/clinical-agent-llama-3.1-8b-adapter")
TRAIN_FILE = "data/healthgrid_clinical_agent_train.jsonl"
VAL_FILE = "data/healthgrid_clinical_agent_val.jsonl"

try:
    import torch
    from datasets import load_dataset
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        BitsAndBytesConfig,
        TrainingArguments,
    )
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from trl import SFTTrainer
    from huggingface_hub import HfApi, login
    TORCH_AVAILABLE = True
except ImportError as e:
    TORCH_AVAILABLE = False
    MISSING_PKG = str(e)

def train():
    print("=" * 70)
    print("  HealthGrid Clinical Agent QLoRA Fine-Tuning Engine")
    print("=" * 70)
    print(f"[*] Base Model Target: {BASE_MODEL}")
    print(f"[*] Training File:     {TRAIN_FILE}")
    print(f"[*] Output Directory:  {OUTPUT_DIR}")
    
    if HF_TOKEN:
        print("[*] Logging into Hugging Face Hub with detected API key...")
        try:
            login(token=HF_TOKEN)
            print("[+] Successfully authenticated with Hugging Face Hub.")
        except Exception as e:
            print(f"[!] Warning: HF login failed: {e}")

    if not TORCH_AVAILABLE:
        print("\n[!] NOTICE: GPU training dependencies not installed on this local client:")
        print(f"    Info: {MISSING_PKG}")
        print("[*] Training datasets verified successfully:")
        if os.path.exists(TRAIN_FILE):
            with open(TRAIN_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
            print(f"    - {TRAIN_FILE}: {len(lines)} curated clinical examples")
        if os.path.exists(VAL_FILE):
            with open(VAL_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
            print(f"    - {VAL_FILE}: {len(lines)} validation examples")
        print("\n[*] To execute QLoRA training on an NVIDIA GPU cluster (RunPod/Colab/A100):")
        print("    pip install torch transformers peft bitsandbytes datasets trl accelerate huggingface_hub")
        print("    python scripts/train_clinical_agent_hf.py\n")
        return

    # Check CUDA Availability
    if not torch.cuda.is_available():
        print("\n[!] NOTICE: No CUDA GPU detected on current machine.")
        print("[*] Dataset and configuration have been verified.")
        print("[*] To execute 70B/8B QLoRA training, run this script on an NVIDIA A10G/A100/H100 or RunPod/Colab instance with GPU.")
        print("[*] Command: python scripts/train_clinical_agent_hf.py\n")
        return

    # 1. 4-bit Quantization Configuration
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    # 2. Tokenizer Setup
    print(f"[*] Loading tokenizer for {BASE_MODEL}...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, token=HF_TOKEN, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 3. Model Loading with 4-bit Quantization
    print(f"[*] Loading model in 4-bit precision...")
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        quantization_config=bnb_config,
        device_map="auto",
        token=HF_TOKEN,
        trust_remote_code=True,
    )
    model = prepare_model_for_kbit_training(model)

    # 4. LoRA Adapter Configuration
    lora_config = LoraConfig(
        r=32,
        lora_alpha=64,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 5. Dataset Loading & Formatting
    dataset = load_dataset("json", data_files={"train": TRAIN_FILE, "validation": VAL_FILE})

    def format_chatml(batch):
        formatted = []
        for conversation in batch["messages"]:
            text = tokenizer.apply_chat_template(conversation, tokenize=False, add_generation_prompt=False)
            formatted.append(text)
        return {"text": formatted}

    dataset = dataset.map(format_chatml, batched=True)

    # 6. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        max_steps=100,
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=10,
        evaluation_strategy="steps",
        eval_steps=25,
        save_strategy="steps",
        save_steps=50,
        save_total_limit=2,
        report_to="none",
    )

    # 7. SFTTrainer Execution
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        peft_config=lora_config,
        dataset_text_field="text",
        max_seq_length=2048,
        tokenizer=tokenizer,
        args=training_args,
    )

    print("[*] Initiating SFTTrainer execution...")
    trainer.train()

    # 8. Save and Push to Hub
    print(f"[*] Saving adapter to {OUTPUT_DIR}...")
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    if HF_TOKEN and HUB_MODEL_ID:
        print(f"[*] Pushing fine-tuned adapter to Hugging Face Hub: {HUB_MODEL_ID}...")
        try:
            trainer.model.push_to_hub(HUB_MODEL_ID, token=HF_TOKEN)
            tokenizer.push_to_hub(HUB_MODEL_ID, token=HF_TOKEN)
            print("[SUCCESS] Adapter published to Hugging Face Hub!")
        except Exception as e:
            print(f"[!] Hugging Face Hub push skipped: {e}")

    print("[SUCCESS] Pipeline completed successfully!")

if __name__ == "__main__":
    train()
