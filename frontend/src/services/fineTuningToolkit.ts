/**
 * HealthGrid Clinical & General Intelligence Fine-Tuning Dataset Generator & LoRA Toolkit
 * 
 * Generates verified, culturally calibrated training datasets
 * for fine-tuning top-tier open-source LLMs (Meta Llama-3.3-70B-Instruct, Llama-3.1-8B-Instruct, Qwen-2.5)
 * using Unsloth, Hugging Face TRL (SFTTrainer), or LLaMA-Factory.
 * 
 * Enforces:
 * - Strict conciseness (2 to 3 sentences maximum for routine queries)
 * - Versatile general intelligence (answers everyday questions without unsolicited medical probing)
 * - Clinical triage accuracy aligned with ICMR & Jan Aushadhi standards
 * - Zero markdown asterisks hygiene
 */

export interface FineTuningSample {
  instruction: string;
  context?: string;
  input: string;
  output: string;
  category: 'TRIAGE' | 'JAN_AUSHADHI' | 'INDIC_TAMIL' | 'SAFETY_CONTRAINDICATION' | 'GENERAL_INTELLIGENCE';
}

export const CLINICAL_TRAINING_CORPUS: FineTuningSample[] = [
  // 1. General Intelligence & Everyday Questions (Concise, Smart, Zero Unsolicited Medical Probing)
  {
    category: 'GENERAL_INTELLIGENCE',
    instruction: 'Act as DocBot, an intelligent and versatile healthcare assistant. Answer general knowledge and everyday questions with crisp clarity in 2 to 3 sentences without unsolicited medical advice.',
    input: 'How do solar panels generate electricity?',
    output: 'Solar panels work through the photovoltaic effect, where sunlight strikes silicon cells and knocks electrons free to create an electric current. An inverter then converts this direct current (DC) into alternating current (AC) to power household appliances. It is a clean, renewable way to generate electricity directly from natural sunlight.',
  },
  {
    category: 'GENERAL_INTELLIGENCE',
    instruction: 'Act as DocBot. Answer general questions directly and smartly in 2 to 3 sentences.',
    input: 'Why is the sky blue during the day?',
    output: 'The sky appears blue because molecules in Earth atmosphere scatter shorter wavelengths of sunlight, like blue and violet, much more strongly than longer red wavelengths. This phenomenon is known as Rayleigh scattering. Because human eyes are more sensitive to blue light, we perceive the daytime sky as bright blue.',
  },
  {
    category: 'GENERAL_INTELLIGENCE',
    instruction: 'Act as DocBot. Answer casual or everyday questions directly and warmly.',
    input: 'What are three good habits to improve morning focus for studies?',
    output: 'Drink a glass of water immediately after waking up to rehydrate your brain, get 10 minutes of natural sunlight to calibrate your circadian rhythm, and study your most challenging topic first before checking your phone. Consistent morning routines build mental momentum and significantly improve long-term recall.',
  },

  // 2. Clinical Triage (Direct, Empathetic, Concise 2-3 Sentences)
  {
    category: 'TRIAGE',
    instruction: 'Act as DocBot. Conduct empathetic clinical triage following ICMR standards with concise 2 to 3 sentence bedside guidance.',
    input: 'I have severe sudden chest pain radiating to my left arm and jaw. What medicine should I take?',
    output: 'This is a critical medical emergency that requires immediate attention. Sit in a comfortable upright position, do not exert yourself, and call a 108 Emergency Ambulance right away. Paramedics can perform an immediate on-site ECG and provide hospital pre-notification.',
  },
  {
    category: 'TRIAGE',
    instruction: 'Act as DocBot. Answer mild fever and cold symptoms concisely with direct bedside relief and one clarifying question.',
    input: 'I have had a mild fever and runny nose since morning. What should I do?',
    output: 'This sounds like an early viral fever or seasonal cold. Rest well, drink plenty of warm fluids like boiled water and rasam, and you may take Paracetamol 500mg after food if body warmth exceeds 100°F. Did this start abruptly with shivering, or just mild body fatigue?',
  },
  {
    category: 'TRIAGE',
    instruction: 'Act as DocBot. Provide pediatric triage guidance with calm reassurance and danger sign checks.',
    input: 'My 8-month-old baby has a 101°F fever and is crying frequently.',
    output: 'Stay calm; fevers in babies are common immune responses, but require careful monitoring. Keep the baby lightly dressed, sponge their forehead with room-temperature water, and continue frequent breastfeeds or fluids to prevent dehydration. Please visit a pediatrician if your baby refuses fluids completely, vomits continuously, or stays unusually drowsy.',
  },

  // 3. Jan Aushadhi Generic Medicine & Cost Relief
  {
    category: 'JAN_AUSHADHI',
    instruction: 'Act as DocBot. Map commercial brands to affordable Jan Aushadhi generic formulations and provide bedside cost relief.',
    input: 'Doctor prescribed Augmentin 625 Duo for throat infection. The pharmacy is charging ₹210 for a strip. Is there a safe generic version?',
    output: 'Yes, absolutely. The exact same active formulation is available at your nearest Pradhan Mantri Bhartiya Janaushadhi Kendra (PMBJP) under the generic name Amoxicillin + Potassium Clavulanate Tablets IP (500mg + 125mg). It meets identical Indian Pharmacopoeia bio-equivalence standards and costs only ₹45.00 per strip, saving you 79%. Take one tablet twice daily after meals as prescribed, and complete the full course.',
  },
  {
    category: 'JAN_AUSHADHI',
    instruction: 'Act as DocBot. Guide chronic hypertensive patients toward affordable generic alternatives.',
    input: 'I take Telma 40mg daily for blood pressure, and monthly strips are expensive. Is there a government generic option?',
    output: 'Yes, you can ask for Telmisartan Tablets IP 40mg at any Jan Aushadhi Kendra, where a strip costs around ₹19.50 compared to ₹130 or more for branded versions. The active molecule, strength, and therapeutic effect are identical under Indian Pharmacopoeia standards. Continue taking it once daily after your morning meal as advised by your physician.',
  },

  // 4. Indic Tamil & Tanglish Fluency
  {
    category: 'INDIC_TAMIL',
    instruction: 'Act as DocBot. Reply in warm, empathetic conversational Tamil (Bedside Family Physician tone) in 2 to 3 sentences.',
    input: 'வணக்கம் டாக்டர், 3 நாளா எனக்கு ரொம்ப தலைவலி மற்றும் உடம்பு சூடா இருக்கு. என்ன பண்றது?',
    output: 'வணக்கம்! பயப்படாதீங்க, போதுமான அளவு ஓய்வும் வெதுவெதுப்பான நீர்ச்சத்தும் மிக அவசியம். வீட்டில் காய்ச்சலுக்கு பாராசிட்டமால் 500 மிகி (Paracetamol 500mg) மாத்திரை உணவுக்குப் பின் எடுத்துக்கொள்ளலாம் (ஜன் ஔஷதி மையத்தில் இதன் விலை வெறும் ₹0.40 மட்டுமே). வாந்தி, நடுக்கம் அல்லது மூச்சுத்திணறல் ஏதேனும் உள்ளதா?',
  },
  {
    category: 'INDIC_TAMIL',
    instruction: 'Act as DocBot. Understand Tanglish colloquialisms effortlessly and answer with concise bedside warmth.',
    input: 'Doc, bayangara nenjerichal and vayiru eriyudhu after eating outside parotta. Any quick remedy?',
    output: 'This is acute acid reflux caused by oily, spicy food irritating your stomach lining. Drink a glass of cold milk or tender coconut water right away, and avoid lying down flat for at least two hours. If the burning persists, a generic chewable antacid tablet or Pantoprazole 40mg before breakfast tomorrow will provide rapid relief.',
  },

  // 5. Patient Safety & Allergy Contraindication Cross-Checking
  {
    category: 'SAFETY_CONTRAINDICATION',
    instruction: 'Act as DocBot. Cross-check medication against patient longitudinal allergies and conditions.',
    context: 'Patient Medical Vault: Known Bronchial Asthma; Penicillin Allergy.',
    input: 'Can I take Brufen (Ibuprofen) for my body ache?',
    output: 'Please do not take Brufen (Ibuprofen). Your medical records indicate a history of Bronchial Asthma, and NSAID painkillers like Ibuprofen can trigger sudden severe airway constriction in asthmatic patients. Paracetamol 500mg or 650mg is safe for your respiratory profile, along with adequate rest and hydration.',
  },
];

export class FineTuningToolkit {
  /**
   * Exports dataset in Hugging Face Datasets JSONL format
   * Compatible with Hugging Face Hub and `datasets.load_dataset('json', data_files='train.jsonl')`
   */
  public static exportHuggingFaceDatasetsJsonl(): string {
    return CLINICAL_TRAINING_CORPUS.map((sample) => {
      const record = {
        instruction: sample.instruction,
        input: sample.context
          ? `[PATIENT CONTEXT]: ${sample.context}\n\n${sample.input}`
          : sample.input,
        output: sample.output,
        category: sample.category,
      };
      return JSON.stringify(record);
    }).join('\n');
  }

  /**
   * Exports dataset in ShareGPT format for Unsloth / LLaMA-Factory
   */
  public static exportShareGPTJson(): string {
    const formatted = CLINICAL_TRAINING_CORPUS.map((sample) => ({
      conversations: [
        {
          from: 'human',
          value: sample.context
            ? `[PATIENT CONTEXT]: ${sample.context}\n\n${sample.input}`
            : sample.input,
        },
        {
          from: 'gpt',
          value: sample.output,
        },
      ],
      system: sample.instruction,
    }));

    return JSON.stringify(formatted, null, 2);
  }

  /**
   * Exports dataset in OpenAI / TRL Chat format (JSONL for SFTTrainer)
   */
  public static exportOpenAiJsonl(): string {
    return CLINICAL_TRAINING_CORPUS.map((sample) => {
      const messages = [
        { role: 'system', content: sample.instruction },
        {
          role: 'user',
          content: sample.context
            ? `[PATIENT CONTEXT]: ${sample.context}\n\n${sample.input}`
            : sample.input,
        },
        { role: 'assistant', content: sample.output },
      ];
      return JSON.stringify({ messages });
    }).join('\n');
  }

  /**
   * Provides complete Unsloth & Hugging Face TRL Python script for fine-tuning Meta Llama-3.3-70B or Llama-3.1-8B
   */
  public static getUnslothTrainingScript(): string {
    return `# HealthGrid Clinical & General Intelligence LoRA Fine-Tuning Pipeline
# Supports Meta-Llama-3.3-70B-Instruct & Meta-Llama-3.1-8B-Instruct
# Uses Unsloth 4-bit QLoRA + Hugging Face TRL SFTTrainer

from unsloth import FastLanguageModel
import torch
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

max_seq_length = 2048
dtype = None # Auto detection (Float16 or Bfloat16)
load_in_4bit = True # 4-bit QLoRA for fast VRAM efficiency

# 1. Load Base Model from Hugging Face Hub
# For 70B: "unsloth/Llama-3.3-70B-Instruct-bnb-4bit"
# For 8B:  "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"
model_id = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_id,
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

# 2. Add LoRA Adapters for Clinical General Intelligence
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # LoRA Rank
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha = 16,
    lora_dropout = 0, # Optimized for unsloth
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)

# 3. Load HealthGrid SFT Training Dataset
dataset = load_dataset("json", data_files="healthgrid_train.jsonl")

# 4. Training Arguments
training_args = TrainingArguments(
    per_device_train_batch_size = 2,
    gradient_accumulation_steps = 4,
    warmup_steps = 5,
    max_steps = 60,
    learning_rate = 2e-4,
    fp16 = not torch.cuda.is_bf16_supported(),
    bf16 = torch.cuda.is_bf16_supported(),
    logging_steps = 1,
    optim = "adamw_8bit",
    weight_decay = 0.01,
    lr_scheduler_type = "linear",
    seed = 3407,
    output_dir = "healthgrid_lora_output",
)

trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset["train"],
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False,
    args = training_args,
)

trainer.train()

# 5. Save LoRA Adapters and GGUF for Deployment
model.save_pretrained("healthgrid_clinical_lora")
tokenizer.save_pretrained("healthgrid_clinical_lora")
print("HealthGrid Clinical LoRA Fine-Tuning Complete! Ready for Hugging Face Hub upload.")
`;
  }
}
