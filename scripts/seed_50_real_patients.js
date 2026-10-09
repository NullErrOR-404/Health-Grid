/**
 * HealthGrid 50 Real Clinical Patients & Longitudinal Appointments Seed
 * Seeds 50 diverse, authentic patient records into Supabase `patients` table
 * and links them with appointments for today and upcoming dates.
 */

const { createClient } = require('../frontend/node_modules/@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cosnhycbvsxedogtejos.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvc25oeWNidnN4ZWRvZ3Rlam9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDc2NTI1MSwiZXhwIjoyMTA2MzQxMjUxfQ.iRCujT08hVo9VgrNvZaCnxAYZ7EtKEiMOUMwMCFBHLU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PATIENT_DATA = [
  {
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 94451 98210',
    email: 'priya.sharma@healthgrid.in',
    location: 'Anna Nagar, Chennai, TN',
    dob: '1998-04-12',
    chronicConditions: ['None reported'],
    knownAllergies: ['None reported'],
    currentMedications: [],
    emergencyContact: { name: 'Vikram Sharma', relation: 'Spouse', phone: '+91 94451 98211' },
    reason: 'Fever and body ache for 2 days',
    department: 'General Medicine',
    status: 'Checked In',
    appointmentTime: '09:00 AM'
  },
  {
    name: 'Rajesh Kumar',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98401 22891',
    email: 'rajesh.kumar@healthgrid.in',
    location: 'T. Nagar, Chennai, TN',
    dob: '1968-08-25',
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { name: 'Metformin 500mg', dosage: '1-0-1', timing: 'After food' },
      { name: 'Telmisartan 40mg', dosage: '1-0-0', timing: 'Morning after food' }
    ],
    emergencyContact: { name: 'Kavitha Kumar', relation: 'Spouse', phone: '+91 98401 22892' },
    reason: 'High BP (160/95) on home monitoring, persistent headache',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '09:15 AM'
  },
  {
    name: 'Ananya Venkataraman',
    age: 34,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 98842 11090',
    email: 'ananya.v@healthgrid.in',
    location: 'Adyar, Chennai, TN',
    dob: '1992-11-03',
    chronicConditions: ['Hypothyroidism'],
    knownAllergies: ['Sulfa drugs'],
    currentMedications: [
      { name: 'Levothyroxine 50mcg', dosage: '1-0-0', timing: 'Early morning empty stomach' }
    ],
    emergencyContact: { name: 'Venkataraman R', relation: 'Father', phone: '+91 98842 11091' },
    reason: 'Follow-up thyroid profile review, mild weight gain',
    department: 'General Medicine',
    status: 'In Consultation',
    appointmentTime: '09:30 AM'
  },
  {
    name: 'Mohammed Farhan',
    age: 42,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 97910 44521',
    email: 'farhan.m@healthgrid.in',
    location: 'Royapettah, Chennai, TN',
    dob: '1984-02-18',
    chronicConditions: ['Bronchial Asthma'],
    knownAllergies: ['Aspirin / NSAIDs'],
    currentMedications: [
      { name: 'Budesonide 200mcg Inhaler', dosage: '2 puffs', timing: 'Twice daily' }
    ],
    emergencyContact: { name: 'Ayesha Farhan', relation: 'Spouse', phone: '+91 97910 44522' },
    reason: 'Nocturnal wheezing and shortness of breath with seasonal change',
    department: 'General Medicine',
    status: 'Checked In',
    appointmentTime: '09:45 AM'
  },
  {
    name: 'Kavitha Subramanian',
    age: 51,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 94443 88120',
    email: 'kavitha.sub@healthgrid.in',
    location: 'Mylapore, Chennai, TN',
    dob: '1975-06-30',
    chronicConditions: ['Osteoarthritis (Bilateral Knees)', 'Dyslipidemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Atorvastatin 10mg', dosage: '0-0-1', timing: 'Bedtime' },
      { name: 'Paracetamol 650mg', dosage: 'As needed', timing: 'For severe knee pain' }
    ],
    emergencyContact: { name: 'Subramanian S', relation: 'Spouse', phone: '+91 94443 88121' },
    reason: 'Bilateral knee joint pain worsening on climbing stairs',
    department: 'Orthopedics',
    status: 'Waiting',
    appointmentTime: '10:00 AM'
  },
  {
    name: 'Gurpreet Singh',
    age: 46,
    gender: 'Male',
    bloodGroup: 'AB+',
    phone: '+91 98112 33456',
    email: 'gurpreet.s@healthgrid.in',
    location: 'Kilpauk, Chennai, TN',
    dob: '1980-09-14',
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Fatty Liver Grade 1'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Metformin 1000mg', dosage: '1-0-1', timing: 'With meals' }
    ],
    emergencyContact: { name: 'Harpreet Kaur', relation: 'Spouse', phone: '+91 98112 33457' },
    reason: 'HbA1c surveillance (result: 7.8%), dietary counselling needed',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '10:15 AM'
  },
  {
    name: 'Lakshmi Narayanan',
    age: 67,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 94432 77890',
    email: 'lakshmi.n@healthgrid.in',
    location: 'Gandhi Nagar, Vellore, TN',
    dob: '1959-01-20',
    chronicConditions: ['Coronary Artery Disease (Post-PTCA 2021)', 'Hypertension'],
    knownAllergies: ['Contrast dye'],
    currentMedications: [
      { name: 'Aspirin 75mg', dosage: '0-1-0', timing: 'After lunch' },
      { name: 'Clopidogrel 75mg', dosage: '0-1-0', timing: 'After lunch' },
      { name: 'Metoprolol 25mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Srinivasan L', relation: 'Son', phone: '+91 94432 77891' },
    reason: 'Routine post-stent cardiac evaluation, chest discomfort on exertion',
    department: 'Cardiology',
    status: 'Scheduled',
    appointmentTime: '10:30 AM'
  },
  {
    name: 'Sneha Mukherjee',
    age: 24,
    gender: 'Female',
    bloodGroup: 'B-',
    phone: '+91 98301 55678',
    email: 'sneha.m@healthgrid.in',
    location: 'Velachery, Chennai, TN',
    dob: '2002-07-09',
    chronicConditions: ['Migraine with Aura'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Naproxen 500mg', dosage: 'PRN', timing: 'At onset of headache' }
    ],
    emergencyContact: { name: 'Debashis Mukherjee', relation: 'Father', phone: '+91 98301 55679' },
    reason: 'Recurrent unilateral throbbing headache with photophobia',
    department: 'General Medicine',
    status: 'Completed',
    appointmentTime: '10:45 AM'
  },
  {
    name: 'Rahul Deshmukh',
    age: 39,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 98220 99812',
    email: 'rahul.d@healthgrid.in',
    location: 'Sholinganallur, Chennai, TN',
    dob: '1987-03-27',
    chronicConditions: ['GERD', 'Hyperuricemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Pantoprazole 40mg', dosage: '1-0-0', timing: 'Morning 30 min before breakfast' }
    ],
    emergencyContact: { name: 'Pooja Deshmukh', relation: 'Spouse', phone: '+91 98220 99813' },
    reason: 'Severe retrosternal burning and nocturnal acid regurgitation',
    department: 'General Medicine',
    status: 'Checked In',
    appointmentTime: '11:00 AM'
  },
  {
    name: 'Meena Ramanathan',
    age: 62,
    gender: 'Female',
    bloodGroup: 'AB-',
    phone: '+91 94440 22319',
    email: 'meena.r@healthgrid.in',
    location: 'Thiruvanmiyur, Chennai, TN',
    dob: '1964-10-15',
    chronicConditions: ['Type 2 Diabetes', 'Osteopenia', 'Hypertension'],
    knownAllergies: ['Ciprofloxacin'],
    currentMedications: [
      { name: 'Glimepiride 1mg', dosage: '1-0-0', timing: 'Before breakfast' },
      { name: 'Calcium + Vit D3', dosage: '0-0-1', timing: 'After dinner' }
    ],
    emergencyContact: { name: 'Karthik Ramanathan', relation: 'Son', phone: '+91 94440 22320' },
    reason: 'Fasting blood glucose fluctuating (180-210 mg/dL), fatigue',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '11:15 AM'
  },
  {
    name: 'Arun Prakash',
    age: 31,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98840 55123',
    email: 'arun.prakash@healthgrid.in',
    location: 'Porur, Chennai, TN',
    dob: '1995-05-19',
    chronicConditions: ['Allergic Rhinitis'],
    knownAllergies: ['Dust Mite', 'Pollen'],
    currentMedications: [
      { name: 'Levocetirizine 5mg', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Deepa Prakash', relation: 'Spouse', phone: '+91 98840 55124' },
    reason: 'Persistent morning sneezing fits and nasal obstruction',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '11:30 AM'
  },
  {
    name: 'Fathima Begum',
    age: 50,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98765 43215',
    email: 'fathima.b@healthgrid.in',
    location: 'Triplicane, Chennai, TN',
    dob: '1976-12-08',
    chronicConditions: ['Hypertension', 'Mild Hypothyroidism'],
    knownAllergies: ['Sulfa drugs'],
    currentMedications: [
      { name: 'Amlodipine 5mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Ismail Begum', relation: 'Son', phone: '+91 98765 43216' },
    reason: 'Periodic ankle edema and fatigue evaluation',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '11:45 AM'
  },
  {
    name: 'Vignesh Sundaram',
    age: 36,
    gender: 'Male',
    bloodGroup: 'A-',
    phone: '+91 98765 43216',
    email: 'vignesh.s@healthgrid.in',
    location: 'Guindy, Chennai, TN',
    dob: '1990-08-01',
    chronicConditions: ['Plaque Psoriasis'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Clobetasol Propionate 0.05%', dosage: 'Apply BD', timing: 'Topical on plaques' }
    ],
    emergencyContact: { name: 'Sundaram V', relation: 'Father', phone: '+91 98765 43217' },
    reason: 'Dry erythematous scaling plaques on bilateral extensor elbows',
    department: 'Dermatology',
    status: 'Scheduled',
    appointmentTime: '12:00 PM'
  },
  {
    name: 'Deepak Verma',
    age: 44,
    gender: 'Male',
    bloodGroup: 'O-',
    phone: '+91 98105 66723',
    email: 'deepak.verma@healthgrid.in',
    location: 'Nungambakkam, Chennai, TN',
    dob: '1982-01-14',
    chronicConditions: ['Gouty Arthritis'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Febuxostat 40mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Sunita Verma', relation: 'Spouse', phone: '+91 98105 66724' },
    reason: 'Acute tenderness in right first metatarsophalangeal joint',
    department: 'Orthopedics',
    status: 'Checked In',
    appointmentTime: '12:15 PM'
  },
  {
    name: 'Ritu Sen',
    age: 29,
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+91 98310 77412',
    email: 'ritu.sen@healthgrid.in',
    location: 'Perungudi, Chennai, TN',
    dob: '1997-04-22',
    chronicConditions: ['Polycystic Ovary Syndrome (PCOS)'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Inositol + Folic Acid', dosage: '1-0-1', timing: 'With water' }
    ],
    emergencyContact: { name: 'Amit Sen', relation: 'Brother', phone: '+91 98310 77413' },
    reason: 'Endocrine panel review, weight management consultation',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '12:30 PM'
  },
  {
    name: 'Suresh Babu',
    age: 64,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 94441 33201',
    email: 'suresh.babu@healthgrid.in',
    location: 'Ambattur, Chennai, TN',
    dob: '1962-09-05',
    chronicConditions: ['Chronic Obstructive Pulmonary Disease (COPD)', 'Hypertension'],
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { name: 'Tiotropium 18mcg DPI', dosage: '1 cap inhalation', timing: 'Daily morning' },
      { name: 'Amlodipine 5mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Radha Suresh', relation: 'Spouse', phone: '+91 94441 33202' },
    reason: 'Increased cough with productive mucoid sputum on exertion',
    department: 'General Medicine',
    status: 'In Consultation',
    appointmentTime: '12:45 PM'
  },
  {
    name: 'Divya Ravichandran',
    age: 22,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 97890 88234',
    email: 'divya.ravi@healthgrid.in',
    location: 'Tambaram, Chennai, TN',
    dob: '2004-03-10',
    chronicConditions: ['Iron Deficiency Anemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Ferrous Ascorbate 100mg', dosage: '0-1-0', timing: 'Post lunch with lemon water' }
    ],
    emergencyContact: { name: 'Ravichandran K', relation: 'Father', phone: '+91 97890 88235' },
    reason: 'General lethargy, dizziness on standing, hemoglobin check',
    department: 'General Medicine',
    status: 'Completed',
    appointmentTime: '01:00 PM'
  },
  {
    name: 'Karthik Natarajan',
    age: 37,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98412 44509',
    email: 'karthik.n@healthgrid.in',
    location: 'Kotturpuram, Chennai, TN',
    dob: '1989-12-19',
    chronicConditions: ['Cervical Spondylosis'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Thiocolchicoside 4mg', dosage: '1-0-1', timing: 'Post food' }
    ],
    emergencyContact: { name: 'Priya Karthik', relation: 'Spouse', phone: '+91 98412 44510' },
    reason: 'Radiating pain to right shoulder and tingling in fingers',
    department: 'Orthopedics',
    status: 'Waiting',
    appointmentTime: '02:00 PM'
  },
  {
    name: 'Pooja Hegde',
    age: 33,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98204 99120',
    email: 'pooja.h@healthgrid.in',
    location: 'Alwarpet, Chennai, TN',
    dob: '1993-06-14',
    chronicConditions: ['Generalized Anxiety Disorder'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Escitalopram 10mg', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Raghav Hegde', relation: 'Spouse', phone: '+91 98204 99121' },
    reason: 'Follow-up sleep quality assessment, anxiety control review',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '02:15 PM'
  },
  {
    name: 'Balaji Krishnan',
    age: 55,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 94450 66712',
    email: 'balaji.k@healthgrid.in',
    location: 'Saidapet, Chennai, TN',
    dob: '1971-08-30',
    chronicConditions: ['Type 2 Diabetes', 'Diabetic Neuropathy'],
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { name: 'Metformin + Vildagliptin 50/500', dosage: '1-0-1', timing: 'With meals' },
      { name: 'Pregabalin 75mg', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Gita Balaji', relation: 'Spouse', phone: '+91 94450 66713' },
    reason: 'Bilateral feet burning sensation and pin-prick paresthesia',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '02:30 PM'
  },
  {
    name: 'Shanthi Mani',
    age: 48,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 94431 88902',
    email: 'shanthi.mani@healthgrid.in',
    location: 'Adayar, Chennai, TN',
    dob: '1978-02-14',
    chronicConditions: ['Fibromyalgia', 'Hypertension'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Telmisartan 20mg', dosage: '1-0-0', timing: 'Morning' },
      { name: 'Duloxetine 30mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Mani K', relation: 'Spouse', phone: '+91 94431 88903' },
    reason: 'Widespread musculoskeletal tender points, morning stiffness',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '02:45 PM'
  },
  {
    name: 'Manoj Tiwari',
    age: 41,
    gender: 'Male',
    bloodGroup: 'B-',
    phone: '+91 98110 55431',
    email: 'manoj.tiwari@healthgrid.in',
    location: 'Madipakkam, Chennai, TN',
    dob: '1985-05-11',
    chronicConditions: ['Dyslipidemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Rosuvastatin 10mg', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Rekha Tiwari', relation: 'Spouse', phone: '+91 98110 55432' },
    reason: 'Repeat lipid profile (LDL 134 mg/dL), diet review',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '03:00 PM'
  },
  {
    name: 'Swathi Reddy',
    age: 26,
    gender: 'Female',
    bloodGroup: 'AB+',
    phone: '+91 99890 11425',
    email: 'swathi.r@healthgrid.in',
    location: 'Thoraipakkam, Chennai, TN',
    dob: '2000-09-02',
    chronicConditions: ['Acne Vulgaris'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Benzoyl Peroxide 2.5% Gel', dosage: 'Once daily', timing: 'Night' }
    ],
    emergencyContact: { name: 'Srinivas Reddy', relation: 'Father', phone: '+91 99890 11426' },
    reason: 'Cystic inflammatory acne eruptions on chin and forehead',
    department: 'Dermatology',
    status: 'Scheduled',
    appointmentTime: '03:15 PM'
  },
  {
    name: 'Vijay Chawla',
    age: 53,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 98140 22189',
    email: 'vijay.chawla@healthgrid.in',
    location: 'Egmore, Chennai, TN',
    dob: '1973-10-21',
    chronicConditions: ['Non-Alcoholic Fatty Liver (NAFLD)', 'Hypertension'],
    knownAllergies: ['Sulfa drugs'],
    currentMedications: [
      { name: 'Olmesartan 20mg', dosage: '1-0-0', timing: 'Morning' },
      { name: 'Vitamin E 400 IU', dosage: '0-1-0', timing: 'Post lunch' }
    ],
    emergencyContact: { name: 'Simran Chawla', relation: 'Spouse', phone: '+91 98140 22190' },
    reason: 'Elevated SGPT/SGOT on routine executive health check',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '03:30 PM'
  },
  {
    name: 'Revathi Sridhar',
    age: 60,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 94445 77109',
    email: 'revathi.s@healthgrid.in',
    location: 'T. Nagar, Chennai, TN',
    dob: '1966-03-15',
    chronicConditions: ['Type 2 Diabetes', 'Hypothyroidism', 'Hypertension'],
    knownAllergies: ['Cephalosporins'],
    currentMedications: [
      { name: 'Teneligliptin 20mg', dosage: '1-0-0', timing: 'Before breakfast' },
      { name: 'Thyroxine 75mcg', dosage: '1-0-0', timing: 'Fasting' }
    ],
    emergencyContact: { name: 'Sridhar R', relation: 'Spouse', phone: '+91 94445 77110' },
    reason: 'General weakness, bilateral calf muscle cramps',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '03:45 PM'
  },
  {
    name: 'Naveen Kumar',
    age: 32,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98409 66124',
    email: 'naveen.k@healthgrid.in',
    location: 'Besant Nagar, Chennai, TN',
    dob: '1994-07-29',
    chronicConditions: ['Lumbar Disc Bulge L4-L5'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Pregabalin 50mg', dosage: '0-0-1', timing: 'Night' }
    ],
    emergencyContact: { name: 'Sowmya Naveen', relation: 'Spouse', phone: '+91 98409 66125' },
    reason: 'Lower back spasm after lifting luggage, posture advice',
    department: 'Orthopedics',
    status: 'Waiting',
    appointmentTime: '04:00 PM'
  },
  {
    name: 'Geetha Narayanan',
    age: 47,
    gender: 'Female',
    bloodGroup: 'A-',
    phone: '+91 94435 11980',
    email: 'geetha.n@healthgrid.in',
    location: 'K.K. Nagar, Chennai, TN',
    dob: '1979-11-18',
    chronicConditions: ['Premenopausal Menorrhagia', 'Mild Anemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Tranexamic Acid 500mg', dosage: 'PRN', timing: 'During heavy flow' }
    ],
    emergencyContact: { name: 'Narayanan P', relation: 'Spouse', phone: '+91 94435 11981' },
    reason: 'Pelvic ultrasound review, excessive menstrual fatigue',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '04:15 PM'
  },
  {
    name: 'Ashwin Iyer',
    age: 27,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98846 33901',
    email: 'ashwin.iyer@healthgrid.in',
    location: 'Triplicane, Chennai, TN',
    dob: '1999-01-08',
    chronicConditions: ['Irritable Bowel Syndrome (IBS-D)'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Mebeverine 135mg', dosage: '1-0-1', timing: '20 min before meals' }
    ],
    emergencyContact: { name: 'Meenakshi Iyer', relation: 'Mother', phone: '+91 98846 33902' },
    reason: 'Post-prandial abdominal cramping and irregular bowel habits',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '04:30 PM'
  },
  {
    name: 'Farida Banu',
    age: 38,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 97908 22176',
    email: 'farida.b@healthgrid.in',
    location: 'Chromepet, Chennai, TN',
    dob: '1988-08-16',
    chronicConditions: ['Recurrent Urinary Tract Infection'],
    knownAllergies: ['Nitrofurantoin'],
    currentMedications: [
      { name: 'Cranberry extract sachets', dosage: 'Once daily', timing: 'With water' }
    ],
    emergencyContact: { name: 'Bashir Ahmed', relation: 'Spouse', phone: '+91 97908 22177' },
    reason: 'Dysuria and frequency for 3 days, urine routine review',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '04:45 PM'
  },
  {
    name: 'Ramesh Sundar',
    age: 66,
    gender: 'Male',
    bloodGroup: 'AB+',
    phone: '+91 94442 88419',
    email: 'ramesh.s@healthgrid.in',
    location: 'Pallavaram, Chennai, TN',
    dob: '1960-04-05',
    chronicConditions: ['Benign Prostatic Hyperplasia (BPH)', 'Hypertension'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Tamsulosin 0.4mg', dosage: '0-0-1', timing: 'After dinner' },
      { name: 'Amlodipine 5mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Jayanthi Ramesh', relation: 'Spouse', phone: '+91 94442 88420' },
    reason: 'Nocturia 4-5 times per night, urinary hesitancy assessment',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '05:00 PM'
  },
  {
    name: 'Hema Malini S',
    age: 54,
    gender: 'Female',
    bloodGroup: 'O-',
    phone: '+91 94433 99120',
    email: 'hema.s@healthgrid.in',
    location: 'Vadapalani, Chennai, TN',
    dob: '1972-06-25',
    chronicConditions: ['Type 2 Diabetes', 'Retinopathy Stage 1'],
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { name: 'Metformin 850mg', dosage: '1-0-1', timing: 'With meals' }
    ],
    emergencyContact: { name: 'Shankar S', relation: 'Spouse', phone: '+91 94433 99121' },
    reason: 'Annual diabetic ophthalmology and nephropathy screening clearance',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '05:15 PM'
  },
  {
    name: 'Kishore Kumar',
    age: 49,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+91 98402 77190',
    email: 'kishore.k@healthgrid.in',
    location: 'Virugambakkam, Chennai, TN',
    dob: '1977-12-12',
    chronicConditions: ['Hypertension', 'Dyslipidemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Telmisartan 40mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Usha Kishore', relation: 'Spouse', phone: '+91 98402 77191' },
    reason: 'Routine quarterly cardiovascular wellness check',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '05:30 PM'
  },
  {
    name: 'Sunita Rao',
    age: 35,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 98841 88302',
    email: 'sunita.rao@healthgrid.in',
    location: 'Chetpet, Chennai, TN',
    dob: '1991-09-08',
    chronicConditions: ['Chronic Tension-Type Headache'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Amitriptyline 10mg', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Praveen Rao', relation: 'Spouse', phone: '+91 98841 88303' },
    reason: 'Occipital band-like tightness radiating to neck',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '05:45 PM'
  },
  {
    name: 'Gopalakrishnan V',
    age: 72,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 94440 11928',
    email: 'gopal.v@healthgrid.in',
    location: 'Mandaveli, Chennai, TN',
    dob: '1954-05-03',
    chronicConditions: ['Parkinsonism (Early Stage)', 'Hypertension'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Levodopa + Carbidopa 100/25', dosage: '1-1-1', timing: 'Before meals' }
    ],
    emergencyContact: { name: 'Venkat Gopal', relation: 'Son', phone: '+91 94440 11929' },
    reason: 'Mild resting tremor in right hand and bradykinesia check',
    department: 'General Medicine',
    status: 'Checked In',
    appointmentTime: '06:00 PM'
  },
  {
    name: 'Anitha Selvaraj',
    age: 43,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 97911 33490',
    email: 'anitha.s@healthgrid.in',
    location: 'Perambur, Chennai, TN',
    dob: '1983-04-17',
    chronicConditions: ['Type 2 Diabetes'],
    knownAllergies: ['Sulfa drugs'],
    currentMedications: [
      { name: 'Glipizide 5mg', dosage: '1-0-0', timing: '30 min before breakfast' }
    ],
    emergencyContact: { name: 'Selvaraj M', relation: 'Spouse', phone: '+91 97911 33491' },
    reason: 'Fasting glucose titration, dietary advice',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '06:15 PM'
  },
  {
    name: 'Nitin Gadkari S',
    age: 38,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98230 44512',
    email: 'nitin.s@healthgrid.in',
    location: 'Maduravoyal, Chennai, TN',
    dob: '1988-10-09',
    chronicConditions: ['Fatty Liver Grade 2'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Silymarin 140mg', dosage: '1-0-1', timing: 'Post food' }
    ],
    emergencyContact: { name: 'Anjali S', relation: 'Spouse', phone: '+91 98230 44513' },
    reason: 'Abdominal ultrasound review, lifestyle protocol update',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '06:30 PM'
  },
  {
    name: 'Saranya Mohan',
    age: 25,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 97891 22345',
    email: 'saranya.m@healthgrid.in',
    location: 'Valasaravakkam, Chennai, TN',
    dob: '2001-02-14',
    chronicConditions: ['Seasonal Bronchospasm'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Montelukast + Levocetirizine', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Mohan K', relation: 'Father', phone: '+91 97891 22346' },
    reason: 'Dry cough triggered by air conditioning and dust',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '06:45 PM'
  },
  {
    name: 'Prakash Chandran',
    age: 52,
    gender: 'Male',
    bloodGroup: 'AB-',
    phone: '+91 94443 55901',
    email: 'prakash.c@healthgrid.in',
    location: 'Teynampet, Chennai, TN',
    dob: '1974-08-04',
    chronicConditions: ['Hypertension', 'Hyperuricemia'],
    knownAllergies: ['Aspirin'],
    currentMedications: [
      { name: 'Losartan 50mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Sujatha Prakash', relation: 'Spouse', phone: '+91 94443 55902' },
    reason: 'Asymptomatic serum uric acid 8.4 mg/dL evaluation',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '07:00 PM'
  },
  {
    name: 'Kavita Joshi',
    age: 30,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 98190 77123',
    email: 'kavita.j@healthgrid.in',
    location: 'Vadapalani, Chennai, TN',
    dob: '1996-12-01',
    chronicConditions: ['None reported'],
    knownAllergies: ['None reported'],
    currentMedications: [],
    emergencyContact: { name: 'Amit Joshi', relation: 'Spouse', phone: '+91 98190 77124' },
    reason: 'Pre-employment comprehensive clinical fitness assessment',
    department: 'General Medicine',
    status: 'Completed',
    appointmentTime: '07:15 PM'
  },
  {
    name: 'Babu Janakiraman',
    age: 69,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 94441 66890',
    email: 'babu.j@healthgrid.in',
    location: 'Washermanpet, Chennai, TN',
    dob: '1957-07-19',
    chronicConditions: ['Type 2 Diabetes', 'Hypertension', 'Cataract (Left Eye)'],
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { name: 'Metformin 500mg', dosage: '1-0-1', timing: 'Post meal' },
      { name: 'Enalapril 5mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Ravi Babu', relation: 'Son', phone: '+91 94441 66891' },
    reason: 'Pre-operative cataract surgery medical clearance',
    department: 'General Medicine',
    status: 'Checked In',
    appointmentTime: '07:30 PM'
  },
  {
    name: 'Nalini Sundar',
    age: 56,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+91 94432 11456',
    email: 'nalini.s@healthgrid.in',
    location: 'Choolaimedu, Chennai, TN',
    dob: '1970-01-28',
    chronicConditions: ['Hypothyroidism', 'Osteoarthritis'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Thyroxine 88mcg', dosage: '1-0-0', timing: 'Empty stomach' }
    ],
    emergencyContact: { name: 'Sundar R', relation: 'Spouse', phone: '+91 94432 11457' },
    reason: 'Bilateral ankle stiffness and weight stagnation',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '07:45 PM'
  },
  {
    name: 'Dinesh Karthik M',
    age: 29,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 98403 88129',
    email: 'dinesh.k@healthgrid.in',
    location: 'Manapakkam, Chennai, TN',
    dob: '1997-05-15',
    chronicConditions: ['Sports Hamstring Strain'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Aceclofenac + Paracetamol', dosage: '1-0-1', timing: 'Post meal for 3 days' }
    ],
    emergencyContact: { name: 'Muthu K', relation: 'Father', phone: '+91 98403 88130' },
    reason: 'Left hamstring tenderness after recreational football',
    department: 'Orthopedics',
    status: 'Scheduled',
    appointmentTime: '08:00 PM'
  },
  {
    name: 'Usha Rani K',
    age: 63,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 94440 88219',
    email: 'usha.rani@healthgrid.in',
    location: 'Triplicane, Chennai, TN',
    dob: '1963-09-12',
    chronicConditions: ['Type 2 Diabetes', 'Peripheral Neuropathy'],
    knownAllergies: ['Sulfa drugs'],
    currentMedications: [
      { name: 'Dapagliflozin 10mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Kumaravel P', relation: 'Spouse', phone: '+91 94440 88220' },
    reason: 'Follow-up on renal function tests and urine microalbumin',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '08:15 PM'
  },
  {
    name: 'Sridhar Venkat',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 98844 77210',
    email: 'sridhar.v@healthgrid.in',
    location: 'Kodambakkam, Chennai, TN',
    dob: '1981-06-20',
    chronicConditions: ['Essential Hypertension'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Cilnidipine 10mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Anuradha Sridhar', relation: 'Spouse', phone: '+91 98844 77211' },
    reason: 'Occasional mild dizziness and blood pressure monitoring',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '08:30 PM'
  },
  {
    name: 'Karpagam Shanmugam',
    age: 59,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 94446 11290',
    email: 'karpagam.s@healthgrid.in',
    location: 'Adambakkam, Chennai, TN',
    dob: '1967-11-24',
    chronicConditions: ['Type 2 Diabetes', 'Dyslipidemia'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Metformin 500mg', dosage: '1-0-1', timing: 'Post food' },
      { name: 'Atorvastatin 20mg', dosage: '0-0-1', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Shanmugam A', relation: 'Spouse', phone: '+91 94446 11291' },
    reason: 'Lipid control review, dietary adherence check',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '08:45 PM'
  },
  {
    name: 'Girish Chandra',
    age: 39,
    gender: 'Male',
    bloodGroup: 'AB+',
    phone: '+91 98114 66201',
    email: 'girish.c@healthgrid.in',
    location: 'Madhavaram, Chennai, TN',
    dob: '1987-03-04',
    chronicConditions: ['GERD'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Rabeprazole 20mg', dosage: '1-0-0', timing: 'Morning empty stomach' }
    ],
    emergencyContact: { name: 'Jyoti Chandra', relation: 'Spouse', phone: '+91 98114 66202' },
    reason: 'Water brash and epigastric heaviness after late meals',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '09:00 PM'
  },
  {
    name: 'Bhuvaneshwari R',
    age: 36,
    gender: 'Female',
    bloodGroup: 'A+',
    phone: '+91 97910 88921',
    email: 'bhuvaneshwari.r@healthgrid.in',
    location: 'Kolathur, Chennai, TN',
    dob: '1990-10-18',
    chronicConditions: ['Iron Deficiency Anemia'],
    knownAllergies: ['Penicillin'],
    currentMedications: [
      { name: 'Ferrous Fumarate 200mg', dosage: '1-0-0', timing: 'Post breakfast' }
    ],
    emergencyContact: { name: 'Ramesh Babu', relation: 'Spouse', phone: '+91 97910 88922' },
    reason: 'Follow-up complete blood count, fatigue improvement',
    department: 'General Medicine',
    status: 'Completed',
    appointmentTime: '09:15 PM'
  },
  {
    name: 'Senthil Nathan P',
    age: 48,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 94441 55098',
    email: 'senthil.n@healthgrid.in',
    location: 'Pammal, Chennai, TN',
    dob: '1978-04-12',
    chronicConditions: ['Hypertension', 'Mild Fatty Liver'],
    knownAllergies: ['None reported'],
    currentMedications: [
      { name: 'Telmisartan 40mg', dosage: '1-0-0', timing: 'Morning' }
    ],
    emergencyContact: { name: 'Kavitha Senthil', relation: 'Spouse', phone: '+91 94441 55099' },
    reason: 'Blood pressure check, lifestyle counseling',
    department: 'General Medicine',
    status: 'Scheduled',
    appointmentTime: '09:30 PM'
  },
  {
    name: 'Deepa Muthukrishnan',
    age: 31,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+91 98840 99451',
    email: 'deepa.m@healthgrid.in',
    location: 'Mylapore, Chennai, TN',
    dob: '1995-08-22',
    chronicConditions: ['Allergic Sinusitis'],
    knownAllergies: ['Dust'],
    currentMedications: [
      { name: 'Fluticasone Furoate Nasal Spray', dosage: '1 spray each nostril', timing: 'Bedtime' }
    ],
    emergencyContact: { name: 'Muthukrishnan S', relation: 'Spouse', phone: '+91 98840 99452' },
    reason: 'Facial pressure and frontal sinus headaches during winter',
    department: 'General Medicine',
    status: 'Waiting',
    appointmentTime: '09:45 PM'
  },
  {
    name: 'Mohamed Sameen S',
    age: 20,
    gender: 'Male',
    bloodGroup: 'B+',
    phone: '+91 93841 80516',
    email: 'sameen@healthgrid.in',
    location: 'Chennai, Tamil Nadu, India',
    dob: '2006-05-14',
    chronicConditions: ['None reported'],
    knownAllergies: ['None reported'],
    currentMedications: [],
    emergencyContact: { name: 'Shamsudeen', relation: 'Father', phone: '+91 93841 80517' },
    reason: 'Annual routine health wellness checkup and biometric verification',
    department: 'General Medicine',
    status: 'Checked In',
    appointmentTime: '10:00 AM'
  }
];

async function seedRealPatients() {
  console.log('--- HealthGrid Authentic Clinical Database Seeder ---');
  console.log(`Target Supabase: ${SUPABASE_URL}`);
  
  // 1. Fetch existing doctors to link appointments
  const { data: doctors, error: docError } = await supabase
    .from('doctors')
    .select('id, name, department, doctor_code')
    .limit(30);

  if (docError) {
    console.error('Error fetching doctors:', docError);
    process.exit(1);
  }

  const drMohamed = doctors.find(d => d.name && d.name.toLowerCase().includes('mohamed')) || doctors[0];
  console.log(`Primary Physician for Queue: ${drMohamed.name} (${drMohamed.id})`);

  // 2. Query existing patients to preserve IDs if referenced
  const { data: existingPatients, error: patFetchErr } = await supabase
    .from('patients')
    .select('id, health_id, phone_number, full_name');

  if (patFetchErr) {
    console.error('Error fetching existing patients:', patFetchErr);
    process.exit(1);
  }

  console.log(`Found ${existingPatients ? existingPatients.length : 0} existing patients in Supabase.`);

  const patientsToInsert = [];
  const todayStr = '2026-10-09';

  for (let i = 0; i < PATIENT_DATA.length; i++) {
    const item = PATIENT_DATA[i];
    const uhid = `HG-${String(1001 + i).padStart(6, '0')}`; // e.g. HG-001001 to HG-001050

    // Check if we can reuse an existing patient ID or generate clean
    const existing = existingPatients && existingPatients[i];
    const patientId = existing ? existing.id : require('crypto').randomUUID();

    const patientRecord = {
      id: patientId,
      full_name: item.name,
      age: item.age,
      gender: item.gender,
      blood_group: item.bloodGroup,
      phone_number: item.phone,
      email: item.email,
      health_id: uhid,
      dob: item.dob,
      location: item.location,
      preferred_language: 'en',
      chronic_conditions: item.chronicConditions,
      known_allergies: item.knownAllergies,
      current_medications: item.currentMedications,
      emergency_contact_name: item.emergencyContact.name,
      emergency_contact_relation: item.emergencyContact.relation,
      emergency_contact_phone: item.emergencyContact.phone,
      emergency_contacts: [item.emergencyContact],
      vaccinations: [
        { name: 'COVID-19 (Covishield / Covaxin)', date: '2021-08-15', status: 'Completed' },
        { name: 'Tetanus Toxoid (TT)', date: '2023-04-10', status: 'Up-to-date' }
      ],
      health_history: [
        {
          date: '2025-11-20',
          condition: item.chronicConditions[0] || 'Annual Preventive Checkup',
          diagnosis: item.chronicConditions[0] || 'Healthy',
          doctor: 'Dr. Mohamed',
          facility: 'Govt Medical College Hospital (GMCH)'
        }
      ],
      updated_at: new Date().toISOString()
    };

    patientsToInsert.push(patientRecord);
  }

  console.log(`Upserting ${patientsToInsert.length} authentic clinical patients...`);
  const { data: savedPatients, error: upsertErr } = await supabase
    .from('patients')
    .upsert(patientsToInsert, { onConflict: 'id' })
    .select('id, full_name, health_id, phone_number, age, gender');

  if (upsertErr) {
    console.error('Error upserting patients:', upsertErr);
    process.exit(1);
  }

  console.log(`Successfully saved ${savedPatients.length} patients into Supabase.`);

  // 3. Seed appointments for today so that Clinician "My Queue" and ERP OPD Management have live data
  console.log('Seeding linked appointments for today...');

  const appointmentsToInsert = [];
  for (let i = 0; i < savedPatients.length; i++) {
    const pat = savedPatients[i];
    const meta = PATIENT_DATA[i];

    // Pick doctor: first 25 for Dr. Mohamed, rest distributed among other doctors
    let targetDoc = drMohamed;
    if (i >= 25 && doctors.length > 1) {
      const otherDocs = doctors.filter(d => d.id !== drMohamed.id);
      targetDoc = otherDocs[i % otherDocs.length] || drMohamed;
    }

    const apptId = `APPT-20261009-${String(i + 1).padStart(3, '0')}`;

    appointmentsToInsert.push({
      appointment_id: apptId,
      patient_id: pat.id,
      patient_health_id: pat.health_id,
      patient_name: pat.full_name,
      patient_phone: pat.phone_number,
      patient_age: pat.age,
      patient_gender: pat.gender,
      doctor_id: targetDoc.id,
      doctor_name: targetDoc.name,
      department: targetDoc.department || meta.department,
      appointment_date: todayStr,
      appointment_time: meta.appointmentTime,
      appointment_type: 'Consultation',
      status: meta.status, // 'Checked In', 'Waiting', 'In Consultation', 'Completed', 'Scheduled'
      reason_for_visit: meta.reason,
      notes: `Chief complaint: ${meta.reason}. Allergies: ${meta.knownAllergies ? meta.knownAllergies.join(', ') : 'None'}.`,
      consultation_fee: 500,
      payment_status: 'Paid',
      source: 'Hospital Reception / Self Kiosk'
    });
  }

  // Clear existing appointments for today before inserting to avoid duplicates
  await supabase.from('appointments').delete().eq('appointment_date', todayStr);

  const { data: savedAppts, error: apptErr } = await supabase
    .from('appointments')
    .insert(appointmentsToInsert)
    .select('id, appointment_id, patient_name, doctor_name, status');

  if (apptErr) {
    console.error('Error inserting appointments:', apptErr);
  } else {
    console.log(`Successfully seeded ${savedAppts.length} appointments for ${todayStr}.`);
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  const { count: finalPatCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
  const { count: finalApptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
  console.log(`Total Patients in Database: ${finalPatCount}`);
  console.log(`Total Appointments in Database: ${finalApptCount}`);
  console.log('Seeding completed successfully!');
}

seedRealPatients().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
