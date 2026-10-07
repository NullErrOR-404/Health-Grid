"""
HealthGrid Clinical Agent - Hugging Face QLoRA Fine-Tuning Pipeline
===================================================================
Production-ready parameter-efficient fine-tuning (PEFT / QLoRA) script using
Hugging Face `transformers`, `peft`, `bitsandbytes`, and `trl.SFTTrainer`.

Base Model Target:
- unsloth/Llama-3.3-70B-Instruct-bnb-4bit (Enterprise) OR
- unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit (Edge / Local Deployment) OR
- Qwen/Qwen2.5-7B-Instruct

Capabilities Trained:
1. Two-tier permission gating (`request_user_confirmation` for mutations)
2. Zero-trust DPDP Act 2023 / ABDM authority impersonation defense
3. Jan Aushadhi PMBJP generic medicine lookup & MRP comparison
4. Bilingual vernacular bedside consultation (Tamil + English)
5. Longitudinal biometric vitals recording

Requirements:
    pip install torch transformers peft bitsandbytes datasets trl accelerate
"""

import os
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

# Configuration
MODEL_ID = os.environ.get("BASE_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct")
OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "./healthgrid-clinical-agent-adapter")
TRAIN_FILE = "data/healthgrid_clinical_agent_train.jsonl"
VAL_FILE = "data/healthgrid_clinical_agent_val.jsonl"

def train():
    print(f"[*] Initializing HealthGrid Clinical Agent QLoRA Training Pipeline...")
    print(f"[*] Base Model: {MODEL_ID}")
    print(f"[*] Training Data: {TRAIN_FILE}")

    # 1. 4-bit Quantization Config for low VRAM consumption (Runs on RTX 3090/4090 or T4/A10G)
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16 if torch.cuda.is_available() and torch.cuda.is_bf16_supported() else torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    # 2. Tokenizer Setup
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 3. Model Loading with 4-bit quantization
    device_map = "auto" if torch.cuda.is_available() else "cpu"
    print(f"[*] Loading model on device: {device_map}")
    
    # Check if GPU is present before attempting 4-bit load
    if torch.cuda.is_available():
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            quantization_config=bnb_config,
            device_map=device_map,
            trust_remote_code=True,
        )
        model = prepare_model_for_kbit_training(model)
    else:
        print("[!] No CUDA GPU detected. Running in verification / CPU mode.")
        return

    # 4. LoRA Adapter Configuration
    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # 5. Load Dataset
    dataset = load_dataset("json", data_files={"train": TRAIN_FILE, "validation": VAL_FILE})

    def format_chatml(batch):
        formatted_texts = []
        for conversation in batch["messages"]:
            text = tokenizer.apply_chat_template(conversation, tokenize=False, add_generation_prompt=False)
            formatted_texts.append(text)
        return {"text": formatted_texts}

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

    print("[*] Starting SFTTrainer execution...")
    trainer.train()
    
    # 8. Save Final Model Adapter
    print(f"[*] Saving fine-tuned LoRA adapter to {OUTPUT_DIR}...")
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("[SUCCESS] Fine-tuning completed successfully!")

if __name__ == "__main__":
    train()
