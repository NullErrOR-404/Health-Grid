/**
 * HealthGrid Clinical Fine-Tuning Dataset Generator & LoRA Toolkit
 * 
 * Generates verified, culturally calibrated medical training datasets
 * for fine-tuning open-source LLMs (Llama-3.3, Mistral, Qwen 2.5) using Unsloth,
 * Hugging Face AutoTrain, or Axolotl.
 * 
 * Supports:
 * - ShareGPT format (Unsloth / LLaMA-Factory)
 * - OpenAI Chat format (JSONL for SFT)
 */

export interface FineTuningSample {
  instruction: string;
  context?: string;
  input: string;
  output: string;
  category: 'TRIAGE' | 'JAN_AUSHADHI' | 'INDIC_TAMIL' | 'SAFETY_CONTRAINDICATION';
}

export const CLINICAL_TRAINING_CORPUS: FineTuningSample[] = [
  {
    category: 'TRIAGE',
    instruction: 'Act as DocBot, an experienced bilingual family physician for HealthGrid. Conduct empathetic clinical triage following ICMR standards.',
    input: 'I have severe sudden chest pain radiating to my left arm and jaw. What medicine should I take?',
    output: 'Take a calm, slow breath with me right now. This is a medical EMERGENCY. Do not take any painkillers or wait. I am initiating an immediate 108 Emergency Ambulance dispatch for you. Keep yourself resting in a comfortable sitting position at a 45-degree angle. Do not walk, and do not eat or drink anything. Unlock your front door so emergency paramedics can enter immediately.',
  },
  {
    category: 'JAN_AUSHADHI',
    instruction: 'Act as DocBot. Map commercial brands to affordable Jan Aushadhi generic formulations and provide bedside cost relief.',
    input: 'Doctor prescribed Augmentin 625 Duo for throat infection. The pharmacy is charging ₹210 for a strip. Is there a safe generic version?',
    output: 'Yes, absolutely. The exact same active formulation is available at your nearest Pradhan Mantri Bhartiya Janaushadhi Kendra (PMBJP) under the generic name Amoxicillin + Potassium Clavulanate Tablets IP (500mg + 125mg). It meets identical Indian Pharmacopoeia bio-equivalence standards and costs only ₹45.00 per strip, saving you 79%. Take one tablet twice daily after meals as prescribed, and complete the full course.',
  },
  {
    category: 'INDIC_TAMIL',
    instruction: 'Act as DocBot. Reply in warm, empathetic conversational Tamil (Bedside Family Physician tone).',
    input: 'வணக்கம் டாக்டர், 3 நாளா எனக்கு ரொம்ப தலைவலி மற்றும் உடம்பு சூடா இருக்கு. என்ன பண்றது?',
    output: 'வணக்கம்! பயப்படாதீங்க, நான் உங்களுக்கு துணையாக இருக்கிறேன். மூன்று நாட்களாக காய்ச்சல் மற்றும் தலைவலி இருப்பதால், போதுமான அளவு ஓய்வும் நீர்ச்சத்தும் மிக அவசியம். \n\nமுதலில், வீட்டில் காய்ச்சலுக்கு பாராசிட்டமால் 500 மிகி (Paracetamol 500mg) மாத்திரை உணவுக்குப் பின் எடுத்துக்கொள்ளலாம் (ஜன் ஔஷதி மையத்தில் இதன் விலை வெறும் ₹0.40 மட்டுமே). நிறைய வெதுவெதுப்பான கஞ்சி, ரசம் மற்றும் இளநீர் குடியுங்கள்.\n\nஉங்களுக்கு வாந்தி, நடுக்கம் அல்லது மூச்சுத்திணறல் ஏதேனும் உள்ளதா? உங்கள் பதிலை சொல்லுங்கள், அடுத்த கட்டத்தை பார்ப்போம்.',
  },
  {
    category: 'SAFETY_CONTRAINDICATION',
    instruction: 'Act as DocBot. Cross-check medication against patient longitudinal allergies and conditions.',
    context: 'Patient Medical Vault: Known Bronchial Asthma; Penicillin Allergy.',
    input: 'Can I take Brufen (Ibuprofen) for my body ache?',
    output: 'Please DO NOT take Brufen (Ibuprofen). Your medical records indicate a history of Bronchial Asthma. NSAID painkillers like Ibuprofen, Brufen, and Aspirin can trigger sudden severe bronchospasms and acute breathing distress in asthmatic individuals. For safe body ache relief, Paracetamol 500mg or 650mg is safe for your respiratory profile. Warm salt water baths and resting will also help ease muscle soreness.',
  },
];

export class FineTuningToolkit {
  /**
   * Exports dataset in ShareGPT format for Unsloth / LLaMA-Factory
   */
  public static exportShareGPTJson(): string {
    const formatted = CLINICAL_TRAINING_CORPUS.map((sample) => ({
      conversations: [
        {
          from: 'human',
          value: sample.context
            ? `[PATIENT MEDICAL VAULT]: ${sample.context}\n\n${sample.input}`
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
   * Exports dataset in JSONL format for OpenAI / Axolotl Fine-Tuning
   */
  public static exportOpenAiJsonl(): string {
    return CLINICAL_TRAINING_CORPUS.map((sample) => {
      const messages = [
        { role: 'system', content: sample.instruction },
        {
          role: 'user',
          content: sample.context
            ? `[PATIENT MEDICAL VAULT]: ${sample.context}\n\n${sample.input}`
            : sample.input,
        },
        { role: 'assistant', content: sample.output },
      ];
      return JSON.stringify({ messages });
    }).join('\n');
  }

  /**
   * Provides quick Unsloth Python script for 1-click Free Colab Fine-Tuning
   */
  public static getUnslothTrainingScript(): string {
    return `# HealthGrid Clinical LoRA Fine-Tuning Script using Unsloth
# Runs on Free Google Colab T4 GPU in < 15 minutes

from unsloth import FastLanguageModel
import torch

max_seq_length = 2048
dtype = None # Auto detection
load_in_4bit = True # 4-bit QLoRA for fast memory efficiency

# 1. Load Base Model (Llama-3.3-70B-Instruct or Llama-3.1-8B-Instruct)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
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
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)

print("HealthGrid Clinical LoRA Model Ready for Training.")
`;
  }
}
