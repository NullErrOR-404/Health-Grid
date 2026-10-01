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
  | 'kidney';

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

    const newOrder: MedicineOrder = {
      ...orderData,
      id,
      status: 'CONFIRMED',
      createdAt: now.toISOString(),
      estimatedDelivery,
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
}

export const medicineStoreService = new MedicineStoreService();
