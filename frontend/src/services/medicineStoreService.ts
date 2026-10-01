/**
 * HealthGrid PMBJP Jan Aushadhi Generic Medicine Store Service
 * Provides authentic Indian Pharmacopoeia (IP) generic equivalents,
 * price comparison against top Indian brands, cart management,
 * and authenticated medical-ID order dispatch.
 */

export type ChronicCategory = 
  | 'all'
  | 'diabetes'
  | 'hypertension'
  | 'cardiac'
  | 'cholesterol'
  | 'gastro'
  | 'thyroid'
  | 'kidney'
  | 'antibiotics'
  | 'oncology'
  | 'respiratory'
  | 'neuro_psych';

export interface MedicineItem {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  form: 'Tablets' | 'Capsules' | 'Syrup' | 'Inhaler';
  packSize: string;
  brandPrice: number;
  genericPrice: number;
  savingsPercentage: number;
  category: ChronicCategory;
  requiresPrescription: boolean;
  scheduleH: boolean;
  whoGmpCertified: boolean;
  inStock: boolean;
  manufacturer: string;
  indicationsEn: string;
  indicationsTa: string;
}

export interface MedicineCartItem {
  medicine: MedicineItem;
  quantity: number;
}

export type DeliveryType = 'home_delivery' | 'kendra_pickup';
export type PaymentMethod = 'cod' | 'upi' | 'kendra_counter' | 'ayushman_card';

export interface JanAushadhiKendra {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  timings: string;
  distanceKm: number;
}

export interface MedicineOrder {
  id: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  healthId: string;
  deliveryType: DeliveryType;
  shippingAddress?: string;
  pincode?: string;
  kendra?: JanAushadhiKendra;
  paymentMethod: PaymentMethod;
  items: MedicineCartItem[];
  totalBrandPrice: number;
  totalGenericPrice: number;
  totalSavings: number;
  prescriptionName?: string;
  status: 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'DELIVERED';
  createdAt: string;
  estimatedDelivery: string;
  pickupToken?: string;
  verificationOtp?: string;
}

export interface ChronicRefillItem {
  id: string;
  medicineId: string;
  brandName: string;
  genericName: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1" or "Morning 1, Night 1"
  timing: string; // "After Food" / "Before Food"
  dailyPills: number; // e.g. 2
  stripsCount: number; // e.g. 3 strips (30 pills)
  pillsPerStrip: number; // e.g. 10
  startDate: string; // ISO string
  durationDays: number; // e.g. 30
  brandPricePerStrip: number;
  genericPricePerStrip: number;
  category: ChronicCategory;
}

export interface ChronicRefillSchedule {
  id: string;
  userId: string;
  medicalId: string;
  patientName: string;
  patientPhone: string;
  prescriptionId?: string;
  prescriptionDate?: string;
  doctorName?: string;
  createdAt: string;
  items: ChronicRefillItem[];
  preferredFulfillment: DeliveryType;
  preferredKendraId?: string;
  status: 'active' | 'paused' | 'completed';
  lastRefillDate?: string;
  totalMonthlyBrandCost: number;
  totalMonthlyGenericCost: number;
  totalMonthlySavings: number;
  notificationPreferences: {
    whatsapp: boolean;
    sms: boolean;
    calendar: boolean;
  };
}

// Curated high-impact lifelong chronic medicines with authentic PMBJP government price schedules
export const CHRONIC_MEDICINES_CATALOG: MedicineItem[] = [
  // 1. DIABETES
  {
    id: 'med-dia-01',
    brandName: 'Glycomet 500 / Glucophage',
    genericName: 'Metformin Hydrochloride Prolonged-Release Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 45.0,
    genericPrice: 7.5,
    savingsPercentage: 83,
    category: 'diabetes',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Type 2 Diabetes glycemic management',
    indicationsTa: 'இரத்த சர்க்கரை அளவை கட்டுப்படுத்த',
  },
  {
    id: 'med-dia-02',
    brandName: 'Glycomet GP 1 Duo',
    genericName: 'Glimepiride (1mg) + Metformin Hydrochloride (500mg)',
    dosage: '1mg + 500mg',
    form: 'Tablets',
    packSize: '15 Tablets / Strip',
    brandPrice: 125.0,
    genericPrice: 18.0,
    savingsPercentage: 86,
    category: 'diabetes',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Dual-action Blood Sugar regulation',
    indicationsTa: 'இருமுனை சர்க்கரை நோய் சிகிச்சை',
  },
  {
    id: 'med-dia-03',
    brandName: 'Januvia 100',
    genericName: 'Sitagliptin Phosphate Tablets IP',
    dosage: '100mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 380.0,
    genericPrice: 48.0,
    savingsPercentage: 87,
    category: 'diabetes',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'DPP-4 inhibitor for insulin secretion',
    indicationsTa: 'இன்சுலின் சுரப்பை சீராக்கும் நவீன மருந்து',
  },
  {
    id: 'med-dia-04',
    brandName: 'Galvus Met 50/500',
    genericName: 'Vildagliptin (50mg) + Metformin (500mg) Tablets',
    dosage: '50mg + 500mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 290.0,
    genericPrice: 38.0,
    savingsPercentage: 87,
    category: 'diabetes',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Combination therapy for resistant diabetes',
    indicationsTa: 'தீவிர நீரிழிவு நோய் கூட்டு மருந்து',
  },
  {
    id: 'med-dia-05',
    brandName: 'Forxiga 10',
    genericName: 'Dapagliflozin Tablets IP',
    dosage: '10mg',
    form: 'Tablets',
    packSize: '14 Tablets / Strip',
    brandPrice: 360.0,
    genericPrice: 42.0,
    savingsPercentage: 88,
    category: 'diabetes',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'SGLT2 inhibitor for renal glucose excretion',
    indicationsTa: 'சிறுநீரகம் வழியாக சர்க்கரை வெளியேற்றும் மருந்து',
  },

  // 2. HYPERTENSION & BLOOD PRESSURE
  {
    id: 'med-hyp-01',
    brandName: 'Telma 40 / Telmikind',
    genericName: 'Telmisartan Tablets IP',
    dosage: '40mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 140.0,
    genericPrice: 16.0,
    savingsPercentage: 88,
    category: 'hypertension',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Essential Hypertension & Cardiac protection',
    indicationsTa: 'இரத்த அழுத்த கட்டுப்பாடு & இதய பாதுகாப்பு',
  },
  {
    id: 'med-hyp-02',
    brandName: 'Telma AM',
    genericName: 'Telmisartan (40mg) + Amlodipine (5mg) Tablets',
    dosage: '40mg + 5mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 220.0,
    genericPrice: 26.0,
    savingsPercentage: 88,
    category: 'hypertension',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Dual-line high BP control',
    indicationsTa: 'தீவிர உயர் இரத்த அழுத்த கூட்டு மாத்திரை',
  },
  {
    id: 'med-hyp-03',
    brandName: 'Cilacar 10',
    genericName: 'Cilnidipine Tablets IP',
    dosage: '10mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 115.0,
    genericPrice: 18.0,
    savingsPercentage: 84,
    category: 'hypertension',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Kidney-friendly calcium channel blocker for BP',
    indicationsTa: 'சிறுநீரக பாதுகாப்புடன் கூடிய ரத்த அழுத்த மருந்து',
  },
  {
    id: 'med-hyp-04',
    brandName: 'Amlong 5',
    genericName: 'Amlodipine Besylate Tablets IP',
    dosage: '5mg',
    form: 'Tablets',
    packSize: '15 Tablets / Strip',
    brandPrice: 42.0,
    genericPrice: 6.0,
    savingsPercentage: 86,
    category: 'hypertension',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Peripheral vasodilation for high blood pressure',
    indicationsTa: 'இரத்த நாளங்களை விரிவுபடுத்தி அழுத்தத்தை குறைக்கும்',
  },
  {
    id: 'med-hyp-05',
    brandName: 'Concor 5',
    genericName: 'Bisoprolol Fumarate Tablets IP',
    dosage: '5mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 165.0,
    genericPrice: 22.0,
    savingsPercentage: 87,
    category: 'hypertension',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Beta-blocker for heart rate & blood pressure',
    indicationsTa: 'இதய துடிப்பு & இரத்த அழுத்த ஒழுங்குபடுத்தல்',
  },

  // 3. HEART CARE & CHOLESTEROL
  {
    id: 'med-car-01',
    brandName: 'Atorva 10 / Storvas',
    genericName: 'Atorvastatin Calcium Tablets IP',
    dosage: '10mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 175.0,
    genericPrice: 19.0,
    savingsPercentage: 89,
    category: 'cholesterol',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Lowers LDL bad cholesterol & prevents plaque',
    indicationsTa: 'கெட்ட கொழுப்பை குறைத்து மாரடைப்பை தடுக்கும்',
  },
  {
    id: 'med-car-02',
    brandName: 'Rosuvas 10 / Rozavel',
    genericName: 'Rosuvastatin Tablets IP',
    dosage: '10mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 240.0,
    genericPrice: 28.0,
    savingsPercentage: 88,
    category: 'cholesterol',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'High-potency statin for hyperlipidemia',
    indicationsTa: 'தீவிர கொழுப்பு குறைப்பு & இரத்தநாள பாதுகாப்பு',
  },
  {
    id: 'med-car-03',
    brandName: 'Ecosprin 75',
    genericName: 'Aspirin Gastro-Resistant Tablets IP',
    dosage: '75mg',
    form: 'Tablets',
    packSize: '14 Tablets / Strip',
    brandPrice: 18.0,
    genericPrice: 3.5,
    savingsPercentage: 81,
    category: 'cardiac',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Antiplatelet blood thinner preventing clots',
    indicationsTa: 'இரத்தம் உறைவதை தடுத்து மாரடைப்பு தடுக்கும் மாத்திரை',
  },
  {
    id: 'med-car-04',
    brandName: 'Clopilet 75',
    genericName: 'Clopidogrel Tablets IP',
    dosage: '75mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 110.0,
    genericPrice: 15.0,
    savingsPercentage: 86,
    category: 'cardiac',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Post-angioplasty arterial clot protection',
    indicationsTa: 'இதய ஸ்டென்ட் மற்றும் பைபாஸ் பின் இரத்த உறைவு தடுப்பு',
  },

  // 4. CHRONIC GASTRO & ACIDITY
  {
    id: 'med-gas-01',
    brandName: 'Pantocid 40 / Pan 40',
    genericName: 'Pantoprazole Gastro-Resistant Tablets IP',
    dosage: '40mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 165.0,
    genericPrice: 18.0,
    savingsPercentage: 89,
    category: 'gastro',
    requiresPrescription: false,
    scheduleH: false,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'GERD, chronic acid reflux & gastric ulcers',
    indicationsTa: 'நெஞ்செரிச்சல், குடல் புண் & அதிக அமிலத்தன்மை',
  },
  {
    id: 'med-gas-02',
    brandName: 'Razo 20 / Rabekind',
    genericName: 'Rabeprazole Sodium Tablets IP',
    dosage: '20mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 155.0,
    genericPrice: 17.0,
    savingsPercentage: 89,
    category: 'gastro',
    requiresPrescription: false,
    scheduleH: false,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Rapid relief for severe acidity and stomach pain',
    indicationsTa: 'உடனடி அமிலத்தன்மை மற்றும் வயிற்று வலி நிவாரணம்',
  },

  // 5. THYROID
  {
    id: 'med-thy-01',
    brandName: 'Thyronorm 50 / Eltroxin',
    genericName: 'Thyroxine Sodium Tablets IP',
    dosage: '50mcg',
    form: 'Tablets',
    packSize: '100 Tablets / Bottle',
    brandPrice: 180.0,
    genericPrice: 32.0,
    savingsPercentage: 82,
    category: 'thyroid',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Hypothyroidism hormone replacement therapy',
    indicationsTa: 'தைராய்டு குறைபாடு ஹார்மோன் மாத்திரை',
  },
  {
    id: 'med-thy-02',
    brandName: 'Thyronorm 100',
    genericName: 'Thyroxine Sodium Tablets IP',
    dosage: '100mcg',
    form: 'Tablets',
    packSize: '100 Tablets / Bottle',
    brandPrice: 220.0,
    genericPrice: 38.0,
    savingsPercentage: 83,
    category: 'thyroid',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'High-strength Hypothyroidism hormone therapy',
    indicationsTa: 'அதிக அளவு தைராய்டு ஹார்மோன் மாத்திரை',
  },

  // 6. KIDNEY & URIC ACID
  {
    id: 'med-kid-01',
    brandName: 'Febutaz 40 / Zurig',
    genericName: 'Febuxostat Tablets IP',
    dosage: '40mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 195.0,
    genericPrice: 26.0,
    savingsPercentage: 87,
    category: 'kidney',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Hyperuricemia & chronic Gout arthritis',
    indicationsTa: 'யூரிக் அமிலம் குறைப்பு & மூட்டு வலி நிவாரணம்',
  },

  // 7. ANTIBIOTICS & ACUTE INFECTIONS
  {
    id: 'med-ant-01',
    brandName: 'Augmentin 625 Duo / Moxikind-CV',
    genericName: 'Amoxicillin (500mg) + Potassium Clavulanate (125mg) IP',
    dosage: '625mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 204.0,
    genericPrice: 32.0,
    savingsPercentage: 84,
    category: 'antibiotics',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Broad-spectrum antibiotic for bacterial & ENT infections',
    indicationsTa: 'பாக்டீரியா மற்றும் சுவாசப்பாதை தொற்று சிகிச்சை',
  },
  {
    id: 'med-ant-02',
    brandName: 'Azee 500 / Azithral',
    genericName: 'Azithromycin Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    packSize: '5 Tablets / Strip',
    brandPrice: 132.0,
    genericPrice: 22.0,
    savingsPercentage: 83,
    category: 'antibiotics',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Upper respiratory tract & throat infections',
    indicationsTa: 'தொண்டை மற்றும் மார்பு சளி தொற்று நிவாரணம்',
  },
  {
    id: 'med-ant-03',
    brandName: 'Zifi 200 / Taxim-O',
    genericName: 'Cefixime Dispersible Tablets IP',
    dosage: '200mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 175.0,
    genericPrice: 28.0,
    savingsPercentage: 84,
    category: 'antibiotics',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Typhoid, UTI & bronchial bacterial infections',
    indicationsTa: 'டைபாய்டு மற்றும் சிறுநீரகத் தொற்று சிகிச்சை',
  },
  {
    id: 'med-ant-04',
    brandName: 'Ciplox 500 / Cifran',
    genericName: 'Ciprofloxacin Hydrochloride Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 54.0,
    genericPrice: 9.5,
    savingsPercentage: 82,
    category: 'antibiotics',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Gastrointestinal & urinary bacterial therapy',
    indicationsTa: 'வயிற்றுப்போக்கு மற்றும் தொற்றுகளுக்கான ஆன்டிபயாடிக்',
  },

  // 8. ONCOLOGY (CANCER LIFELINE CARE)
  {
    id: 'med-onc-01',
    brandName: 'Gleevec 400 / Glivec',
    genericName: 'Imatinib Mesylate Tablets IP',
    dosage: '400mg',
    form: 'Tablets',
    packSize: '30 Tablets / Bottle',
    brandPrice: 8500.0,
    genericPrice: 1400.0,
    savingsPercentage: 84,
    category: 'oncology',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP Special Oncology Division',
    indicationsEn: 'Chronic Myeloid Leukemia (CML) targeted therapy',
    indicationsTa: 'இரத்தப் புற்றுநோய் (ரத்தப் புற்றுநோய்) சிகிச்சை மாத்திரை',
  },
  {
    id: 'med-onc-02',
    brandName: 'Nolvadex 20 / Tamodex',
    genericName: 'Tamoxifen Citrate Tablets IP',
    dosage: '20mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 245.0,
    genericPrice: 38.0,
    savingsPercentage: 84,
    category: 'oncology',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP Special Oncology Division',
    indicationsEn: 'Estrogen receptor-positive breast cancer management',
    indicationsTa: 'மார்பக புற்றுநோய் தடுப்பு மற்றும் சிகிச்சை',
  },
  {
    id: 'med-onc-03',
    brandName: 'Femara 2.5 / Letroz',
    genericName: 'Letrozole Tablets IP',
    dosage: '2.5mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 380.0,
    genericPrice: 52.0,
    savingsPercentage: 86,
    category: 'oncology',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP Special Oncology Division',
    indicationsEn: 'Aromatase inhibitor for post-menopausal breast oncology',
    indicationsTa: 'ஹார்மோன் சார்ந்த புற்றுநோய் மேலாண்மை',
  },
  {
    id: 'med-onc-04',
    brandName: 'Geftinat 250 / Iressa',
    genericName: 'Gefitinib Tablets IP',
    dosage: '250mg',
    form: 'Tablets',
    packSize: '30 Tablets / Bottle',
    brandPrice: 4200.0,
    genericPrice: 650.0,
    savingsPercentage: 85,
    category: 'oncology',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP Special Oncology Division',
    indicationsEn: 'EGFR mutation non-small cell lung carcinoma',
    indicationsTa: 'நுரையீரல் புற்றுநோய் சிகிச்சைக்கான இலக்கு மருந்து',
  },

  // 9. RESPIRATORY & PULMONOLOGY
  {
    id: 'med-res-01',
    brandName: 'Foracort 200 Inhaler',
    genericName: 'Formoterol Fumarate (6mcg) + Budesonide (200mcg) Inhaler',
    dosage: '6mcg + 200mcg',
    form: 'Inhaler',
    packSize: '120 Metered Doses',
    brandPrice: 490.0,
    genericPrice: 120.0,
    savingsPercentage: 76,
    category: 'respiratory',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Maintenance treatment for severe Asthma & COPD',
    indicationsTa: 'ஆஸ்துமா மற்றும் நுரையீரல் மூச்சுத்திணறல் இன்ஹேலர்',
  },
  {
    id: 'med-res-02',
    brandName: 'Asthalin Inhaler',
    genericName: 'Salbutamol Inhaler IP',
    dosage: '100mcg',
    form: 'Inhaler',
    packSize: '200 Metered Doses',
    brandPrice: 180.0,
    genericPrice: 45.0,
    savingsPercentage: 75,
    category: 'respiratory',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Fast-relief rescue bronchodilator for bronchospasm',
    indicationsTa: 'திடீர் மூச்சுத்திணறல் அவசர நிவாரண இன்ஹேலர்',
  },
  {
    id: 'med-res-03',
    brandName: 'Montair LC / Telekast-L',
    genericName: 'Montelukast Sodium (10mg) + Levocetirizine (5mg) Tablets',
    dosage: '10mg + 5mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 220.0,
    genericPrice: 32.0,
    savingsPercentage: 85,
    category: 'respiratory',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Allergic rhinitis, seasonal dust allergy & mild asthma',
    indicationsTa: 'ஒவ்வாமை தும்மல், மூக்கடைப்பு & ஆஸ்துமா தடுப்பு',
  },

  // 10. NEUROLOGY & MENTAL HEALTH (NEURO-PSYCH)
  {
    id: 'med-neu-01',
    brandName: 'Levera 500 / Epilive',
    genericName: 'Levetiracetam Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 195.0,
    genericPrice: 34.0,
    savingsPercentage: 83,
    category: 'neuro_psych',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Anticonvulsant for Epilepsy & seizure disorder control',
    indicationsTa: 'வலிப்பு நோய் கட்டுப்பாடு மற்றும் நரம்பியல் சிகிச்சை',
  },
  {
    id: 'med-neu-02',
    brandName: 'Daxid 50 / Zoloft',
    genericName: 'Sertraline Hydrochloride Tablets IP',
    dosage: '50mg',
    form: 'Tablets',
    packSize: '10 Tablets / Strip',
    brandPrice: 140.0,
    genericPrice: 24.0,
    savingsPercentage: 83,
    category: 'neuro_psych',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'SSRI for Major Depressive Disorder & severe anxiety/OCD',
    indicationsTa: 'மன அழுத்தம் மற்றும் பதட்டம் சீராக்கும் நரம்பியல் மாத்திரை',
  },
  {
    id: 'med-neu-03',
    brandName: 'Zapiz 0.5 / Lonazep',
    genericName: 'Clonazepam Tablets IP',
    dosage: '0.5mg',
    form: 'Tablets',
    packSize: '15 Tablets / Strip',
    brandPrice: 65.0,
    genericPrice: 11.0,
    savingsPercentage: 83,
    category: 'neuro_psych',
    requiresPrescription: true,
    scheduleH: true,
    whoGmpCertified: true,
    inStock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indicationsEn: 'Anxiolytic & seizure adjuvant medication',
    indicationsTa: 'பதட்டத் தணிப்பு மற்றும் நரம்பு அமைதி மாத்திரை',
  },
];

export const NEARBY_JAN_AUSHADHI_KENDRAS: JanAushadhiKendra[] = [
  {
    id: 'kendra-01',
    name: 'Jan Aushadhi Kendra - Anna Nagar West',
    area: 'Anna Nagar, Chennai',
    address: 'Shop No. 4, Thirumangalam Road, Near Metro Pillar 114, Anna Nagar West, Chennai - 600040',
    phone: '044-26154820',
    timings: '08:00 AM - 10:00 PM (All 7 Days)',
    distanceKm: 1.2,
  },
  {
    id: 'kendra-02',
    name: 'Jan Aushadhi Kendra - T. Nagar Bus Terminus',
    area: 'T. Nagar, Chennai',
    address: 'Old Mambalam Road, Opp. Bus Depot, T. Nagar, Chennai - 600017',
    phone: '044-24345210',
    timings: '07:30 AM - 10:30 PM (All 7 Days)',
    distanceKm: 3.5,
  },
  {
    id: 'kendra-03',
    name: 'Jan Aushadhi Kendra - Adyar Signal',
    area: 'Adyar, Chennai',
    address: 'Lattice Bridge Road, Near Gandhi Nagar Post Office, Adyar, Chennai - 600020',
    phone: '044-24419830',
    timings: '08:00 AM - 10:00 PM (All 7 Days)',
    distanceKm: 5.1,
  },
  {
    id: 'kendra-04',
    name: 'Jan Aushadhi Kendra - Tambaram Sanatorium',
    area: 'Tambaram, Chennai',
    address: 'GST Road, Opp. TB Hospital Gate, Tambaram Sanatorium, Chennai - 600047',
    phone: '044-22416790',
    timings: '08:00 AM - 09:30 PM (All 7 Days)',
    distanceKm: 8.4,
  },
];

class MedicineStoreService {
  private cartKey = 'healthgrid_medicine_cart';
  private ordersKey = 'healthgrid_medicine_orders';

  public getCatalog(): MedicineItem[] {
    return CHRONIC_MEDICINES_CATALOG;
  }

  public getKendras(): JanAushadhiKendra[] {
    return NEARBY_JAN_AUSHADHI_KENDRAS;
  }

  public getCart(): MedicineCartItem[] {
    try {
      const raw = localStorage.getItem(this.cartKey);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveCart(cart: MedicineCartItem[]): void {
    try {
      localStorage.setItem(this.cartKey, JSON.stringify(cart));
      window.dispatchEvent(new Event('healthgrid_cart_updated'));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }

  public addToCart(medicine: MedicineItem, quantity = 1): MedicineCartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((i) => i.medicine.id === medicine.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ medicine, quantity });
    }
    this.saveCart(cart);
    return cart;
  }

  public updateQuantity(medicineId: string, quantity: number): MedicineCartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter((i) => i.medicine.id !== medicineId);
    } else {
      const item = cart.find((i) => i.medicine.id === medicineId);
      if (item) item.quantity = quantity;
    }
    this.saveCart(cart);
    return cart;
  }

  public clearCart(): void {
    try {
      localStorage.removeItem(this.cartKey);
      window.dispatchEvent(new Event('healthgrid_cart_updated'));
    } catch (e) {
      console.warn('Failed to clear cart:', e);
    }
  }

  public getOrders(userId?: string): MedicineOrder[] {
    try {
      const raw = localStorage.getItem(this.ordersKey);
      if (!raw) return [];
      const all: MedicineOrder[] = JSON.parse(raw);
      if (userId) {
        return all.filter((o) => o.userId === userId);
      }
      return all;
    } catch {
      return [];
    }
  }

  public createOrder(orderData: Omit<MedicineOrder, 'id' | 'createdAt' | 'status' | 'estimatedDelivery'>): MedicineOrder {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `HG-ORD-${Date.now().toString().slice(-4)}${randomSuffix}`;
    const now = new Date();
    
    // Estimate delivery
    let estimatedDelivery = '';
    if (orderData.deliveryType === 'home_delivery') {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      estimatedDelivery = `Tomorrow by 4:00 PM (${tomorrow.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`;
    } else {
      estimatedDelivery = 'Ready for pickup in 2 hours at Kendra counter';
    }

    const pickupToken = orderData.deliveryType === 'kendra_pickup' ? `KENDRA-${Math.floor(1000 + Math.random() * 9000)}` : undefined;
    const verificationOtp = orderData.deliveryType === 'kendra_pickup' ? `${Math.floor(100000 + Math.random() * 900000)}` : undefined;

    const newOrder: MedicineOrder = {
      ...orderData,
      id,
      status: 'CONFIRMED',
      createdAt: now.toISOString(),
      estimatedDelivery,
      pickupToken,
      verificationOtp,
    };

    try {
      const existing = this.getOrders();
      const updated = [newOrder, ...existing];
      localStorage.setItem(this.ordersKey, JSON.stringify(updated));
      window.dispatchEvent(new Event('healthgrid_orders_updated'));
    } catch (e) {
      console.warn('Failed to persist order:', e);
    }

    this.clearCart();
    return newOrder;
  }

  /**
   * Auto-maps scanned prescription medications to Jan Aushadhi generic cart items
   */
  public addScannedMedicinesToCart(scannedMeds: Array<{
    brandName: string;
    genericName: string;
    dosage?: string;
    brandPrice?: number;
    genericPrice?: number;
    savingsPct?: number;
  }>): number {
    let addedCount = 0;
    const catalog = this.getCatalog();

    scannedMeds.forEach((item) => {
      const cleanBrand = item.brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanGeneric = item.genericName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if match exists in curated catalog
      const matched = catalog.find((catItem) => {
        const catBrand = catItem.brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const catGen = catItem.genericName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return catBrand.includes(cleanBrand) || cleanBrand.includes(catBrand) ||
               catGen.includes(cleanGeneric) || cleanGeneric.includes(catGen);
      });

      if (matched) {
        this.addToCart(matched, 1);
        addedCount++;
      } else {
        const bPrice = item.brandPrice && item.brandPrice > 0 ? item.brandPrice : 120;
        const gPrice = item.genericPrice && item.genericPrice > 0 ? item.genericPrice : Math.round(bPrice * 0.16);
        const savingsPct = item.savingsPct || Math.round(((bPrice - gPrice) / bPrice) * 100);

        const syntheticItem: MedicineItem = {
          id: `med-scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          brandName: item.brandName,
          genericName: item.genericName,
          dosage: item.dosage || 'Standard Dosage',
          form: 'Tablets',
          packSize: '10 Tablets / Strip',
          brandPrice: bPrice,
          genericPrice: gPrice,
          savingsPercentage: savingsPct,
          category: 'all',
          requiresPrescription: true,
          scheduleH: true,
          whoGmpCertified: true,
          inStock: true,
          manufacturer: 'PMBJP (TNMSC Certified)',
          indicationsEn: 'Prescription-verified generic formulation',
          indicationsTa: 'மருத்துவர் பரிந்துரைத்த மலிவு ஜெனரிக் மாத்திரை',
        };
        this.addToCart(syntheticItem, 1);
        addedCount++;
      }
    });

    return addedCount;
  }

  // =========================================================================
  // CHRONIC MONTHLY REFILL SUBSCRIPTIONS & SMART ADHERENCE RADAR
  // =========================================================================

  private refillsKey = 'healthgrid_chronic_refills';

  public getChronicRefills(): ChronicRefillSchedule[] {
    try {
      const stored = localStorage.getItem(this.refillsKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load chronic refills:', e);
    }

    // Default authentic ongoing chronic refill schedule (real system clock: 26 days elapsed, 4 days left)
    const nowMs = Date.now();
    const seededStart = new Date(nowMs - 26 * 24 * 60 * 60 * 1000).toISOString();
    const seededSchedule: ChronicRefillSchedule = {
      id: 'REF-849201',
      userId: 'default-patient',
      medicalId: 'HG-600040-7821',
      patientName: 'Karthik Subramanian',
      patientPhone: '+91 98401 23456',
      prescriptionId: 'RX-CHRONIC-2026',
      prescriptionDate: new Date(nowMs - 26 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      doctorName: 'Dr. V. Ramanathan, MD (Cardio-Diabetology)',
      createdAt: seededStart,
      items: [
        {
          id: 'item-ref-1',
          medicineId: 'med-dia-01',
          brandName: 'Glycomet 500',
          genericName: 'Metformin Hydrochloride Prolonged-Release Tablets IP',
          dosage: '500mg',
          frequency: '1-0-1 (Twice Daily)',
          timing: 'After Food (உணவுக்குப் பின்)',
          dailyPills: 2,
          stripsCount: 6,
          pillsPerStrip: 10,
          startDate: seededStart,
          durationDays: 30,
          brandPricePerStrip: 45.0,
          genericPricePerStrip: 7.5,
          category: 'diabetes',
        },
        {
          id: 'item-ref-2',
          medicineId: 'med-hyp-01',
          brandName: 'Telma 40',
          genericName: 'Telmisartan Tablets IP',
          dosage: '40mg',
          frequency: '1-0-0 (Morning)',
          timing: 'Before Food (உணவுக்கு முன்)',
          dailyPills: 1,
          stripsCount: 3,
          pillsPerStrip: 10,
          startDate: seededStart,
          durationDays: 30,
          brandPricePerStrip: 98.0,
          genericPricePerStrip: 14.0,
          category: 'hypertension',
        },
        {
          id: 'item-ref-3',
          medicineId: 'med-chol-01',
          brandName: 'Lipitor 10 / Atorva 10',
          genericName: 'Atorvastatin Calcium Tablets IP',
          dosage: '10mg',
          frequency: '0-0-1 (Night)',
          timing: 'At Bedtime (இரவு தூங்கும் முன்)',
          dailyPills: 1,
          stripsCount: 3,
          pillsPerStrip: 10,
          startDate: seededStart,
          durationDays: 30,
          brandPricePerStrip: 110.0,
          genericPricePerStrip: 16.5,
          category: 'cholesterol',
        },
      ],
      preferredFulfillment: 'kendra_pickup',
      preferredKendraId: 'kendra-01',
      status: 'active',
      totalMonthlyBrandCost: 894.0, // (45*6) + (98*3) + (110*3) = 270 + 294 + 330 = 894
      totalMonthlyGenericCost: 136.5, // (7.5*6) + (14*3) + (16.5*3) = 45 + 42 + 49.5 = 136.5
      totalMonthlySavings: 757.5,
      notificationPreferences: {
        whatsapp: true,
        sms: true,
        calendar: true,
      },
    };

    try {
      localStorage.setItem(this.refillsKey, JSON.stringify([seededSchedule]));
    } catch {
      // ignore
    }

    return [seededSchedule];
  }

  public saveChronicRefills(refills: ChronicRefillSchedule[]): void {
    try {
      localStorage.setItem(this.refillsKey, JSON.stringify(refills));
      window.dispatchEvent(new Event('healthgrid_refills_updated'));
    } catch (e) {
      console.warn('Failed to save chronic refills:', e);
    }
  }

  public calculateItemAdherence(item: ChronicRefillItem): {
    elapsedDays: number;
    daysRemaining: number;
    progressPct: number;
    targetRefillDate: string;
    isDue: boolean;
    isOverdue: boolean;
  } {
    const startMs = new Date(item.startDate).getTime();
    const nowMs = Date.now();
    const elapsedDays = Math.max(0, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, item.durationDays - elapsedDays);
    const progressPct = Math.min(100, Math.round((elapsedDays / item.durationDays) * 100));
    const targetRefillDateObj = new Date(startMs + item.durationDays * 24 * 60 * 60 * 1000);
    const targetRefillDate = targetRefillDateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const isDue = daysRemaining <= 5 && daysRemaining > 0;
    const isOverdue = daysRemaining === 0;

    return {
      elapsedDays,
      daysRemaining,
      progressPct,
      targetRefillDate,
      isDue,
      isOverdue,
    };
  }

  public calculateScheduleStatus(schedule: ChronicRefillSchedule): {
    minDaysLeft: number;
    isDue: boolean;
    isOverdue: boolean;
    nextRefillDate: string;
  } {
    if (!schedule.items || schedule.items.length === 0) {
      return { minDaysLeft: 30, isDue: false, isOverdue: false, nextRefillDate: 'N/A' };
    }

    let minDays = 999;
    let earliestDate = '';

    schedule.items.forEach((it) => {
      const adh = this.calculateItemAdherence(it);
      if (adh.daysRemaining < minDays) {
        minDays = adh.daysRemaining;
        earliestDate = adh.targetRefillDate;
      }
    });

    return {
      minDaysLeft: minDays === 999 ? 0 : minDays,
      isDue: schedule.status === 'active' && minDays <= 5 && minDays > 0,
      isOverdue: schedule.status === 'active' && minDays === 0,
      nextRefillDate: earliestDate,
    };
  }

  public createRefillSchedule(params: {
    userId: string;
    medicalId: string;
    patientName: string;
    patientPhone: string;
    prescriptionId?: string;
    prescriptionDate?: string;
    doctorName?: string;
    preferredFulfillment?: DeliveryType;
    preferredKendraId?: string;
    items: Array<{
      brandName: string;
      genericName: string;
      dosage?: string;
      frequency?: string;
      timing?: string;
      duration?: string;
      brandPrice?: number;
      genericPrice?: number;
      stripsCount?: number;
    }>;
  }): ChronicRefillSchedule {
    const catalog = this.getCatalog();
    const scheduleId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const refillItems: ChronicRefillItem[] = params.items.map((raw, idx) => {
      const cleanBrand = raw.brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = catalog.find((cat) => cat.brandName.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanBrand));

      let durationDays = 30;
      if (raw.duration) {
        const parsed = parseInt(raw.duration, 10);
        if (!isNaN(parsed) && parsed > 0) durationDays = parsed;
      }

      let dailyPills = 1;
      if (raw.frequency) {
        const matches = raw.frequency.match(/\d+/g);
        if (matches && matches.length > 0) {
          const sum = matches.reduce((acc, cur) => acc + parseInt(cur, 10), 0);
          if (sum > 0) dailyPills = sum;
        }
      }

      const totalPillsNeeded = dailyPills * durationDays;
      const pillsPerStrip = 10;
      const stripsCount = raw.stripsCount || Math.max(1, Math.ceil(totalPillsNeeded / pillsPerStrip));

      const bPrice = matched ? matched.brandPrice : (raw.brandPrice || 120);
      const gPrice = matched ? matched.genericPrice : (raw.genericPrice || 20);

      return {
        id: `item-${scheduleId}-${idx + 1}`,
        medicineId: matched ? matched.id : `med-rx-${idx}`,
        brandName: raw.brandName,
        genericName: matched ? matched.genericName : raw.genericName,
        dosage: raw.dosage || (matched ? matched.dosage : 'Standard Dosage'),
        frequency: raw.frequency || '1-0-1',
        timing: raw.timing || 'After Food',
        dailyPills,
        stripsCount,
        pillsPerStrip,
        startDate: nowIso,
        durationDays,
        brandPricePerStrip: bPrice,
        genericPricePerStrip: gPrice,
        category: matched ? matched.category : 'all',
      };
    });

    const totalMonthlyBrandCost = refillItems.reduce((acc, it) => acc + (it.brandPricePerStrip * it.stripsCount), 0);
    const totalMonthlyGenericCost = refillItems.reduce((acc, it) => acc + (it.genericPricePerStrip * it.stripsCount), 0);
    const totalMonthlySavings = Math.max(0, totalMonthlyBrandCost - totalMonthlyGenericCost);

    const newSchedule: ChronicRefillSchedule = {
      id: scheduleId,
      userId: params.userId,
      medicalId: params.medicalId,
      patientName: params.patientName,
      patientPhone: params.patientPhone,
      prescriptionId: params.prescriptionId,
      prescriptionDate: params.prescriptionDate || new Date().toLocaleDateString('en-IN'),
      doctorName: params.doctorName || 'Attending Physician',
      createdAt: nowIso,
      items: refillItems,
      preferredFulfillment: params.preferredFulfillment || 'kendra_pickup',
      preferredKendraId: params.preferredKendraId || 'kendra-01',
      status: 'active',
      totalMonthlyBrandCost,
      totalMonthlyGenericCost,
      totalMonthlySavings,
      notificationPreferences: {
        whatsapp: true,
        sms: true,
        calendar: true,
      },
    };

    const existing = this.getChronicRefills();
    const updated = [newSchedule, ...existing];
    this.saveChronicRefills(updated);
    return newSchedule;
  }

  public updateRefillItemStrips(scheduleId: string, itemId: string, stripsCount: number): void {
    const schedules = this.getChronicRefills();
    const sched = schedules.find((s) => s.id === scheduleId);
    if (!sched) return;

    const item = sched.items.find((i) => i.id === itemId);
    if (!item) return;

    item.stripsCount = Math.max(1, stripsCount);
    sched.totalMonthlyBrandCost = sched.items.reduce((acc, it) => acc + (it.brandPricePerStrip * it.stripsCount), 0);
    sched.totalMonthlyGenericCost = sched.items.reduce((acc, it) => acc + (it.genericPricePerStrip * it.stripsCount), 0);
    sched.totalMonthlySavings = Math.max(0, sched.totalMonthlyBrandCost - sched.totalMonthlyGenericCost);

    this.saveChronicRefills(schedules);
  }

  public toggleRefillStatus(scheduleId: string): void {
    const schedules = this.getChronicRefills();
    const sched = schedules.find((s) => s.id === scheduleId);
    if (!sched) return;

    sched.status = sched.status === 'active' ? 'paused' : 'active';
    this.saveChronicRefills(schedules);
  }

  public deleteRefillSchedule(scheduleId: string): void {
    const schedules = this.getChronicRefills().filter((s) => s.id !== scheduleId);
    this.saveChronicRefills(schedules);
  }

  public populateCartFromRefill(scheduleId: string): number {
    const schedules = this.getChronicRefills();
    const sched = schedules.find((s) => s.id === scheduleId);
    if (!sched) return 0;

    const catalog = this.getCatalog();
    let count = 0;

    sched.items.forEach((item) => {
      let matched = catalog.find((c) => c.id === item.medicineId);
      if (!matched) {
        matched = catalog.find((c) => c.brandName.toLowerCase().includes(item.brandName.toLowerCase()));
      }

      if (matched) {
        this.addToCart(matched, item.stripsCount);
        count++;
      } else {
        const synthetic: MedicineItem = {
          id: item.medicineId,
          brandName: item.brandName,
          genericName: item.genericName,
          dosage: item.dosage,
          form: 'Tablets',
          packSize: `${item.pillsPerStrip} Tablets / Strip`,
          brandPrice: item.brandPricePerStrip,
          genericPrice: item.genericPricePerStrip,
          savingsPercentage: Math.round(((item.brandPricePerStrip - item.genericPricePerStrip) / item.brandPricePerStrip) * 100),
          category: item.category,
          requiresPrescription: true,
          scheduleH: true,
          whoGmpCertified: true,
          inStock: true,
          manufacturer: 'PMBJP (TNMSC Certified)',
          indicationsEn: 'Chronic Refill Formula',
          indicationsTa: 'தொடர் சிகிச்சைக்கான ஜெனரிக் மாத்திரை',
        };
        this.addToCart(synthetic, item.stripsCount);
        count++;
      }
    });

    return count;
  }

  public generateRefillIcs(schedule: ChronicRefillSchedule): string {
    const firstItem = schedule.items[0];
    const durationDays = firstItem ? firstItem.durationDays : 30;
    const startObj = new Date(schedule.createdAt);
    const refillDateObj = new Date(startObj.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    const toIcsDate = (d: Date) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T090000Z`;

    const startStr = toIcsDate(refillDateObj);
    const endStr = toIcsDate(new Date(refillDateObj.getTime() + 60 * 60 * 1000));
    const medList = schedule.items.map((i) => `• ${i.genericName} (${i.dosage}) - ${i.stripsCount} strips`).join('\\n');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HealthGrid//PMBJP Chronic Medicine Refill Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:refill-${schedule.id}@healthgrid.in`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:HealthGrid PMBJP Medicine Refill Due (${schedule.id})`,
      `DESCRIPTION:Your chronic medication supply runs low in 5 days.\\n\\nPrescribed Medicines:\\n${medList}\\n\\nEstimated Jan Aushadhi Cost: ₹${schedule.totalMonthlyGenericCost.toFixed(0)} (Monthly Savings: ₹${schedule.totalMonthlySavings.toFixed(0)})\\n\\nPickup at Jan Aushadhi Kendra or order home delivery on HealthGrid.`,
      'LOCATION:Nearest Pradhan Mantri Jan Aushadhi Kendra',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P2D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: HealthGrid Chronic Medicine Refill Due in 2 Days',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  public generateRefillWhatsAppUrl(schedule: ChronicRefillSchedule): string {
    const firstItem = schedule.items[0];
    const startObj = new Date(schedule.createdAt);
    const durationDays = firstItem ? firstItem.durationDays : 30;
    const refillDate = new Date(startObj.getTime() + durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const lines = [
      `🔔 *HealthGrid Chronic Medicine Refill Reminder*`,
      `*Schedule ID:* ${schedule.id}`,
      `*Patient:* ${schedule.patientName || 'Patient'} (ID: ${schedule.medicalId})`,
      `*Refill Due Date:* ${refillDate}`,
      ``,
      `*Prescribed Generic Medications:*`,
      ...schedule.items.map((i) => `• ${i.genericName} (${i.dosage}) - ${i.stripsCount} Strip(s)`),
      ``,
      `*Jan Aushadhi Cost:* ₹${schedule.totalMonthlyGenericCost.toFixed(0)}`,
      `*Commercial Brand Cost:* ₹${schedule.totalMonthlyBrandCost.toFixed(0)}`,
      `*You Save:* ₹${schedule.totalMonthlySavings.toFixed(0)} (80%+ off)`,
      ``,
      `Reorder for Kendra Pickup or Home Delivery:`,
      `https://healthgrid.vercel.app/medicines?refill=${schedule.id}`,
    ];

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`;
  }
}

export const medicineStoreService = new MedicineStoreService();
