import pg from 'pg';
const { Client } = pg;

const BUCKET_BASE = 'https://cosnhycbvsxedogtejos.supabase.co/storage/v1/object/public/medicine-images';

const IMAGES = {
  whiteOblong: `${BUCKET_BASE}/white-oblong-tablet.jpg`,
  whiteRound: `${BUCKET_BASE}/white-round-tablet.jpg`,
  orangeCapsule: `${BUCKET_BASE}/orange-white-capsule.jpg`,
  pinkRound: `${BUCKET_BASE}/pink-round-tablet.jpg`,
  yellowOblong: `${BUCKET_BASE}/yellow-oblong-tablet.jpg`,
  inhaler: `${BUCKET_BASE}/medical-inhaler.jpg`
};

const MEDICINES_DATA = [
  // 1. DIABETES
  {
    brand_name: 'Glycomet 500 / Glucophage',
    generic_name: 'Metformin Hydrochloride Prolonged-Release Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 45.0,
    generic_price: 7.5,
    savings_percentage: 83,
    category: 'Diabetes',
    category_slug: 'diabetes',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'First-line Type 2 Diabetes glycemic regulation',
    indications_ta: 'இரத்த சர்க்கரை அளவை கட்டுப்படுத்த முதன்மை மருந்து',
    image_url: IMAGES.whiteOblong
  },
  {
    brand_name: 'Glycomet GP 1 Duo',
    generic_name: 'Glimepiride (1mg) + Metformin Hydrochloride (500mg)',
    dosage: '1mg + 500mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 125.0,
    generic_price: 18.0,
    savings_percentage: 86,
    category: 'Diabetes',
    category_slug: 'diabetes',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Dual-action Blood Sugar regulation',
    indications_ta: 'இருமுனை சர்க்கரை நோய் சிகிச்சை',
    image_url: IMAGES.whiteRound
  },
  {
    brand_name: 'Januvia 100',
    generic_name: 'Sitagliptin Phosphate Tablets IP',
    dosage: '100mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 380.0,
    generic_price: 48.0,
    savings_percentage: 87,
    category: 'Diabetes',
    category_slug: 'diabetes',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Advanced DPP-4 inhibitor for post-meal insulin control',
    indications_ta: 'இன்சுலின் சுரப்பை சீராக்கும் நவீன DPP-4 மருந்து',
    image_url: IMAGES.pinkRound
  },
  {
    brand_name: 'Galvus Met 50/500',
    generic_name: 'Vildagliptin (50mg) + Metformin (500mg) Tablets',
    dosage: '50mg + 500mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 290.0,
    generic_price: 38.0,
    savings_percentage: 87,
    category: 'Diabetes',
    category_slug: 'diabetes',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Synergistic glycemic control for stubborn HbA1c',
    indications_ta: 'கட்டுப்படாத நீரிழிவுக்கான கூட்டு மருந்து',
    image_url: IMAGES.yellowOblong
  },
  {
    brand_name: 'Forxiga 10',
    generic_name: 'Dapagliflozin Tablets IP',
    dosage: '10mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 540.0,
    generic_price: 62.0,
    savings_percentage: 89,
    category: 'Diabetes',
    category_slug: 'diabetes',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'SGLT2 renal glucose excretion & cardio-renal protection',
    indications_ta: 'சிறுநீரகம் வழியாக அதிக சர்க்கரையை வெளியேற்றும் நவீன மருந்து',
    image_url: IMAGES.whiteRound
  },

  // 2. BLOOD PRESSURE & HYPERTENSION
  {
    brand_name: 'Telma 40 / Micardis',
    generic_name: 'Telmisartan Tablets IP',
    dosage: '40mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 135.0,
    generic_price: 19.5,
    savings_percentage: 86,
    category: 'Blood Pressure',
    category_slug: 'blood_pressure',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Essential hypertension & cardiovascular risk reduction',
    indications_ta: 'உயர் இரத்த அழுத்தத்தை குறைத்து இதயத்தை பாதுகாக்கும்',
    image_url: IMAGES.whiteRound
  },
  {
    brand_name: 'Telma AM',
    generic_name: 'Telmisartan (40mg) + Amlodipine (5mg) Tablets IP',
    dosage: '40mg + 5mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 210.0,
    generic_price: 28.0,
    savings_percentage: 87,
    category: 'Blood Pressure',
    category_slug: 'blood_pressure',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Dual vasodilator for resistant hypertension',
    indications_ta: 'இருமுனை ரத்த அழுத்த கட்டுப்பாடு மருந்து',
    image_url: IMAGES.whiteRound
  },
  {
    brand_name: 'Amlong 5 / Norvasc',
    generic_name: 'Amlodipine Besylate Tablets IP',
    dosage: '5mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 78.0,
    generic_price: 9.0,
    savings_percentage: 88,
    category: 'Blood Pressure',
    category_slug: 'blood_pressure',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Calcium channel blocker for vascular smooth muscle relaxation',
    indications_ta: 'இரத்த நாளங்களை தளர்த்தி இரத்த அழுத்தத்தை குறைக்கிறது',
    image_url: IMAGES.whiteRound
  },
  {
    brand_name: 'Cardivas 3.125 / Carvil',
    generic_name: 'Carvedilol Tablets IP',
    dosage: '3.125mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 92.0,
    generic_price: 14.0,
    savings_percentage: 85,
    category: 'Blood Pressure',
    category_slug: 'blood_pressure',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Beta-blocker for heart failure & post-infarction care',
    indications_ta: 'இதய துடிப்பை சீராக்கி இதய தசைகளை பாதுகாக்கிறது',
    image_url: IMAGES.whiteOblong
  },

  // 3. CHOLESTEROL & CARDIAC
  {
    brand_name: 'Atorva 20 / Lipitor',
    generic_name: 'Atorvastatin Calcium Tablets IP',
    dosage: '20mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 245.0,
    generic_price: 32.0,
    savings_percentage: 87,
    category: 'Cholesterol',
    category_slug: 'cholesterol',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'HMG-CoA reductase inhibitor for LDL plaque reduction',
    indications_ta: 'கெட்ட கொழுப்பை (LDL) குறைத்து மாறடைப்பை தடுக்கிறது',
    image_url: IMAGES.whiteRound
  },
  {
    brand_name: 'Rosuvas 10 / Crestor',
    generic_name: 'Rosuvastatin Calcium Tablets IP',
    dosage: '10mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 260.0,
    generic_price: 34.0,
    savings_percentage: 87,
    category: 'Cholesterol',
    category_slug: 'cholesterol',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'High-potency statin for hyperlipidemia & stroke prevention',
    indications_ta: 'தீவிர கொழுப்பு குறைப்பு மற்றும் பக்கவாத தடுப்பு',
    image_url: IMAGES.pinkRound
  },
  {
    brand_name: 'Deplatt 75 / Plavix',
    generic_name: 'Clopidogrel Bisulphate Tablets IP',
    dosage: '75mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 185.0,
    generic_price: 26.0,
    savings_percentage: 86,
    category: 'Cholesterol',
    category_slug: 'cholesterol',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Antiplatelet therapy preventing arterial stent clots',
    indications_ta: 'இரத்த உறைதலை தடுத்து இதய ரத்த ஓட்டத்தை சீராக்கும்',
    image_url: IMAGES.pinkRound
  },

  // 4. ANTIBIOTICS
  {
    brand_name: 'Augmentin 625 Duo',
    generic_name: 'Amoxicillin + Potassium Clavulanate Tablets IP',
    dosage: '625mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 204.0,
    generic_price: 22.0,
    savings_percentage: 89,
    category: 'Antibiotics',
    category_slug: 'antibiotics',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Broad-spectrum antibiotic for bacterial respiratory/ear infections',
    indications_ta: 'சுவாசப் பாதை மற்றும் காது தொற்றுக்கான சக்திவாய்ந்த நுண்ணுயிர் எதிர்ப்பு மருந்து',
    image_url: IMAGES.whiteOblong
  },
  {
    brand_name: 'Azee 500 / Zithromax',
    generic_name: 'Azithromycin Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    pack_size: '5 Tablets / Strip',
    brand_price: 135.0,
    generic_price: 22.0,
    savings_percentage: 84,
    category: 'Antibiotics',
    category_slug: 'antibiotics',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Macrolide antibiotic for throat, lung and soft tissue infections',
    indications_ta: 'தொண்டை மற்றும் நுரையீரல் தொற்றுக்கான ஆன்டிபயாடிக்',
    image_url: IMAGES.whiteOblong
  },
  {
    brand_name: 'Taxim O 200',
    generic_name: 'Cefixime Dispersible Tablets IP',
    dosage: '200mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 175.0,
    generic_price: 36.0,
    savings_percentage: 79,
    category: 'Antibiotics',
    category_slug: 'antibiotics',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Cephalosporin antibiotic for typhoid & urinary tract infections',
    indications_ta: 'டைபாய்டு மற்றும் சிறுநீரக பாதை தொற்று சிகிச்சைக்கான மருந்து',
    image_url: IMAGES.yellowOblong
  },
  {
    brand_name: 'Ciplox 500',
    generic_name: 'Ciprofloxacin Tablets IP',
    dosage: '500mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 95.0,
    generic_price: 16.0,
    savings_percentage: 83,
    category: 'Antibiotics',
    category_slug: 'antibiotics',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Fluoroquinolone for gastrointestinal & deep skin infections',
    indications_ta: 'குடல் மற்றும் சரும தொற்றுக்கான ஆன்டிபயாடிக்',
    image_url: IMAGES.whiteOblong
  },

  // 5. ASTHMA & INHALERS
  {
    brand_name: 'Foracort 200 Inhaler',
    generic_name: 'Budesonide (200mcg) + Formoterol Fumarate (6mcg) Inhaler',
    dosage: '200mcg + 6mcg',
    form: 'Inhaler',
    pack_size: '120 Metered Doses',
    brand_price: 495.0,
    generic_price: 110.0,
    savings_percentage: 78,
    category: 'Asthma & Inhalers',
    category_slug: 'asthma_inhalers',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Corticosteroid + LABA bronchodilator for persistent asthma & COPD',
    indications_ta: 'ஆஸ்துமா மற்றும் நாள்பட்ட மூச்சுத்திணறல் நிவாரண இன்ஹேலர்',
    image_url: IMAGES.inhaler
  },
  {
    brand_name: 'Asthalin 100 Inhaler',
    generic_name: 'Salbutamol Inhalation Aerosol IP',
    dosage: '100mcg / puff',
    form: 'Inhaler',
    pack_size: '200 Metered Doses',
    brand_price: 165.0,
    generic_price: 45.0,
    savings_percentage: 73,
    category: 'Asthma & Inhalers',
    category_slug: 'asthma_inhalers',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Rapid-acting rescue bronchodilator for acute wheezing & bronchospasm',
    indications_ta: 'திடீர் மூச்சுத்திணறல் மற்றும் வீஸிங்கிற்கு உடனடி நிவாரண இன்ஹேலர்',
    image_url: IMAGES.inhaler
  },
  {
    brand_name: 'Montair LC',
    generic_name: 'Montelukast Sodium (10mg) + Levocetirizine (5mg) Tablets',
    dosage: '10mg + 5mg',
    form: 'Tablets',
    pack_size: '10 Tablets / Strip',
    brand_price: 215.0,
    generic_price: 29.0,
    savings_percentage: 87,
    category: 'Asthma & Inhalers',
    category_slug: 'asthma_inhalers',
    requires_prescription: true,
    schedule_h: true,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Allergic rhinitis & seasonal asthma prevention',
    indications_ta: 'ஒவ்வாமை தும்மல், சளி மற்றும் ஆஸ்துமா தடுப்பு மாத்திரை',
    image_url: IMAGES.pinkRound
  },

  // 6. GASTRO & ACIDITY
  {
    brand_name: 'Pantocid 40 / Pantop',
    generic_name: 'Pantoprazole Gastro-Resistant Tablets IP',
    dosage: '40mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 165.0,
    generic_price: 22.0,
    savings_percentage: 87,
    category: 'Gastro & Acidity',
    category_slug: 'gastro_acidity',
    requires_prescription: false,
    schedule_h: false,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Proton pump inhibitor for GERD, acid reflux & peptic ulcer healing',
    indications_ta: 'நெஞ்செரிச்சல், அசிடிட்டி மற்றும் வயிற்றுப் புண் நிவாரணம்',
    image_url: IMAGES.yellowOblong
  },
  {
    brand_name: 'Omez 20 / Prilosec',
    generic_name: 'Omeprazole Capsules IP',
    dosage: '20mg',
    form: 'Capsules',
    pack_size: '15 Capsules / Strip',
    brand_price: 88.0,
    generic_price: 12.0,
    savings_percentage: 86,
    category: 'Gastro & Acidity',
    category_slug: 'gastro_acidity',
    requires_prescription: false,
    schedule_h: false,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Gastric acid suppression for stomach ulcers & gastritis',
    indications_ta: 'வயிற்று அமிலம் மற்றும் வாயு கோளாறு தடுப்பு கேப்ஸ்யூல்',
    image_url: IMAGES.orangeCapsule
  },

  // 7. PAIN & FEVER
  {
    brand_name: 'Dolo 650 / Calpol',
    generic_name: 'Paracetamol Tablets IP (650mg)',
    dosage: '650mg',
    form: 'Tablets',
    pack_size: '15 Tablets / Strip',
    brand_price: 34.0,
    generic_price: 4.5,
    savings_percentage: 87,
    category: 'Pain & Fever',
    category_slug: 'pain_fever',
    requires_prescription: false,
    schedule_h: false,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Analgesic and antipyretic for high fever and body ache',
    indications_ta: 'காய்ச்சல் மற்றும் உடல் வலிக்கு உடனடி நிவாரணம்',
    image_url: IMAGES.whiteOblong
  },
  {
    brand_name: 'Combiflam',
    generic_name: 'Ibuprofen (400mg) + Paracetamol (325mg) Tablets',
    dosage: '400mg + 325mg',
    form: 'Tablets',
    pack_size: '20 Tablets / Strip',
    brand_price: 52.0,
    generic_price: 8.0,
    savings_percentage: 85,
    category: 'Pain & Fever',
    category_slug: 'pain_fever',
    requires_prescription: false,
    schedule_h: false,
    who_gmp_certified: true,
    is_subsidized: true,
    in_stock: true,
    manufacturer: 'PMBJP (TNMSC Certified)',
    indications_en: 'Anti-inflammatory analgesic for joint inflammation & dental pain',
    indications_ta: 'மூட்டு வலி, பல் வலி மற்றும் கடுமையான வீக்கத்தை குறைக்கும்',
    image_url: IMAGES.whiteOblong
  }
];

async function setupAndSeed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@db.cosnhycbvsxedogtejos.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    // 1. Create medicines table
    console.log('Creating table public.medicines...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.medicines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        brand_name VARCHAR(255) NOT NULL,
        generic_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        form VARCHAR(50) NOT NULL,
        pack_size VARCHAR(100) NOT NULL,
        brand_price NUMERIC(10, 2) NOT NULL,
        generic_price NUMERIC(10, 2) NOT NULL,
        savings_percentage INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        category_slug VARCHAR(100) NOT NULL,
        requires_prescription BOOLEAN DEFAULT true,
        schedule_h BOOLEAN DEFAULT true,
        who_gmp_certified BOOLEAN DEFAULT true,
        is_subsidized BOOLEAN DEFAULT true,
        in_stock BOOLEAN DEFAULT true,
        manufacturer VARCHAR(255) DEFAULT 'PMBJP (TNMSC Certified)',
        indications_en TEXT,
        indications_ta TEXT,
        image_url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Enable RLS and grant public read access
    await client.query(`
      ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public Read Access" ON public.medicines;
      CREATE POLICY "Public Read Access" ON public.medicines FOR SELECT USING (true);
      DROP POLICY IF EXISTS "Service Role Full Access" ON public.medicines;
      CREATE POLICY "Service Role Full Access" ON public.medicines FOR ALL USING (true);
    `);

    // 2. Clear old demo data and insert complete authentic catalogue
    console.log('Clearing existing entries in public.medicines...');
    await client.query(`DELETE FROM public.medicines;`);

    console.log(`Seeding ${MEDICINES_DATA.length} authentic medicines with Supabase storage images...`);
    for (const med of MEDICINES_DATA) {
      await client.query(`
        INSERT INTO public.medicines (
          brand_name, generic_name, dosage, form, pack_size,
          brand_price, generic_price, savings_percentage,
          category, category_slug, requires_prescription, schedule_h,
          who_gmp_certified, is_subsidized, in_stock, manufacturer,
          indications_en, indications_ta, image_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        );
      `, [
        med.brand_name, med.generic_name, med.dosage, med.form, med.pack_size,
        med.brand_price, med.generic_price, med.savings_percentage,
        med.category, med.category_slug, med.requires_prescription, med.schedule_h,
        med.who_gmp_certified, med.is_subsidized, med.in_stock, med.manufacturer,
        med.indications_en, med.indications_ta, med.image_url
      ]);
    }

    // 3. Also add image_url column to generic_medicines and update existing rows so legacy endpoints have real images too
    await client.query(`
      ALTER TABLE public.generic_medicines ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE public.generic_medicines ADD COLUMN IF NOT EXISTS pack_size VARCHAR(100);
      ALTER TABLE public.generic_medicines ADD COLUMN IF NOT EXISTS form VARCHAR(50);
      ALTER TABLE public.generic_medicines ADD COLUMN IF NOT EXISTS is_subsidized BOOLEAN DEFAULT true;
    `);

    // Verify row counts
    const countRes = await client.query('SELECT COUNT(*) FROM public.medicines;');
    console.log(`Successfully verified! Total rows in public.medicines: ${countRes.rows[0].count}`);

    const sampleRes = await client.query('SELECT brand_name, generic_price, savings_percentage, image_url FROM public.medicines LIMIT 3;');
    console.log('Sample rows:', sampleRes.rows);

    await client.end();
    console.log('Migration & Seeding completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

setupAndSeed();
