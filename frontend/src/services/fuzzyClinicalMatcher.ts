/**
 * HealthGrid Fuzzy Clinical Matcher & Phonetic Typo Normalizer
 * 
 * Solves messy patient input (misspellings, phonetic Tanglish, missing vowels, typos)
 * and grounds fuzzy patient complaints into standardized clinical concepts and authentic
 * Indian Pharmacopoeia / Jan Aushadhi (PMBJP) entities.
 * 
 * Examples:
 * - "paracitamol 650" -> "Paracetamol 650mg"
 * - "doloo" -> "Dolo 650 (Paracetamol)"
 * - "metformn" -> "Metformin 500mg"
 * - "stomac pen" -> "Stomach pain"
 * - "headik" / "mandai idi" -> "Severe Headache"
 * - "vomtin" -> "Nausea & Vomiting"
 * - "nenj erichal" -> "Heartburn / Acidity (GERD)"
 * - "bp presure" -> "High Blood Pressure (Hypertension)"
 * - "shuger" / "sarkarai" -> "Diabetes / Blood Sugar"
 */

export interface FuzzyMatchResult {
  original: string;
  corrected: string;
  category: 'MEDICINE' | 'SYMPTOM' | 'FACILITY' | 'METRIC';
  similarity: number;
}

export interface StandardClinicalTerm {
  canonical: string;
  category: 'MEDICINE' | 'SYMPTOM' | 'FACILITY' | 'METRIC';
  aliases: string[];
  description: string;
}

export const CLINICAL_DICTIONARY: StandardClinicalTerm[] = [
  // --- MEDICINES & FORMULATIONS ---
  {
    canonical: 'Paracetamol 650mg',
    category: 'MEDICINE',
    aliases: ['paracetamol', 'paracitamol', 'paracitamal', 'parcetamol', 'dolo', 'doloo', 'dolo 650', 'calpol', 'calpol 650', 'crocin', 'pacimol', 'fever tablet', 'kaichal marunthu'],
    description: 'First-line fever & pain reliever. Certified Jan Aushadhi generic: ₹0.42/tablet.',
  },
  {
    canonical: 'Metformin 500mg',
    category: 'MEDICINE',
    aliases: ['metformin', 'metformn', 'metaformin', 'glycomet', 'glyciphage', 'glycomet 500', 'sugar tablet', 'diabetes pill'],
    description: 'First-line oral blood sugar medicine for Type 2 diabetes. Jan Aushadhi: ₹0.75/tablet.',
  },
  {
    canonical: 'Telmisartan 40mg',
    category: 'MEDICINE',
    aliases: ['telmisartan', 'telmisartin', 'telma', 'telma 40', 'telmikind', 'micardis', 'bp tablet', 'pressure pill'],
    description: 'Cardioprotective blood pressure regulator. Jan Aushadhi: ₹1.30/tablet.',
  },
  {
    canonical: 'Amlodipine 5mg',
    category: 'MEDICINE',
    aliases: ['amlodipine', 'amlodapin', 'amlong', 'amlong 5', 'stamlo', 'amlovas', 'calcium channel blocker'],
    description: 'Arterial blood pressure regulation. Jan Aushadhi: ₹0.53/tablet.',
  },
  {
    canonical: 'Atorvastatin 10mg',
    category: 'MEDICINE',
    aliases: ['atorvastatin', 'atorvastin', 'atorva', 'atorva 10', 'lipitor', 'storvas', 'cholesterol tablet'],
    description: 'Statin for LDL cholesterol control. Jan Aushadhi: ₹1.46/tablet.',
  },
  {
    canonical: 'Pantoprazole 40mg',
    category: 'MEDICINE',
    aliases: ['pantoprazole', 'pantoprozol', 'pantocid', 'pantocid 40', 'pan 40', 'pantodac', 'acidity tablet', 'gas pill'],
    description: 'Proton pump inhibitor for severe heartburn and hyperacidity. Jan Aushadhi: ₹1.80/tablet.',
  },
  {
    canonical: 'Azithromycin 500mg',
    category: 'MEDICINE',
    aliases: ['azithromycin', 'azithromicin', 'azithral', 'azithral 500', 'azee', 'azee 500', 'zithromax', 'throat infection antibiotic'],
    description: 'Broad-spectrum macrolide antibiotic safe for penicillin allergy. Jan Aushadhi: ₹5.60/tablet.',
  },
  {
    canonical: 'Levosalbutamol Inhaler',
    category: 'MEDICINE',
    aliases: ['levosalbutamol', 'levolin', 'levolin inhaler', 'salbutamol', 'asthalin', 'inhaler', 'puffer', 'wheezing pump'],
    description: 'Rapid-acting bronchodilator for asthma and wheezing. Jan Aushadhi: ₹55.00/canister.',
  },
  {
    canonical: 'Oral Rehydration Salts (ORS)',
    category: 'MEDICINE',
    aliases: ['ors', 'ors liquid', 'electral', 'w-h-o ors', 'dehydration powder', 'hydration salt', 'salt sugar water'],
    description: 'WHO-standard electrolyte replacement for diarrhea, vomiting, and heat exhaustion.',
  },
  {
    canonical: 'Cetirizine 10mg',
    category: 'MEDICINE',
    aliases: ['cetirizine', 'cetzine', 'okacet', 'zyrtec', 'allergy tablet', 'cold allergy pill', 'sneezing tablet'],
    description: 'Non-drowsy antihistamine for allergic rhinitis, hives, and pollen allergy. Jan Aushadhi: ₹0.45/tablet.',
  },
  {
    canonical: 'Omeprazole 20mg',
    category: 'MEDICINE',
    aliases: ['omeprazole', 'omee', 'omiz', 'omiprazol', 'omez', 'acidity capsule'],
    description: 'Gastric acid secretion inhibitor for ulcers and reflux. Jan Aushadhi: ₹0.62/capsule.',
  },
  {
    canonical: 'Ondansetron 4mg',
    category: 'MEDICINE',
    aliases: ['ondansetron', 'ondem', 'avomin', 'vomit tablet', 'vomikind', 'emigo', 'nausea pill'],
    description: 'Anti-emetic for severe nausea and acute vomiting. Jan Aushadhi: ₹0.85/tablet.',
  },
  {
    canonical: 'Diclofenac Topical Gel',
    category: 'MEDICINE',
    aliases: ['volini', 'moov', 'pain spray', 'diclofenac gel', 'pain balm', 'thailam', 'pain gel', 'iodex'],
    description: 'Fast-acting topical anti-inflammatory gel for muscle and joint aches. Jan Aushadhi: ₹22.00/30g tube.',
  },
  {
    canonical: 'Aspirin 75mg',
    category: 'MEDICINE',
    aliases: ['aspirin', 'ecosprin', 'ecosprin 75', 'blood thinner', 'disprin', 'cardiac aspirin'],
    description: 'Antiplatelet emergency cardioprotection for suspected heart attacks. Jan Aushadhi: ₹0.35/tablet.',
  },
  {
    canonical: 'Ciprofloxacin 500mg',
    category: 'MEDICINE',
    aliases: ['ciprofloxacin', 'cipro', 'cifran', 'cirox', 'ciproflox', 'infection antibiotic'],
    description: 'Broad fluoroquinolone antibiotic for bacterial gastroenteritis and urinary infections. Jan Aushadhi: ₹2.20/tablet.',
  },
  {
    canonical: 'Amoxicillin-Clavulanic Acid 625mg',
    category: 'MEDICINE',
    aliases: ['amoxicillin', 'amox clav', 'augmentin', 'moxikind cv', 'clavum 625', 'mega antibiotic'],
    description: 'First-line protected penicillin for respiratory, ENT, and dental infections. Jan Aushadhi: ₹6.00/tablet.',
  },

  // --- CLINICAL SYMPTOMS & COMPLAINTS ---
  {
    canonical: 'Severe Headache',
    category: 'SYMPTOM',
    aliases: ['headache', 'headik', 'head ache', 'hedache', 'hedik', 'thala vali', 'thalavali', 'mandai idi', 'manda idi', 'migraine', 'throbbing head'],
    description: 'Tension headache, migraine, dehydration, or eye strain.',
  },
  {
    canonical: 'High Fever & Chills',
    category: 'SYMPTOM',
    aliases: ['fever', 'fevr', 'high fever', 'feever', 'kaichal', 'kaisal', 'udambu kaichal', 'sali kaichal', 'temperature', 'chills', 'kulir kaichal', 'nadukka kaaichal'],
    description: 'Elevated body temperature indicating viral infection, dengue, or bacterial illness.',
  },
  {
    canonical: 'Chest Pain / Discomfort',
    category: 'SYMPTOM',
    aliases: ['chest pain', 'chest painn', 'chestpan', 'chest heaviness', 'nenju vali', 'nenjula vali', 'nenju barama irukku', 'heart pain', 'angina', 'crushing chest'],
    description: 'Potential acute coronary syndrome or angina requiring urgent triage.',
  },
  {
    canonical: 'Difficulty Breathing / Shortness of Breath',
    category: 'SYMPTOM',
    aliases: ['shortness of breath', 'breathless', 'cannot breathe', 'breathlessness', 'moochu thinaral', 'moochu vida kashtam', 'kashta moochu', 'wheezing', 'huffing', 'gasping'],
    description: 'Bronchospasm, asthma flare-up, or cardiopulmonary compromise.',
  },
  {
    canonical: 'Stomach Pain & Cramps',
    category: 'SYMPTOM',
    aliases: ['stomach pain', 'stomac pen', 'stomach ache', 'vayiru vali', 'vayithu vali', 'abdominal pain', 'belly ache', 'stomach cramps'],
    description: 'Gastric irritation, food poisoning, infection, or indigestion.',
  },
  {
    canonical: 'Nausea & Vomiting',
    category: 'SYMPTOM',
    aliases: ['vomiting', 'vomtin', 'vomit', 'vomitting', 'kumattal', 'vayiru perattuthu', 'nausea', 'throwing up', 'nauseous'],
    description: 'Upper gastrointestinal distress, gastroenteritis, or inner ear disturbance.',
  },
  {
    canonical: 'Heartburn & Acidity (GERD)',
    category: 'SYMPTOM',
    aliases: ['acidity', 'acidty', 'gas trouble', 'nenjerichal', 'nenju erichal', 'heart burn', 'heartburn', 'sour burps', 'reflux'],
    description: 'Acid reflux or dyspepsia exacerbated by spicy foods or late meals.',
  },
  {
    canonical: 'Diarrhea / Loose Stools',
    category: 'SYMPTOM',
    aliases: ['diarrhea', 'diarrhoea', 'loose motion', 'loose stools', 'vethanai', 'vayithale poguthu', 'watery stools', 'dysentery'],
    description: 'Frequent loose stools carrying risk of rapid dehydration.',
  },
  {
    canonical: 'Dysentery / Blood in Stool',
    category: 'SYMPTOM',
    aliases: ['blood in stool', 'seethabethi', 'rathabethi', 'bleeding stool', 'malathil ratham', 'red stool'],
    description: 'Bacterial dysentery or internal gastrointestinal bleed requiring physical triage.',
  },
  {
    canonical: 'Back Pain / Lumbar Strain',
    category: 'SYMPTOM',
    aliases: ['back pain', 'mudhugu vali', 'mutthu vali', 'nadum vali', 'lower back pain', 'spine pain', 'iduppu vali', 'lumbago'],
    description: 'Musculoskeletal lumbar strain, posture fatigue, or radiculopathy.',
  },
  {
    canonical: 'Joint & Leg Pain',
    category: 'SYMPTOM',
    aliases: ['joint pain', 'knee pain', 'kaal vali', 'kal vali', 'kaal erichal', 'mootu vali', 'moottu vali', 'sandhu vali', 'arthritis'],
    description: 'Osteoarthritis, diabetic peripheral neuropathy, or viral arthralgia.',
  },
  {
    canonical: 'Eye Irritation & Burning',
    category: 'SYMPTOM',
    aliases: ['eye burning', 'kan erichal', 'kannu erichal', 'kan kuru kuru', 'red eye', 'kan sivanthu', 'watery eyes', 'conjunctivitis'],
    description: 'Conjunctival irritation, screen strain, or infectious red eye.',
  },
  {
    canonical: 'Urinary Pain & Burning (UTI)',
    category: 'SYMPTOM',
    aliases: ['urine burning', 'neer kaduppu', 'siruneer erichal', 'onukku erichal', 'painful urination', 'uti', 'neer erichal'],
    description: 'Urinary tract infection or dehydration dysuria.',
  },
  {
    canonical: 'Dizziness & Vertigo',
    category: 'SYMPTOM',
    aliases: ['dizziness', 'giddiness', 'thalasuthal', 'thala suthal', 'kirukiruppu', 'kanna kattu', 'fainting', 'vertigo', ' चक्कर '],
    description: 'Hypotension, hypoglycemia, inner ear vertigo, or presyncope.',
  },
  {
    canonical: 'Sore Throat & Cough',
    category: 'SYMPTOM',
    aliases: ['sore throat', 'thondai kattu', 'thondai vali', 'thondai kara kara', 'throat pain', 'dry cough', 'irumal', 'varattu irumal'],
    description: 'Pharyngitis, upper respiratory viral infection, or tonsillitis.',
  },
  {
    canonical: 'Skin Rash & Itching',
    category: 'SYMPTOM',
    aliases: ['skin rash', 'itching', 'aripu', 'sori sirangu', 'dhinavu', 'dhadhu', 'skin allergy', 'hives', 'urticaria'],
    description: 'Allergic dermatitis, scabies, heat rash, or fungal infection.',
  },
  {
    canonical: 'Mouth Ulcers & Stomatitis',
    category: 'SYMPTOM',
    aliases: ['mouth ulcer', 'vaai punnu', 'naakku punnu', 'mouth sores', 'stomatitis', 'aphthous ulcer'],
    description: 'Nutritional B-complex deficiency or stress-induced aphthous ulcers.',
  },
  {
    canonical: 'Heat Exhaustion / Sunstroke',
    category: 'SYMPTOM',
    aliases: ['heat stroke', 'soodu kaachal', 'veiyil adichu', 'dehydration fatigue', 'udambu soodu'],
    description: 'Excessive heat exposure and dehydration in tropical weather.',
  },
  {
    canonical: 'High Blood Pressure',
    category: 'METRIC',
    aliases: ['high bp', 'bp high', 'blood pressure', 'bp presure', 'pressure', 'high pressure', 'hypertension', 'systolic high'],
    description: 'Arterial blood pressure exceeding normal baseline (e.g. >140/90 mmHg).',
  },
  {
    canonical: 'High Blood Sugar / Diabetes',
    category: 'METRIC',
    aliases: ['high sugar', 'shuger', 'sugar level', 'blood sugar', 'diabetes', 'diabetic', 'sarkarai', 'hba1c high', 'fasting sugar'],
    description: 'Elevated glucose levels requiring lifestyle or pharmacological adjustment.',
  },

  // --- HEALTHCARE FACILITIES & RADAR ---
  {
    canonical: 'Rajiv Gandhi Government General Hospital (RGGGH / GH)',
    category: 'FACILITY',
    aliases: ['rgggh', 'chennai gh', 'madras medical college', 'gh hospital', 'central hospital', 'govt general hospital'],
    description: '24/7 Level 1 Trauma, Cardiac Cath Lab, Stroke Unit, and Casualty.',
  },
  {
    canonical: 'Government Stanley Medical College Hospital',
    category: 'FACILITY',
    aliases: ['stanley', 'stanley hospital', 'royapuram gh', 'stanley medical college'],
    description: '24/7 Casualty, regional infectious disease center, gastroenterology.',
  },
  {
    canonical: 'Government Kilpauk Medical College Hospital (KMC)',
    category: 'FACILITY',
    aliases: ['kmc', 'kilpauk hospital', 'kilpauk medical college', 'kmc hospital', 'burns center', 'kilpauk casualty'],
    description: '24/7 Apex burns center, trauma, emergency obstetrics, and casualty.',
  },
  {
    canonical: 'Coimbatore Medical College Hospital (CMCH)',
    category: 'FACILITY',
    aliases: ['cmch', 'coimbatore gh', 'coimbatore medical college', 'gh coimbatore', 'cmch casualty'],
    description: '24/7 Western Tamil Nadu tertiary apex trauma and multi-specialty casualty.',
  },
  {
    canonical: 'Madurai Government Rajaji Hospital (GRH)',
    category: 'FACILITY',
    aliases: ['grh', 'madurai gh', 'rajaji hospital', 'madurai medical college', 'grh casualty'],
    description: '24/7 Southern Tamil Nadu apex trauma, toxicology, and emergency casualty.',
  },
];

/**
 * Standard Levenshtein distance calculation between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Calculates string similarity ratio between 0.0 and 1.0
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return 0.85 + (minLen / maxLen) * 0.15;
  }

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

class FuzzyClinicalMatcher {
  private static instance: FuzzyClinicalMatcher;

  private constructor() {}

  public static getInstance(): FuzzyClinicalMatcher {
    if (!FuzzyClinicalMatcher.instance) {
      FuzzyClinicalMatcher.instance = new FuzzyClinicalMatcher();
    }
    return FuzzyClinicalMatcher.instance;
  }

  /**
   * Evaluates a user input word/phrase and matches to the nearest clinical concept
   */
  public findBestMatch(token: string): { match: StandardClinicalTerm; similarity: number } | null {
    const clean = token.toLowerCase().trim();
    if (clean.length < 3) return null;

    let bestScore = 0;
    let bestTerm: StandardClinicalTerm | null = null;

    for (const term of CLINICAL_DICTIONARY) {
      // 1. Check canonical
      const canonicalSim = calculateSimilarity(clean, term.canonical);
      if (canonicalSim > bestScore) {
        bestScore = canonicalSim;
        bestTerm = term;
      }

      // 2. Check aliases
      for (const alias of term.aliases) {
        const aliasSim = calculateSimilarity(clean, alias);
        if (aliasSim > bestScore) {
          bestScore = aliasSim;
          bestTerm = term;
        }
      }
    }

    if (bestTerm && bestScore >= 0.72) {
      return { match: bestTerm, similarity: bestScore };
    }

    return null;
  }

  /**
   * Scans a full multi-word patient query, detects fuzzy medical terms/symptoms,
   * and produces an enriched clinical grounding context for RAG and LLM prompts.
   */
  public enrichQueryWithFuzzyGrounding(query: string): {
    detectedEntities: FuzzyMatchResult[];
    groundedContextPrompt: string;
    normalizedSearchTokens: string[];
  } {
    const lower = query.toLowerCase();
    const detected: FuzzyMatchResult[] = [];
    const normalizedTokens = new Set<string>();

    for (const term of CLINICAL_DICTIONARY) {
      // Direct alias match or fuzzy phrase match
      for (const alias of term.aliases) {
        if (lower.includes(alias)) {
          detected.push({
            original: alias,
            corrected: term.canonical,
            category: term.category,
            similarity: 1.0,
          });
          normalizedTokens.add(term.canonical);
          break;
        } else {
          // Check words in query for close fuzzy match
          const queryWords = lower.split(/[\s,.;!?]+/);
          for (const word of queryWords) {
            if (word.length >= 4) {
              const sim = calculateSimilarity(word, alias);
              if (sim >= 0.78) {
                detected.push({
                  original: word,
                  corrected: term.canonical,
                  category: term.category,
                  similarity: sim,
                });
                normalizedTokens.add(term.canonical);
                break;
              }
            }
          }
        }
      }
    }

    // Deduplicate detected entities by canonical name
    const uniqueMap = new Map<string, FuzzyMatchResult>();
    for (const d of detected) {
      if (!uniqueMap.has(d.corrected) || (uniqueMap.get(d.corrected)?.similarity || 0) < d.similarity) {
        uniqueMap.set(d.corrected, d.corrected ? d : d);
      }
    }
    const finalEntities = Array.from(uniqueMap.values());

    let groundedContextPrompt = '';
    if (finalEntities.length > 0) {
      groundedContextPrompt = `\n[FUZZY CLINICAL CONCEPT GROUNDING]:\n` +
        finalEntities.map(e => `• Patient word "${e.original}" resolved to: "${e.corrected}" (${e.category}) with ${(e.similarity * 100).toFixed(0)}% confidence.`).join('\n') +
        `\nNote: Address this exact standardized clinical condition/medicine while speaking in simple everyday terms.\n`;
    }

    return {
      detectedEntities: finalEntities,
      groundedContextPrompt,
      normalizedSearchTokens: Array.from(normalizedTokens),
    };
  }
}

export const fuzzyClinicalMatcher = FuzzyClinicalMatcher.getInstance();
