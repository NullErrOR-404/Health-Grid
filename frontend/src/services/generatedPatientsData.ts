// ==============================================================================
// HealthGrid Authentic 50 Real Database Patients & Linked Appointments
// Generated directly from Supabase PostgreSQL public.patients & public.appointments
// Matches DB UUIDs, HealthIDs, Roles and Real Clinical Records
// ==============================================================================

export interface DatabasePatientRecord {
  id: string;
  health_id: string;
  full_name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  blood_group: string;
  phone_number: string;
  email: string;
  location: string;
  dob?: string;
  preferred_language?: string;
  chronic_conditions: string[];
  known_allergies: string[];
  current_medications: Array<{ name: string; dosage?: string; timing?: string }>;
  emergency_contacts: Array<{ name: string; relation: string; phone: string }>;
  role?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface DatabaseAppointmentRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  patient_health_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  patient_gender: string;
  patient_avatar?: string | null;
  doctor_id: string;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason_for_visit: string;
  notes: string;
  consultation_fee: number | string;
  payment_status: string;
  source?: string;
  checked_in_at?: string | null;
  clinical_observations?: string | null;
  cancellation_reason?: string | null;
  rescheduled_from?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const AUTHENTIC_PATIENTS_50: DatabasePatientRecord[] = [
  {
    "id": "a9bd2039-a968-4986-b5d6-d5c9ffda10d5",
    "phone_number": "+91 94451 98210",
    "full_name": "Priya Sharma",
    "age": 28,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "None reported"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-09-30T18:45:15.767Z",
    "updated_at": "2026-10-09T04:29:59.456Z",
    "email": "priya.sharma@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001001",
    "emergency_contact_name": "Vikram Sharma",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94451 98211",
    "dob": "1998-04-12",
    "blood_group": "B+",
    "location": "Anna Nagar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Vikram Sharma",
        "phone": "+91 94451 98211",
        "relation": "Spouse"
      }
    ],
    "current_medications": [],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "None reported",
        "diagnosis": "None reported"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "4456af1e-49a0-459d-8b33-429dc8328822",
    "phone_number": "+91 98401 22891",
    "full_name": "Rajesh Kumar",
    "age": 58,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes Mellitus",
      "Essential Hypertension"
    ],
    "known_allergies": [
      "Penicillin"
    ],
    "created_at": "2026-10-06T16:39:06.286Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "rajesh.kumar@healthgrid.in",
    "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    "health_id": "HG-001002",
    "emergency_contact_name": "Kavitha Kumar",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98401 22892",
    "dob": "1968-08-25",
    "blood_group": "O+",
    "location": "T. Nagar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Kavitha Kumar",
        "phone": "+91 98401 22892",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Metformin 500mg",
        "dosage": "1-0-1",
        "timing": "After food"
      },
      {
        "name": "Telmisartan 40mg",
        "dosage": "1-0-0",
        "timing": "Morning after food"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes Mellitus",
        "diagnosis": "Type 2 Diabetes Mellitus"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "5a69ca86-4030-4379-93f0-f70a985cf96d",
    "phone_number": "+91 98842 11090",
    "full_name": "Ananya Venkataraman",
    "age": 34,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Hypothyroidism"
    ],
    "known_allergies": [
      "Sulfa drugs"
    ],
    "created_at": "2026-10-06T16:39:06.386Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "ananya.v@healthgrid.in",
    "avatar_url": "",
    "health_id": "HG-001003",
    "emergency_contact_name": "Venkataraman R",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 98842 11091",
    "dob": "1992-11-03",
    "blood_group": "A+",
    "location": "Adyar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Venkataraman R",
        "phone": "+91 98842 11091",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Levothyroxine 50mcg",
        "dosage": "1-0-0",
        "timing": "Early morning empty stomach"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Hypothyroidism",
        "diagnosis": "Hypothyroidism"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "e2aae464-f646-4207-bded-7b1240da248d",
    "phone_number": "+91 97910 44521",
    "full_name": "Mohammed Farhan",
    "age": 42,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Bronchial Asthma"
    ],
    "known_allergies": [
      "Aspirin / NSAIDs"
    ],
    "created_at": "2026-10-06T16:39:06.539Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "farhan.m@healthgrid.in",
    "avatar_url": "",
    "health_id": "HG-001004",
    "emergency_contact_name": "Ayesha Farhan",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 97910 44522",
    "dob": "1984-02-18",
    "blood_group": "B+",
    "location": "Royapettah, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Ayesha Farhan",
        "phone": "+91 97910 44522",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Budesonide 200mcg Inhaler",
        "dosage": "2 puffs",
        "timing": "Twice daily"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Bronchial Asthma",
        "diagnosis": "Bronchial Asthma"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "3eb32d40-732b-489e-a714-6bc48feb7837",
    "phone_number": "+91 94443 88120",
    "full_name": "Kavitha Subramanian",
    "age": 51,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Osteoarthritis (Bilateral Knees)",
      "Dyslipidemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-06T16:39:06.635Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "kavitha.sub@healthgrid.in",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    "health_id": "HG-001005",
    "emergency_contact_name": "Subramanian S",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94443 88121",
    "dob": "1975-06-30",
    "blood_group": "O+",
    "location": "Mylapore, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Subramanian S",
        "phone": "+91 94443 88121",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Atorvastatin 10mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      },
      {
        "name": "Paracetamol 650mg",
        "dosage": "As needed",
        "timing": "For severe knee pain"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Osteoarthritis (Bilateral Knees)",
        "diagnosis": "Osteoarthritis (Bilateral Knees)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "fb543464-349b-4b02-8ff2-55121c0f6f80",
    "phone_number": "+91 98112 33456",
    "full_name": "Gurpreet Singh",
    "age": 46,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes Mellitus",
      "Fatty Liver Grade 1"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-06T16:39:06.739Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "gurpreet.s@healthgrid.in",
    "avatar_url": "",
    "health_id": "HG-001006",
    "emergency_contact_name": "Harpreet Kaur",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98112 33457",
    "dob": "1980-09-14",
    "blood_group": "AB+",
    "location": "Kilpauk, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Harpreet Kaur",
        "phone": "+91 98112 33457",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Metformin 1000mg",
        "dosage": "1-0-1",
        "timing": "With meals"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes Mellitus",
        "diagnosis": "Type 2 Diabetes Mellitus"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "d6a12729-5963-4a43-9595-18b2c83b9edd",
    "phone_number": "+91 94432 77890",
    "full_name": "Lakshmi Narayanan",
    "age": 67,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Coronary Artery Disease (Post-PTCA 2021)",
      "Hypertension"
    ],
    "known_allergies": [
      "Contrast dye"
    ],
    "created_at": "2026-10-06T16:39:06.845Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "lakshmi.n@healthgrid.in",
    "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    "health_id": "HG-001007",
    "emergency_contact_name": "Srinivasan L",
    "emergency_contact_relation": "Son",
    "emergency_contact_phone": "+91 94432 77891",
    "dob": "1959-01-20",
    "blood_group": "O+",
    "location": "Gandhi Nagar, Vellore, TN",
    "emergency_contacts": [
      {
        "name": "Srinivasan L",
        "phone": "+91 94432 77891",
        "relation": "Son"
      }
    ],
    "current_medications": [
      {
        "name": "Aspirin 75mg",
        "dosage": "0-1-0",
        "timing": "After lunch"
      },
      {
        "name": "Clopidogrel 75mg",
        "dosage": "0-1-0",
        "timing": "After lunch"
      },
      {
        "name": "Metoprolol 25mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Coronary Artery Disease (Post-PTCA 2021)",
        "diagnosis": "Coronary Artery Disease (Post-PTCA 2021)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "d75d3db0-d5b2-473e-8e5a-a46c3e8c4ac1",
    "phone_number": "+91 98301 55678",
    "full_name": "Sneha Mukherjee",
    "age": 24,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Migraine with Aura"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-06T16:39:06.949Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "sneha.m@healthgrid.in",
    "avatar_url": "",
    "health_id": "HG-001008",
    "emergency_contact_name": "Debashis Mukherjee",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 98301 55679",
    "dob": "2002-07-09",
    "blood_group": "B-",
    "location": "Velachery, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Debashis Mukherjee",
        "phone": "+91 98301 55679",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Naproxen 500mg",
        "dosage": "PRN",
        "timing": "At onset of headache"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Migraine with Aura",
        "diagnosis": "Migraine with Aura"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "a63f7521-4d1f-4852-aeb2-41381fbabf97",
    "phone_number": "+91 98220 99812",
    "full_name": "Rahul Deshmukh",
    "age": 39,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "GERD",
      "Hyperuricemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-06T16:39:07.038Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "rahul.d@healthgrid.in",
    "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    "health_id": "HG-001009",
    "emergency_contact_name": "Pooja Deshmukh",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98220 99813",
    "dob": "1987-03-27",
    "blood_group": "A+",
    "location": "Sholinganallur, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Pooja Deshmukh",
        "phone": "+91 98220 99813",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Pantoprazole 40mg",
        "dosage": "1-0-0",
        "timing": "Morning 30 min before breakfast"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "GERD",
        "diagnosis": "GERD"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "2c6b11b5-b005-4e9b-9932-8fae83a1f749",
    "phone_number": "+91 94440 22319",
    "full_name": "Meena Ramanathan",
    "age": 62,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Osteopenia",
      "Hypertension"
    ],
    "known_allergies": [
      "Ciprofloxacin"
    ],
    "created_at": "2026-10-06T16:39:07.148Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "meena.r@healthgrid.in",
    "avatar_url": "",
    "health_id": "HG-001010",
    "emergency_contact_name": "Karthik Ramanathan",
    "emergency_contact_relation": "Son",
    "emergency_contact_phone": "+91 94440 22320",
    "dob": "1964-10-15",
    "blood_group": "AB-",
    "location": "Thiruvanmiyur, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Karthik Ramanathan",
        "phone": "+91 94440 22320",
        "relation": "Son"
      }
    ],
    "current_medications": [
      {
        "name": "Glimepiride 1mg",
        "dosage": "1-0-0",
        "timing": "Before breakfast"
      },
      {
        "name": "Calcium + Vit D3",
        "dosage": "0-0-1",
        "timing": "After dinner"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "35c96e32-e797-48bb-a355-e50efeb61de8",
    "phone_number": "+91 98840 55123",
    "full_name": "Arun Prakash",
    "age": 31,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Allergic Rhinitis"
    ],
    "known_allergies": [
      "Dust Mite",
      "Pollen"
    ],
    "created_at": "2026-10-06T16:39:07.256Z",
    "updated_at": "2026-10-09T04:29:59.460Z",
    "email": "arun.prakash@healthgrid.in",
    "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    "health_id": "HG-001011",
    "emergency_contact_name": "Deepa Prakash",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98840 55124",
    "dob": "1995-05-19",
    "blood_group": "O+",
    "location": "Porur, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Deepa Prakash",
        "phone": "+91 98840 55124",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Levocetirizine 5mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Allergic Rhinitis",
        "diagnosis": "Allergic Rhinitis"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "32700825-9670-4a93-b365-7dc33fd98928",
    "phone_number": "+91 98765 43215",
    "full_name": "Fathima Begum",
    "age": 50,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Hypertension",
      "Mild Hypothyroidism"
    ],
    "known_allergies": [
      "Sulfa drugs"
    ],
    "created_at": "2026-09-30T19:50:26.588Z",
    "updated_at": "2026-10-09T04:29:59.461Z",
    "email": "fathima.b@healthgrid.in",
    "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    "health_id": "HG-001012",
    "emergency_contact_name": "Ismail Begum",
    "emergency_contact_relation": "Son",
    "emergency_contact_phone": "+91 98765 43216",
    "dob": "1976-12-08",
    "blood_group": "B+",
    "location": "Triplicane, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Ismail Begum",
        "phone": "+91 98765 43216",
        "relation": "Son"
      }
    ],
    "current_medications": [
      {
        "name": "Amlodipine 5mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Hypertension",
        "diagnosis": "Hypertension"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "61e919d6-5862-4066-8396-0a077eeacc0e",
    "phone_number": "+91 98765 43216",
    "full_name": "Vignesh Sundaram",
    "age": 36,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Plaque Psoriasis"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-01T05:52:46.771Z",
    "updated_at": "2026-10-09T04:29:59.461Z",
    "email": "vignesh.s@healthgrid.in",
    "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIm8A9JEqA5CbTFnPLBOvQxV1fBFbMcpfXZzJdyW5gPsCmKEKEQ=s96-c",
    "health_id": "HG-001013",
    "emergency_contact_name": "Sundaram V",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 98765 43217",
    "dob": "1990-08-01",
    "blood_group": "A-",
    "location": "Guindy, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Sundaram V",
        "phone": "+91 98765 43217",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Clobetasol Propionate 0.05%",
        "dosage": "Apply BD",
        "timing": "Topical on plaques"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Plaque Psoriasis",
        "diagnosis": "Plaque Psoriasis"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "7bb48cda-eaf9-4618-9ce2-56e0f838512f",
    "phone_number": "+91 98105 66723",
    "full_name": "Deepak Verma",
    "age": 44,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Gouty Arthritis"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.462Z",
    "email": "deepak.verma@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001014",
    "emergency_contact_name": "Sunita Verma",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98105 66724",
    "dob": "1982-01-14",
    "blood_group": "O-",
    "location": "Nungambakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Sunita Verma",
        "phone": "+91 98105 66724",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Febuxostat 40mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Gouty Arthritis",
        "diagnosis": "Gouty Arthritis"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "4997b306-86d2-4088-a329-c83ec99587c8",
    "phone_number": "+91 98310 77412",
    "full_name": "Ritu Sen",
    "age": 29,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Polycystic Ovary Syndrome (PCOS)"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "ritu.sen@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001015",
    "emergency_contact_name": "Amit Sen",
    "emergency_contact_relation": "Brother",
    "emergency_contact_phone": "+91 98310 77413",
    "dob": "1997-04-22",
    "blood_group": "AB+",
    "location": "Perungudi, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Amit Sen",
        "phone": "+91 98310 77413",
        "relation": "Brother"
      }
    ],
    "current_medications": [
      {
        "name": "Inositol + Folic Acid",
        "dosage": "1-0-1",
        "timing": "With water"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Polycystic Ovary Syndrome (PCOS)",
        "diagnosis": "Polycystic Ovary Syndrome (PCOS)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "c8c468b5-a3a9-45f2-8cd9-0eee603329a1",
    "phone_number": "+91 94441 33201",
    "full_name": "Suresh Babu",
    "age": 64,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Chronic Obstructive Pulmonary Disease (COPD)",
      "Hypertension"
    ],
    "known_allergies": [
      "Penicillin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "suresh.babu@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001016",
    "emergency_contact_name": "Radha Suresh",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94441 33202",
    "dob": "1962-09-05",
    "blood_group": "B+",
    "location": "Ambattur, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Radha Suresh",
        "phone": "+91 94441 33202",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Tiotropium 18mcg DPI",
        "dosage": "1 cap inhalation",
        "timing": "Daily morning"
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Chronic Obstructive Pulmonary Disease (COPD)",
        "diagnosis": "Chronic Obstructive Pulmonary Disease (COPD)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "29f349da-1cfd-4665-8e41-fd1968d641c5",
    "phone_number": "+91 97890 88234",
    "full_name": "Divya Ravichandran",
    "age": 22,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Iron Deficiency Anemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "divya.ravi@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001017",
    "emergency_contact_name": "Ravichandran K",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 97890 88235",
    "dob": "2004-03-10",
    "blood_group": "A+",
    "location": "Tambaram, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Ravichandran K",
        "phone": "+91 97890 88235",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Ferrous Ascorbate 100mg",
        "dosage": "0-1-0",
        "timing": "Post lunch with lemon water"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Iron Deficiency Anemia",
        "diagnosis": "Iron Deficiency Anemia"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "7b2757f2-d235-4c4e-aa25-71523ad05fc5",
    "phone_number": "+91 98412 44509",
    "full_name": "Karthik Natarajan",
    "age": 37,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Cervical Spondylosis"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "karthik.n@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001018",
    "emergency_contact_name": "Priya Karthik",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98412 44510",
    "dob": "1989-12-19",
    "blood_group": "O+",
    "location": "Kotturpuram, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Priya Karthik",
        "phone": "+91 98412 44510",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Thiocolchicoside 4mg",
        "dosage": "1-0-1",
        "timing": "Post food"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Cervical Spondylosis",
        "diagnosis": "Cervical Spondylosis"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "60dbed7d-4242-40d3-a557-47eb3738fa1a",
    "phone_number": "+91 98204 99120",
    "full_name": "Pooja Hegde",
    "age": 33,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Generalized Anxiety Disorder"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "pooja.h@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001019",
    "emergency_contact_name": "Raghav Hegde",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98204 99121",
    "dob": "1993-06-14",
    "blood_group": "B+",
    "location": "Alwarpet, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Raghav Hegde",
        "phone": "+91 98204 99121",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Escitalopram 10mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Generalized Anxiety Disorder",
        "diagnosis": "Generalized Anxiety Disorder"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "09042794-7460-45c6-81a0-ddbab13239d2",
    "phone_number": "+91 94450 66712",
    "full_name": "Balaji Krishnan",
    "age": 55,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Diabetic Neuropathy"
    ],
    "known_allergies": [
      "Penicillin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "balaji.k@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001020",
    "emergency_contact_name": "Gita Balaji",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94450 66713",
    "dob": "1971-08-30",
    "blood_group": "A+",
    "location": "Saidapet, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Gita Balaji",
        "phone": "+91 94450 66713",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Metformin + Vildagliptin 50/500",
        "dosage": "1-0-1",
        "timing": "With meals"
      },
      {
        "name": "Pregabalin 75mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "b38ad419-9a6b-4ea5-a273-d6b7c0f0f10c",
    "phone_number": "+91 94431 88902",
    "full_name": "Shanthi Mani",
    "age": 48,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Fibromyalgia",
      "Hypertension"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "shanthi.mani@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001021",
    "emergency_contact_name": "Mani K",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94431 88903",
    "dob": "1978-02-14",
    "blood_group": "O+",
    "location": "Adayar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Mani K",
        "phone": "+91 94431 88903",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Telmisartan 20mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      },
      {
        "name": "Duloxetine 30mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Fibromyalgia",
        "diagnosis": "Fibromyalgia"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "3fad8f8a-05e4-4234-b58d-44006bd24744",
    "phone_number": "+91 98110 55431",
    "full_name": "Manoj Tiwari",
    "age": 41,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Dyslipidemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.463Z",
    "email": "manoj.tiwari@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001022",
    "emergency_contact_name": "Rekha Tiwari",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98110 55432",
    "dob": "1985-05-11",
    "blood_group": "B-",
    "location": "Madipakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Rekha Tiwari",
        "phone": "+91 98110 55432",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Rosuvastatin 10mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Dyslipidemia",
        "diagnosis": "Dyslipidemia"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "836413e6-f704-4e51-b41b-23280870cbd4",
    "phone_number": "+91 99890 11425",
    "full_name": "Swathi Reddy",
    "age": 26,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Acne Vulgaris"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "swathi.r@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001023",
    "emergency_contact_name": "Srinivas Reddy",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 99890 11426",
    "dob": "2000-09-02",
    "blood_group": "AB+",
    "location": "Thoraipakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Srinivas Reddy",
        "phone": "+91 99890 11426",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Benzoyl Peroxide 2.5% Gel",
        "dosage": "Once daily",
        "timing": "Night"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Acne Vulgaris",
        "diagnosis": "Acne Vulgaris"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "2763f50c-7070-4189-9eb8-bb8005beeff6",
    "phone_number": "+91 98140 22189",
    "full_name": "Vijay Chawla",
    "age": 53,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Non-Alcoholic Fatty Liver (NAFLD)",
      "Hypertension"
    ],
    "known_allergies": [
      "Sulfa drugs"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "vijay.chawla@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001024",
    "emergency_contact_name": "Simran Chawla",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98140 22190",
    "dob": "1973-10-21",
    "blood_group": "A+",
    "location": "Egmore, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Simran Chawla",
        "phone": "+91 98140 22190",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Olmesartan 20mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      },
      {
        "name": "Vitamin E 400 IU",
        "dosage": "0-1-0",
        "timing": "Post lunch"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Non-Alcoholic Fatty Liver (NAFLD)",
        "diagnosis": "Non-Alcoholic Fatty Liver (NAFLD)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "4e921128-8d49-4f3e-bc30-10918e03a5c5",
    "phone_number": "+91 94445 77109",
    "full_name": "Revathi Sridhar",
    "age": 60,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Hypothyroidism",
      "Hypertension"
    ],
    "known_allergies": [
      "Cephalosporins"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "revathi.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001025",
    "emergency_contact_name": "Sridhar R",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94445 77110",
    "dob": "1966-03-15",
    "blood_group": "O+",
    "location": "T. Nagar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Sridhar R",
        "phone": "+91 94445 77110",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Teneligliptin 20mg",
        "dosage": "1-0-0",
        "timing": "Before breakfast"
      },
      {
        "name": "Thyroxine 75mcg",
        "dosage": "1-0-0",
        "timing": "Fasting"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "a4c9d4c6-eb33-4f4e-8d70-ef6ba8cb7a5f",
    "phone_number": "+91 98409 66124",
    "full_name": "Naveen Kumar",
    "age": 32,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Lumbar Disc Bulge L4-L5"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "naveen.k@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001026",
    "emergency_contact_name": "Sowmya Naveen",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98409 66125",
    "dob": "1994-07-29",
    "blood_group": "B+",
    "location": "Besant Nagar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Sowmya Naveen",
        "phone": "+91 98409 66125",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Pregabalin 50mg",
        "dosage": "0-0-1",
        "timing": "Night"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Lumbar Disc Bulge L4-L5",
        "diagnosis": "Lumbar Disc Bulge L4-L5"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "32c3e489-4a2d-4554-bee2-569b58f97db3",
    "phone_number": "+91 94435 11980",
    "full_name": "Geetha Narayanan",
    "age": 47,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Premenopausal Menorrhagia",
      "Mild Anemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "geetha.n@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001027",
    "emergency_contact_name": "Narayanan P",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94435 11981",
    "dob": "1979-11-18",
    "blood_group": "A-",
    "location": "K.K. Nagar, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Narayanan P",
        "phone": "+91 94435 11981",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Tranexamic Acid 500mg",
        "dosage": "PRN",
        "timing": "During heavy flow"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Premenopausal Menorrhagia",
        "diagnosis": "Premenopausal Menorrhagia"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "ba293b4f-c706-4c4e-ba40-0437f4ef355c",
    "phone_number": "+91 98846 33901",
    "full_name": "Ashwin Iyer",
    "age": 27,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Irritable Bowel Syndrome (IBS-D)"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "ashwin.iyer@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001028",
    "emergency_contact_name": "Meenakshi Iyer",
    "emergency_contact_relation": "Mother",
    "emergency_contact_phone": "+91 98846 33902",
    "dob": "1999-01-08",
    "blood_group": "O+",
    "location": "Triplicane, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Meenakshi Iyer",
        "phone": "+91 98846 33902",
        "relation": "Mother"
      }
    ],
    "current_medications": [
      {
        "name": "Mebeverine 135mg",
        "dosage": "1-0-1",
        "timing": "20 min before meals"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Irritable Bowel Syndrome (IBS-D)",
        "diagnosis": "Irritable Bowel Syndrome (IBS-D)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "0024a29e-ff51-4c1b-bb33-01181fd28daf",
    "phone_number": "+91 97908 22176",
    "full_name": "Farida Banu",
    "age": 38,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Recurrent Urinary Tract Infection"
    ],
    "known_allergies": [
      "Nitrofurantoin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "farida.b@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001029",
    "emergency_contact_name": "Bashir Ahmed",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 97908 22177",
    "dob": "1988-08-16",
    "blood_group": "B+",
    "location": "Chromepet, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Bashir Ahmed",
        "phone": "+91 97908 22177",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Cranberry extract sachets",
        "dosage": "Once daily",
        "timing": "With water"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Recurrent Urinary Tract Infection",
        "diagnosis": "Recurrent Urinary Tract Infection"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "3f6faa66-831d-4c26-967a-3081589a9627",
    "phone_number": "+91 94442 88419",
    "full_name": "Ramesh Sundar",
    "age": 66,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Benign Prostatic Hyperplasia (BPH)",
      "Hypertension"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "ramesh.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001030",
    "emergency_contact_name": "Jayanthi Ramesh",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94442 88420",
    "dob": "1960-04-05",
    "blood_group": "AB+",
    "location": "Pallavaram, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Jayanthi Ramesh",
        "phone": "+91 94442 88420",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Tamsulosin 0.4mg",
        "dosage": "0-0-1",
        "timing": "After dinner"
      },
      {
        "name": "Amlodipine 5mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Benign Prostatic Hyperplasia (BPH)",
        "diagnosis": "Benign Prostatic Hyperplasia (BPH)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "5c36971f-e821-445f-9482-48337444a5e2",
    "phone_number": "+91 94433 99120",
    "full_name": "Hema Malini S",
    "age": 54,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Retinopathy Stage 1"
    ],
    "known_allergies": [
      "Penicillin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "hema.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001031",
    "emergency_contact_name": "Shankar S",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94433 99121",
    "dob": "1972-06-25",
    "blood_group": "O-",
    "location": "Vadapalani, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Shankar S",
        "phone": "+91 94433 99121",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Metformin 850mg",
        "dosage": "1-0-1",
        "timing": "With meals"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "2df9442d-4b4b-4eac-a452-f89128630dd7",
    "phone_number": "+91 98402 77190",
    "full_name": "Kishore Kumar",
    "age": 49,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Hypertension",
      "Dyslipidemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.464Z",
    "email": "kishore.k@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001032",
    "emergency_contact_name": "Usha Kishore",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98402 77191",
    "dob": "1977-12-12",
    "blood_group": "A+",
    "location": "Virugambakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Usha Kishore",
        "phone": "+91 98402 77191",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Hypertension",
        "diagnosis": "Hypertension"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "f3bb7b92-9a1e-4a8a-8364-55a679139742",
    "phone_number": "+91 98841 88302",
    "full_name": "Sunita Rao",
    "age": 35,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Chronic Tension-Type Headache"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "sunita.rao@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001033",
    "emergency_contact_name": "Praveen Rao",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98841 88303",
    "dob": "1991-09-08",
    "blood_group": "B+",
    "location": "Chetpet, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Praveen Rao",
        "phone": "+91 98841 88303",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Amitriptyline 10mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Chronic Tension-Type Headache",
        "diagnosis": "Chronic Tension-Type Headache"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "320a3b10-2527-45c7-895c-be5004232473",
    "phone_number": "+91 94440 11928",
    "full_name": "Gopalakrishnan V",
    "age": 72,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Parkinsonism (Early Stage)",
      "Hypertension"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "gopal.v@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001034",
    "emergency_contact_name": "Venkat Gopal",
    "emergency_contact_relation": "Son",
    "emergency_contact_phone": "+91 94440 11929",
    "dob": "1954-05-03",
    "blood_group": "O+",
    "location": "Mandaveli, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Venkat Gopal",
        "phone": "+91 94440 11929",
        "relation": "Son"
      }
    ],
    "current_medications": [
      {
        "name": "Levodopa + Carbidopa 100/25",
        "dosage": "1-1-1",
        "timing": "Before meals"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Parkinsonism (Early Stage)",
        "diagnosis": "Parkinsonism (Early Stage)"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "30a22faa-c987-46d2-b854-b46287f1d715",
    "phone_number": "+91 97911 33490",
    "full_name": "Anitha Selvaraj",
    "age": 43,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes"
    ],
    "known_allergies": [
      "Sulfa drugs"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "anitha.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001035",
    "emergency_contact_name": "Selvaraj M",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 97911 33491",
    "dob": "1983-04-17",
    "blood_group": "A+",
    "location": "Perambur, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Selvaraj M",
        "phone": "+91 97911 33491",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Glipizide 5mg",
        "dosage": "1-0-0",
        "timing": "30 min before breakfast"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "24cf3cf3-f475-48bd-a51a-59ac8d4f41c9",
    "phone_number": "+91 98230 44512",
    "full_name": "Nitin Gadkari S",
    "age": 38,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Fatty Liver Grade 2"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "nitin.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001036",
    "emergency_contact_name": "Anjali S",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98230 44513",
    "dob": "1988-10-09",
    "blood_group": "B+",
    "location": "Maduravoyal, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Anjali S",
        "phone": "+91 98230 44513",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Silymarin 140mg",
        "dosage": "1-0-1",
        "timing": "Post food"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Fatty Liver Grade 2",
        "diagnosis": "Fatty Liver Grade 2"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "c1f53053-4c3f-4563-9d8d-ef2e6492dd2f",
    "phone_number": "+91 97891 22345",
    "full_name": "Saranya Mohan",
    "age": 25,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Seasonal Bronchospasm"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "saranya.m@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001037",
    "emergency_contact_name": "Mohan K",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 97891 22346",
    "dob": "2001-02-14",
    "blood_group": "O+",
    "location": "Valasaravakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Mohan K",
        "phone": "+91 97891 22346",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Montelukast + Levocetirizine",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Seasonal Bronchospasm",
        "diagnosis": "Seasonal Bronchospasm"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "f0d9045e-a5d8-4db1-8134-66509eb4906a",
    "phone_number": "+91 94443 55901",
    "full_name": "Prakash Chandran",
    "age": 52,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Hypertension",
      "Hyperuricemia"
    ],
    "known_allergies": [
      "Aspirin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "prakash.c@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001038",
    "emergency_contact_name": "Sujatha Prakash",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94443 55902",
    "dob": "1974-08-04",
    "blood_group": "AB-",
    "location": "Teynampet, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Sujatha Prakash",
        "phone": "+91 94443 55902",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Losartan 50mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Hypertension",
        "diagnosis": "Hypertension"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "c523d015-75c0-4a8f-8388-2779d47da54b",
    "phone_number": "+91 98190 77123",
    "full_name": "Kavita Joshi",
    "age": 30,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "None reported"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "kavita.j@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001039",
    "emergency_contact_name": "Amit Joshi",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98190 77124",
    "dob": "1996-12-01",
    "blood_group": "A+",
    "location": "Vadapalani, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Amit Joshi",
        "phone": "+91 98190 77124",
        "relation": "Spouse"
      }
    ],
    "current_medications": [],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "None reported",
        "diagnosis": "None reported"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "00b97582-b33c-4214-81c0-6b4ab41ff70f",
    "phone_number": "+91 94441 66890",
    "full_name": "Babu Janakiraman",
    "age": 69,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Hypertension",
      "Cataract (Left Eye)"
    ],
    "known_allergies": [
      "Penicillin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "babu.j@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001040",
    "emergency_contact_name": "Ravi Babu",
    "emergency_contact_relation": "Son",
    "emergency_contact_phone": "+91 94441 66891",
    "dob": "1957-07-19",
    "blood_group": "O+",
    "location": "Washermanpet, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Ravi Babu",
        "phone": "+91 94441 66891",
        "relation": "Son"
      }
    ],
    "current_medications": [
      {
        "name": "Metformin 500mg",
        "dosage": "1-0-1",
        "timing": "Post meal"
      },
      {
        "name": "Enalapril 5mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "c52b3c19-b83b-4ddf-8246-31a316610f33",
    "phone_number": "+91 94432 11456",
    "full_name": "Nalini Sundar",
    "age": 56,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Hypothyroidism",
      "Osteoarthritis"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.465Z",
    "email": "nalini.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001041",
    "emergency_contact_name": "Sundar R",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94432 11457",
    "dob": "1970-01-28",
    "blood_group": "B+",
    "location": "Choolaimedu, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Sundar R",
        "phone": "+91 94432 11457",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Thyroxine 88mcg",
        "dosage": "1-0-0",
        "timing": "Empty stomach"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Hypothyroidism",
        "diagnosis": "Hypothyroidism"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "49598dd0-0103-4131-ac05-7350cba885ba",
    "phone_number": "+91 98403 88129",
    "full_name": "Dinesh Karthik M",
    "age": 29,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Sports Hamstring Strain"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.466Z",
    "email": "dinesh.k@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001042",
    "emergency_contact_name": "Muthu K",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 98403 88130",
    "dob": "1997-05-15",
    "blood_group": "O+",
    "location": "Manapakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Muthu K",
        "phone": "+91 98403 88130",
        "relation": "Father"
      }
    ],
    "current_medications": [
      {
        "name": "Aceclofenac + Paracetamol",
        "dosage": "1-0-1",
        "timing": "Post meal for 3 days"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Sports Hamstring Strain",
        "diagnosis": "Sports Hamstring Strain"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "58e5dcda-2400-445e-bb9f-35dddd6277ea",
    "phone_number": "+91 94440 88219",
    "full_name": "Usha Rani K",
    "age": 63,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Peripheral Neuropathy"
    ],
    "known_allergies": [
      "Sulfa drugs"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.466Z",
    "email": "usha.rani@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001043",
    "emergency_contact_name": "Kumaravel P",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94440 88220",
    "dob": "1963-09-12",
    "blood_group": "A+",
    "location": "Triplicane, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Kumaravel P",
        "phone": "+91 94440 88220",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Dapagliflozin 10mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "20d9ce54-b6aa-41ed-923b-bbccda1c7305",
    "phone_number": "+91 98844 77210",
    "full_name": "Sridhar Venkat",
    "age": 45,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Essential Hypertension"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.466Z",
    "email": "sridhar.v@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001044",
    "emergency_contact_name": "Anuradha Sridhar",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98844 77211",
    "dob": "1981-06-20",
    "blood_group": "B+",
    "location": "Kodambakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Anuradha Sridhar",
        "phone": "+91 98844 77211",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Cilnidipine 10mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Essential Hypertension",
        "diagnosis": "Essential Hypertension"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "43216c67-44b4-403f-9299-88a25993d22e",
    "phone_number": "+91 94446 11290",
    "full_name": "Karpagam Shanmugam",
    "age": 59,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Type 2 Diabetes",
      "Dyslipidemia"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.466Z",
    "email": "karpagam.s@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001045",
    "emergency_contact_name": "Shanmugam A",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94446 11291",
    "dob": "1967-11-24",
    "blood_group": "O+",
    "location": "Adambakkam, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Shanmugam A",
        "phone": "+91 94446 11291",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Metformin 500mg",
        "dosage": "1-0-1",
        "timing": "Post food"
      },
      {
        "name": "Atorvastatin 20mg",
        "dosage": "0-0-1",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Type 2 Diabetes",
        "diagnosis": "Type 2 Diabetes"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "86ea212c-f53b-45ec-806d-ecc9212e0646",
    "phone_number": "+91 98114 66201",
    "full_name": "Girish Chandra",
    "age": 39,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "GERD"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.466Z",
    "email": "girish.c@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001046",
    "emergency_contact_name": "Jyoti Chandra",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98114 66202",
    "dob": "1987-03-04",
    "blood_group": "AB+",
    "location": "Madhavaram, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Jyoti Chandra",
        "phone": "+91 98114 66202",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Rabeprazole 20mg",
        "dosage": "1-0-0",
        "timing": "Morning empty stomach"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "GERD",
        "diagnosis": "GERD"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "db83a4aa-b2f7-41c2-a594-df3eacb34cc9",
    "phone_number": "+91 97910 88921",
    "full_name": "Bhuvaneshwari R",
    "age": 36,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Iron Deficiency Anemia"
    ],
    "known_allergies": [
      "Penicillin"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.467Z",
    "email": "bhuvaneshwari.r@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001047",
    "emergency_contact_name": "Ramesh Babu",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 97910 88922",
    "dob": "1990-10-18",
    "blood_group": "A+",
    "location": "Kolathur, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Ramesh Babu",
        "phone": "+91 97910 88922",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Ferrous Fumarate 200mg",
        "dosage": "1-0-0",
        "timing": "Post breakfast"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Iron Deficiency Anemia",
        "diagnosis": "Iron Deficiency Anemia"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "bc5e2846-4a20-4110-bc66-34180d43b510",
    "phone_number": "+91 94441 55098",
    "full_name": "Senthil Nathan P",
    "age": 48,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "Hypertension",
      "Mild Fatty Liver"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.467Z",
    "email": "senthil.n@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001048",
    "emergency_contact_name": "Kavitha Senthil",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 94441 55099",
    "dob": "1978-04-12",
    "blood_group": "B+",
    "location": "Pammal, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Kavitha Senthil",
        "phone": "+91 94441 55099",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Telmisartan 40mg",
        "dosage": "1-0-0",
        "timing": "Morning"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Hypertension",
        "diagnosis": "Hypertension"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "ce2f9d8a-2d4c-4914-aec0-116a0ef93c98",
    "phone_number": "+91 98840 99451",
    "full_name": "Deepa Muthukrishnan",
    "age": 31,
    "gender": "Female",
    "preferred_language": "en",
    "chronic_conditions": [
      "Allergic Sinusitis"
    ],
    "known_allergies": [
      "Dust"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.467Z",
    "email": "deepa.m@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001049",
    "emergency_contact_name": "Muthukrishnan S",
    "emergency_contact_relation": "Spouse",
    "emergency_contact_phone": "+91 98840 99452",
    "dob": "1995-08-22",
    "blood_group": "O+",
    "location": "Mylapore, Chennai, TN",
    "emergency_contacts": [
      {
        "name": "Muthukrishnan S",
        "phone": "+91 98840 99452",
        "relation": "Spouse"
      }
    ],
    "current_medications": [
      {
        "name": "Fluticasone Furoate Nasal Spray",
        "dosage": "1 spray each nostril",
        "timing": "Bedtime"
      }
    ],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "Allergic Sinusitis",
        "diagnosis": "Allergic Sinusitis"
      }
    ],
    "role": "CITIZEN"
  },
  {
    "id": "5202fa41-4c2e-4efb-819d-3e271ab88232",
    "phone_number": "+91 93841 80516",
    "full_name": "Mohamed Sameen S",
    "age": 20,
    "gender": "Male",
    "preferred_language": "en",
    "chronic_conditions": [
      "None reported"
    ],
    "known_allergies": [
      "None reported"
    ],
    "created_at": "2026-10-09T04:29:59.408Z",
    "updated_at": "2026-10-09T04:29:59.467Z",
    "email": "sameen@healthgrid.in",
    "avatar_url": null,
    "health_id": "HG-001050",
    "emergency_contact_name": "Shamsudeen",
    "emergency_contact_relation": "Father",
    "emergency_contact_phone": "+91 93841 80517",
    "dob": "2006-05-14",
    "blood_group": "B+",
    "location": "Chennai, Tamil Nadu, India",
    "emergency_contacts": [
      {
        "name": "Shamsudeen",
        "phone": "+91 93841 80517",
        "relation": "Father"
      }
    ],
    "current_medications": [],
    "vaccinations": [
      {
        "date": "2021-08-15",
        "name": "COVID-19 (Covishield / Covaxin)",
        "status": "Completed"
      },
      {
        "date": "2023-04-10",
        "name": "Tetanus Toxoid (TT)",
        "status": "Up-to-date"
      }
    ],
    "health_history": [
      {
        "date": "2025-11-20",
        "doctor": "Dr. Mohamed",
        "facility": "Govt Medical College Hospital (GMCH)",
        "condition": "None reported",
        "diagnosis": "None reported"
      }
    ],
    "role": "CITIZEN"
  }
];

export const AUTHENTIC_APPOINTMENTS_TODAY: DatabaseAppointmentRecord[] = [
  {
    "id": "ef839ee7-3357-4c46-afd3-2f51106101e3",
    "appointment_id": "APPT-20261009-017",
    "patient_id": "29f349da-1cfd-4665-8e41-fd1968d641c5",
    "patient_health_id": "HG-001017",
    "patient_name": "Divya Ravichandran",
    "patient_phone": "+91 97890 88234",
    "patient_age": 22,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "01:00 PM",
    "appointment_type": "Consultation",
    "status": "Completed",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "General lethargy, dizziness on standing, hemoglobin check",
    "notes": "Chief complaint: General lethargy, dizziness on standing, hemoglobin check. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "e1b295c2-1a5c-47c9-a633-84ee88f11567",
    "appointment_id": "APPT-20261009-018",
    "patient_id": "7b2757f2-d235-4c4e-aa25-71523ad05fc5",
    "patient_health_id": "HG-001018",
    "patient_name": "Karthik Natarajan",
    "patient_phone": "+91 98412 44509",
    "patient_age": 37,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "02:00 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Radiating pain to right shoulder and tingling in fingers",
    "notes": "Chief complaint: Radiating pain to right shoulder and tingling in fingers. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "5df541df-8c32-4f91-885f-dd7b97920f79",
    "appointment_id": "APPT-20261009-019",
    "patient_id": "60dbed7d-4242-40d3-a557-47eb3738fa1a",
    "patient_health_id": "HG-001019",
    "patient_name": "Pooja Hegde",
    "patient_phone": "+91 98204 99120",
    "patient_age": 33,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "02:15 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Follow-up sleep quality assessment, anxiety control review",
    "notes": "Chief complaint: Follow-up sleep quality assessment, anxiety control review. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "20ed5a3c-a78e-48da-936c-2d18d2e1e27b",
    "appointment_id": "APPT-20261009-020",
    "patient_id": "09042794-7460-45c6-81a0-ddbab13239d2",
    "patient_health_id": "HG-001020",
    "patient_name": "Balaji Krishnan",
    "patient_phone": "+91 94450 66712",
    "patient_age": 55,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "02:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Bilateral feet burning sensation and pin-prick paresthesia",
    "notes": "Chief complaint: Bilateral feet burning sensation and pin-prick paresthesia. Allergies: Penicillin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "e8c0b7f2-d0e2-4083-863b-f0baed635043",
    "appointment_id": "APPT-20261009-021",
    "patient_id": "b38ad419-9a6b-4ea5-a273-d6b7c0f0f10c",
    "patient_health_id": "HG-001021",
    "patient_name": "Shanthi Mani",
    "patient_phone": "+91 94431 88902",
    "patient_age": 48,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "02:45 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Widespread musculoskeletal tender points, morning stiffness",
    "notes": "Chief complaint: Widespread musculoskeletal tender points, morning stiffness. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "b93c26f5-b904-4830-acd1-804d6c477ff9",
    "appointment_id": "APPT-20261009-022",
    "patient_id": "3fad8f8a-05e4-4234-b58d-44006bd24744",
    "patient_health_id": "HG-001022",
    "patient_name": "Manoj Tiwari",
    "patient_phone": "+91 98110 55431",
    "patient_age": 41,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "03:00 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Repeat lipid profile (LDL 134 mg/dL), diet review",
    "notes": "Chief complaint: Repeat lipid profile (LDL 134 mg/dL), diet review. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "9374ce33-2435-4c03-9699-dca8d5d1126e",
    "appointment_id": "APPT-20261009-023",
    "patient_id": "836413e6-f704-4e51-b41b-23280870cbd4",
    "patient_health_id": "HG-001023",
    "patient_name": "Swathi Reddy",
    "patient_phone": "+91 99890 11425",
    "patient_age": 26,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "03:15 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Cystic inflammatory acne eruptions on chin and forehead",
    "notes": "Chief complaint: Cystic inflammatory acne eruptions on chin and forehead. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "baf898e6-6dc6-443e-9b34-03356714b42c",
    "appointment_id": "APPT-20261009-024",
    "patient_id": "2763f50c-7070-4189-9eb8-bb8005beeff6",
    "patient_health_id": "HG-001024",
    "patient_name": "Vijay Chawla",
    "patient_phone": "+91 98140 22189",
    "patient_age": 53,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "03:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Elevated SGPT/SGOT on routine executive health check",
    "notes": "Chief complaint: Elevated SGPT/SGOT on routine executive health check. Allergies: Sulfa drugs.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "0bdd5ce0-6efe-4aeb-815f-50af9073183f",
    "appointment_id": "APPT-20261009-025",
    "patient_id": "4e921128-8d49-4f3e-bc30-10918e03a5c5",
    "patient_health_id": "HG-001025",
    "patient_name": "Revathi Sridhar",
    "patient_phone": "+91 94445 77109",
    "patient_age": 60,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "03:45 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "General weakness, bilateral calf muscle cramps",
    "notes": "Chief complaint: General weakness, bilateral calf muscle cramps. Allergies: Cephalosporins.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "4a2089f0-1c6b-414a-a54d-95865e55eb69",
    "appointment_id": "APPT-20261009-026",
    "patient_id": "a4c9d4c6-eb33-4f4e-8d70-ef6ba8cb7a5f",
    "patient_health_id": "HG-001026",
    "patient_name": "Naveen Kumar",
    "patient_phone": "+91 98409 66124",
    "patient_age": 32,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "5fd9bbc3-6b8d-46c1-8d03-1017ad94b61a",
    "doctor_name": "Dr. Preethi",
    "department": "Ophthalmology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "04:00 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Lower back spasm after lifting luggage, posture advice",
    "notes": "Chief complaint: Lower back spasm after lifting luggage, posture advice. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "ca298753-92be-47be-b00c-c6fba2b1010e",
    "appointment_id": "APPT-20261009-027",
    "patient_id": "32c3e489-4a2d-4554-bee2-569b58f97db3",
    "patient_health_id": "HG-001027",
    "patient_name": "Geetha Narayanan",
    "patient_phone": "+91 94435 11980",
    "patient_age": 47,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "552045eb-31db-4ad7-adfb-f3560b0f0f6a",
    "doctor_name": "Dr. Swetha",
    "department": "Anaesthesiology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "04:15 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Pelvic ultrasound review, excessive menstrual fatigue",
    "notes": "Chief complaint: Pelvic ultrasound review, excessive menstrual fatigue. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "aa17c374-c2d7-4776-954f-1b254ec324f4",
    "appointment_id": "APPT-20261009-028",
    "patient_id": "ba293b4f-c706-4c4e-ba40-0437f4ef355c",
    "patient_health_id": "HG-001028",
    "patient_name": "Ashwin Iyer",
    "patient_phone": "+91 98846 33901",
    "patient_age": 27,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "12f00a0f-9e5e-4fd5-9e0c-dd0625bfc4d0",
    "doctor_name": "Dr. Sanjay",
    "department": "Urology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "04:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Post-prandial abdominal cramping and irregular bowel habits",
    "notes": "Chief complaint: Post-prandial abdominal cramping and irregular bowel habits. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "74ff66b8-afce-4fbe-99c8-5df95154e8b3",
    "appointment_id": "APPT-20261009-029",
    "patient_id": "0024a29e-ff51-4c1b-bb33-01181fd28daf",
    "patient_health_id": "HG-001029",
    "patient_name": "Farida Banu",
    "patient_phone": "+91 97908 22176",
    "patient_age": 38,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "db079c36-3b07-4602-8d3d-04842486177a",
    "doctor_name": "Dr. Kanimozhi",
    "department": "Pathology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "04:45 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Dysuria and frequency for 3 days, urine routine review",
    "notes": "Chief complaint: Dysuria and frequency for 3 days, urine routine review. Allergies: Nitrofurantoin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "e77d5ac1-cfbf-46ca-ab6a-a83eaf996817",
    "appointment_id": "APPT-20261009-030",
    "patient_id": "3f6faa66-831d-4c26-967a-3081589a9627",
    "patient_health_id": "HG-001030",
    "patient_name": "Ramesh Sundar",
    "patient_phone": "+91 94442 88419",
    "patient_age": 66,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "913cd0a5-0f0b-469f-ab0c-222e15462485",
    "doctor_name": "Dr. Priya",
    "department": "Critical Care / ICU",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "05:00 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Nocturia 4-5 times per night, urinary hesitancy assessment",
    "notes": "Chief complaint: Nocturia 4-5 times per night, urinary hesitancy assessment. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "110232c6-1c32-4f8e-b9f7-4f610b9b0e7a",
    "appointment_id": "APPT-20261009-031",
    "patient_id": "5c36971f-e821-445f-9482-48337444a5e2",
    "patient_health_id": "HG-001031",
    "patient_name": "Hema Malini S",
    "patient_phone": "+91 94433 99120",
    "patient_age": 54,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "8a8d0ef9-cbf1-418f-a928-cf29072cc57b",
    "doctor_name": "Dr. Arjun",
    "department": "Emergency Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "05:15 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Annual diabetic ophthalmology and nephropathy screening clearance",
    "notes": "Chief complaint: Annual diabetic ophthalmology and nephropathy screening clearance. Allergies: Penicillin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "5d2008ba-31b6-4538-b465-4c700c0864bb",
    "appointment_id": "APPT-20261009-032",
    "patient_id": "2df9442d-4b4b-4eac-a452-f89128630dd7",
    "patient_health_id": "HG-001032",
    "patient_name": "Kishore Kumar",
    "patient_phone": "+91 98402 77190",
    "patient_age": 49,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "2eeae0b4-0aa9-4a42-98d3-d2ebd8de752e",
    "doctor_name": "Dr. Revathi",
    "department": "Cardiology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "05:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Routine quarterly cardiovascular wellness check",
    "notes": "Chief complaint: Routine quarterly cardiovascular wellness check. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "1d8be9b4-f484-4397-96ef-b82da49b012d",
    "appointment_id": "APPT-20261009-033",
    "patient_id": "f3bb7b92-9a1e-4a8a-8364-55a679139742",
    "patient_health_id": "HG-001033",
    "patient_name": "Sunita Rao",
    "patient_phone": "+91 98841 88302",
    "patient_age": 35,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "dd1d98dc-a888-4425-b7dc-48175a2499cf",
    "doctor_name": "Dr. Ananya",
    "department": "Pediatrics",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "05:45 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Occipital band-like tightness radiating to neck",
    "notes": "Chief complaint: Occipital band-like tightness radiating to neck. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "2cfb55bc-1d99-476d-a969-00d42da09240",
    "appointment_id": "APPT-20261009-034",
    "patient_id": "320a3b10-2527-45c7-895c-be5004232473",
    "patient_health_id": "HG-001034",
    "patient_name": "Gopalakrishnan V",
    "patient_phone": "+91 94440 11928",
    "patient_age": 72,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "715b2c3a-0969-4780-9441-c097bf8bb0c0",
    "doctor_name": "Dr. Suresh",
    "department": "Orthopedics",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "06:00 PM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Mild resting tremor in right hand and bradykinesia check",
    "notes": "Chief complaint: Mild resting tremor in right hand and bradykinesia check. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "83b291a0-90df-4920-b6c1-3a1f31d16419",
    "appointment_id": "APPT-20261009-035",
    "patient_id": "30a22faa-c987-46d2-b854-b46287f1d715",
    "patient_health_id": "HG-001035",
    "patient_name": "Anitha Selvaraj",
    "patient_phone": "+91 97911 33490",
    "patient_age": 43,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "a0debe4f-d7e2-493a-8a4d-ee87186fd29a",
    "doctor_name": "Dr. Karthik",
    "department": "Orthopaedics",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "06:15 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Fasting glucose titration, dietary advice",
    "notes": "Chief complaint: Fasting glucose titration, dietary advice. Allergies: Sulfa drugs.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "5dfa7799-8ed2-416f-8e6f-09710ec6ac07",
    "appointment_id": "APPT-20261009-036",
    "patient_id": "24cf3cf3-f475-48bd-a51a-59ac8d4f41c9",
    "patient_health_id": "HG-001036",
    "patient_name": "Nitin Gadkari S",
    "patient_phone": "+91 98230 44512",
    "patient_age": 38,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "54b563fe-2559-4a70-9e53-6dba5af09b98",
    "doctor_name": "Dr. Nivetha",
    "department": "Dermatology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "06:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Abdominal ultrasound review, lifestyle protocol update",
    "notes": "Chief complaint: Abdominal ultrasound review, lifestyle protocol update. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "084b02c9-e0c3-4f30-b6fc-63d88885e744",
    "appointment_id": "APPT-20261009-037",
    "patient_id": "c1f53053-4c3f-4563-9d8d-ef2e6492dd2f",
    "patient_health_id": "HG-001037",
    "patient_name": "Saranya Mohan",
    "patient_phone": "+91 97891 22345",
    "patient_age": 25,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "ed6b864d-2fb6-4892-a72f-fdf2ee80113f",
    "doctor_name": "Dr. Revathi",
    "department": "Cardiology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "06:45 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Dry cough triggered by air conditioning and dust",
    "notes": "Chief complaint: Dry cough triggered by air conditioning and dust. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "68cacf4a-2d1f-4a55-8207-32caa9fd05c0",
    "appointment_id": "APPT-20261009-038",
    "patient_id": "f0d9045e-a5d8-4db1-8134-66509eb4906a",
    "patient_health_id": "HG-001038",
    "patient_name": "Prakash Chandran",
    "patient_phone": "+91 94443 55901",
    "patient_age": 52,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "62267317-2a73-40a3-a9cc-fa4e7aea0745",
    "doctor_name": "Dr. Arjun",
    "department": "Diabetology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "07:00 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Asymptomatic serum uric acid 8.4 mg/dL evaluation",
    "notes": "Chief complaint: Asymptomatic serum uric acid 8.4 mg/dL evaluation. Allergies: Aspirin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "e2f1a988-7997-4394-bb4c-224ee825f08b",
    "appointment_id": "APPT-20261009-039",
    "patient_id": "c523d015-75c0-4a8f-8388-2779d47da54b",
    "patient_health_id": "HG-001039",
    "patient_name": "Kavita Joshi",
    "patient_phone": "+91 98190 77123",
    "patient_age": 30,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "f87cdb1e-bb7b-49ac-b687-0c7895692431",
    "doctor_name": "Dr. Priya",
    "department": "Gynaecology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "07:15 PM",
    "appointment_type": "Consultation",
    "status": "Completed",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Pre-employment comprehensive clinical fitness assessment",
    "notes": "Chief complaint: Pre-employment comprehensive clinical fitness assessment. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "f9756fb0-a9d1-4393-8dbb-18172b4e2132",
    "appointment_id": "APPT-20261009-040",
    "patient_id": "00b97582-b33c-4214-81c0-6b4ab41ff70f",
    "patient_health_id": "HG-001040",
    "patient_name": "Babu Janakiraman",
    "patient_phone": "+91 94441 66890",
    "patient_age": 69,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "e142e655-0fe7-4846-9395-44c6e9b3f49b",
    "doctor_name": "Dr. Karthik",
    "department": "Orthopaedics",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "07:30 PM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Pre-operative cataract surgery medical clearance",
    "notes": "Chief complaint: Pre-operative cataract surgery medical clearance. Allergies: Penicillin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "1b1772a9-0b17-47b2-97eb-0c3fd3decfd3",
    "appointment_id": "APPT-20261009-041",
    "patient_id": "c52b3c19-b83b-4ddf-8246-31a316610f33",
    "patient_health_id": "HG-001041",
    "patient_name": "Nalini Sundar",
    "patient_phone": "+91 94432 11456",
    "patient_age": 56,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "1c62ece2-b8d0-413e-a0db-e15cf45906f2",
    "doctor_name": "Dr. Nivetha",
    "department": "Dermatology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "07:45 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Bilateral ankle stiffness and weight stagnation",
    "notes": "Chief complaint: Bilateral ankle stiffness and weight stagnation. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "a7791bde-2512-46f9-adae-2d477f48ec9c",
    "appointment_id": "APPT-20261009-042",
    "patient_id": "49598dd0-0103-4131-ac05-7350cba885ba",
    "patient_health_id": "HG-001042",
    "patient_name": "Dinesh Karthik M",
    "patient_phone": "+91 98403 88129",
    "patient_age": 29,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "c761d6db-2143-4663-b68b-e7f37e451595",
    "doctor_name": "Dr. Rajeshwari",
    "department": "Radiology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "08:00 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Left hamstring tenderness after recreational football",
    "notes": "Chief complaint: Left hamstring tenderness after recreational football. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "db11ba3c-4b2e-426d-90f1-fd53cfc77669",
    "appointment_id": "APPT-20261009-043",
    "patient_id": "58e5dcda-2400-445e-bb9f-35dddd6277ea",
    "patient_health_id": "HG-001043",
    "patient_name": "Usha Rani K",
    "patient_phone": "+91 94440 88219",
    "patient_age": 63,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "91ea21e0-6b64-4fd2-937e-345828482e43",
    "doctor_name": "Dr. Srinivasan",
    "department": "ENT",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "08:15 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Follow-up on renal function tests and urine microalbumin",
    "notes": "Chief complaint: Follow-up on renal function tests and urine microalbumin. Allergies: Sulfa drugs.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "f90257be-831f-4fbc-8f62-a47e35b2aeaf",
    "appointment_id": "APPT-20261009-044",
    "patient_id": "20d9ce54-b6aa-41ed-923b-bbccda1c7305",
    "patient_health_id": "HG-001044",
    "patient_name": "Sridhar Venkat",
    "patient_phone": "+91 98844 77210",
    "patient_age": 45,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "5452fb11-b004-42ac-8815-d59c9bb0569c",
    "doctor_name": "Dr. Ananya",
    "department": "Neurology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "08:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Occasional mild dizziness and blood pressure monitoring",
    "notes": "Chief complaint: Occasional mild dizziness and blood pressure monitoring. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "9565a971-02f2-4891-b67a-11198104f1da",
    "appointment_id": "APPT-20261009-045",
    "patient_id": "43216c67-44b4-403f-9299-88a25993d22e",
    "patient_health_id": "HG-001045",
    "patient_name": "Karpagam Shanmugam",
    "patient_phone": "+91 94446 11290",
    "patient_age": 59,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "6136761d-89f8-4c5a-bc84-16c3020f2598",
    "doctor_name": "Dr. Suresh",
    "department": "General Surgery",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "08:45 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Lipid control review, dietary adherence check",
    "notes": "Chief complaint: Lipid control review, dietary adherence check. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "deb65e5d-7b65-41bb-b9c0-41e0b236f3c4",
    "appointment_id": "APPT-20261009-001",
    "patient_id": "a9bd2039-a968-4986-b5d6-d5c9ffda10d5",
    "patient_health_id": "HG-001001",
    "patient_name": "Priya Sharma",
    "patient_phone": "+91 94451 98210",
    "patient_age": 28,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:00 AM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Fever and body ache for 2 days",
    "notes": "Chief complaint: Fever and body ache for 2 days. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "51cb885c-95cb-4bf6-b7c2-635be159dd17",
    "appointment_id": "APPT-20261009-046",
    "patient_id": "86ea212c-f53b-45ec-806d-ecc9212e0646",
    "patient_health_id": "HG-001046",
    "patient_name": "Girish Chandra",
    "patient_phone": "+91 98114 66201",
    "patient_age": 39,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "aeb899c9-46f9-4972-bdcd-186439d0a22f",
    "doctor_name": "Dr. Dinesh",
    "department": "Nephrology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:00 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Water brash and epigastric heaviness after late meals",
    "notes": "Chief complaint: Water brash and epigastric heaviness after late meals. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "898de2ee-f521-461f-8433-e63aebadd2f8",
    "appointment_id": "APPT-20261009-002",
    "patient_id": "4456af1e-49a0-459d-8b33-429dc8328822",
    "patient_health_id": "HG-001002",
    "patient_name": "Rajesh Kumar",
    "patient_phone": "+91 98401 22891",
    "patient_age": 58,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:15 AM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "High BP (160/95) on home monitoring, persistent headache",
    "notes": "Chief complaint: High BP (160/95) on home monitoring, persistent headache. Allergies: Penicillin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "f0b7b5c9-acf8-4250-a2ae-d12130c16532",
    "appointment_id": "APPT-20261009-047",
    "patient_id": "db83a4aa-b2f7-41c2-a594-df3eacb34cc9",
    "patient_health_id": "HG-001047",
    "patient_name": "Bhuvaneshwari R",
    "patient_phone": "+91 97910 88921",
    "patient_age": 36,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "5be4c2ed-c253-418b-be11-8504626f4fe4",
    "doctor_name": "Dr. Shalini",
    "department": "Psychiatry",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:15 PM",
    "appointment_type": "Consultation",
    "status": "Completed",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Follow-up complete blood count, fatigue improvement",
    "notes": "Chief complaint: Follow-up complete blood count, fatigue improvement. Allergies: Penicillin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "7853f367-afdc-40ce-bd6b-7d8cf687fc72",
    "appointment_id": "APPT-20261009-003",
    "patient_id": "5a69ca86-4030-4379-93f0-f70a985cf96d",
    "patient_health_id": "HG-001003",
    "patient_name": "Ananya Venkataraman",
    "patient_phone": "+91 98842 11090",
    "patient_age": 34,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:30 AM",
    "appointment_type": "Consultation",
    "status": "In Consultation",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Follow-up thyroid profile review, mild weight gain",
    "notes": "Chief complaint: Follow-up thyroid profile review, mild weight gain. Allergies: Sulfa drugs.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "9f9c8c54-3144-499a-95c0-3bc2ed7dd37c",
    "appointment_id": "APPT-20261009-048",
    "patient_id": "bc5e2846-4a20-4110-bc66-34180d43b510",
    "patient_health_id": "HG-001048",
    "patient_name": "Senthil Nathan P",
    "patient_phone": "+91 94441 55098",
    "patient_age": 48,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "275a645a-6954-4262-9945-c263a6f5f01f",
    "doctor_name": "Dr. Vignesh",
    "department": "Pulmonology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:30 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Blood pressure check, lifestyle counseling",
    "notes": "Chief complaint: Blood pressure check, lifestyle counseling. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "0c0630d4-6860-4770-a613-6cc4673c7259",
    "appointment_id": "APPT-20261009-004",
    "patient_id": "e2aae464-f646-4207-bded-7b1240da248d",
    "patient_health_id": "HG-001004",
    "patient_name": "Mohammed Farhan",
    "patient_phone": "+91 97910 44521",
    "patient_age": 42,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:45 AM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Nocturnal wheezing and shortness of breath with seasonal change",
    "notes": "Chief complaint: Nocturnal wheezing and shortness of breath with seasonal change. Allergies: Aspirin / NSAIDs.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "8c6946c9-bb01-4c15-a8cb-366855d8fe9e",
    "appointment_id": "APPT-20261009-049",
    "patient_id": "ce2f9d8a-2d4c-4914-aec0-116a0ef93c98",
    "patient_health_id": "HG-001049",
    "patient_name": "Deepa Muthukrishnan",
    "patient_phone": "+91 98840 99451",
    "patient_age": 31,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "e95b1551-2c03-4318-b427-aa6572c08e77",
    "doctor_name": "Dr. Harish",
    "department": "Oncology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "09:45 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Facial pressure and frontal sinus headaches during winter",
    "notes": "Chief complaint: Facial pressure and frontal sinus headaches during winter. Allergies: Dust.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "376c84b1-3a20-45aa-8e78-ac28f223e38c",
    "appointment_id": "APPT-20261009-050",
    "patient_id": "5202fa41-4c2e-4efb-819d-3e271ab88232",
    "patient_health_id": "HG-001050",
    "patient_name": "Mohamed Sameen S",
    "patient_phone": "+91 93841 80516",
    "patient_age": 20,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "eb370c5f-07f7-4cc5-93f5-b37194f54801",
    "doctor_name": "Dr. Ramesh",
    "department": "Gastroenterology",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "10:00 AM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Annual routine health wellness checkup and biometric verification",
    "notes": "Chief complaint: Annual routine health wellness checkup and biometric verification. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "53e6e30d-c89e-43b1-be26-cb7408e95e6e",
    "appointment_id": "APPT-20261009-005",
    "patient_id": "3eb32d40-732b-489e-a714-6bc48feb7837",
    "patient_health_id": "HG-001005",
    "patient_name": "Kavitha Subramanian",
    "patient_phone": "+91 94443 88120",
    "patient_age": 51,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "10:00 AM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Bilateral knee joint pain worsening on climbing stairs",
    "notes": "Chief complaint: Bilateral knee joint pain worsening on climbing stairs. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "a4ec60dd-802e-4ea0-ac76-8cfed49d92be",
    "appointment_id": "APPT-20261009-006",
    "patient_id": "fb543464-349b-4b02-8ff2-55121c0f6f80",
    "patient_health_id": "HG-001006",
    "patient_name": "Gurpreet Singh",
    "patient_phone": "+91 98112 33456",
    "patient_age": 46,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "10:15 AM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "HbA1c surveillance (result: 7.8%), dietary counselling needed",
    "notes": "Chief complaint: HbA1c surveillance (result: 7.8%), dietary counselling needed. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "fc90ecca-9adb-4837-b2bc-dab943c517b3",
    "appointment_id": "APPT-20261009-007",
    "patient_id": "d6a12729-5963-4a43-9595-18b2c83b9edd",
    "patient_health_id": "HG-001007",
    "patient_name": "Lakshmi Narayanan",
    "patient_phone": "+91 94432 77890",
    "patient_age": 67,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "10:30 AM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Routine post-stent cardiac evaluation, chest discomfort on exertion",
    "notes": "Chief complaint: Routine post-stent cardiac evaluation, chest discomfort on exertion. Allergies: Contrast dye.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "363ec69c-4b8a-4b83-874c-5f89c7d7d58a",
    "appointment_id": "APPT-20261009-008",
    "patient_id": "d75d3db0-d5b2-473e-8e5a-a46c3e8c4ac1",
    "patient_health_id": "HG-001008",
    "patient_name": "Sneha Mukherjee",
    "patient_phone": "+91 98301 55678",
    "patient_age": 24,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "10:45 AM",
    "appointment_type": "Consultation",
    "status": "Completed",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Recurrent unilateral throbbing headache with photophobia",
    "notes": "Chief complaint: Recurrent unilateral throbbing headache with photophobia. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "b1c29380-3a4a-42ad-b4e0-421976003bd6",
    "appointment_id": "APPT-20261009-009",
    "patient_id": "a63f7521-4d1f-4852-aeb2-41381fbabf97",
    "patient_health_id": "HG-001009",
    "patient_name": "Rahul Deshmukh",
    "patient_phone": "+91 98220 99812",
    "patient_age": 39,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "11:00 AM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Severe retrosternal burning and nocturnal acid regurgitation",
    "notes": "Chief complaint: Severe retrosternal burning and nocturnal acid regurgitation. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "e62465eb-146c-493a-bce7-1d32f84f1c25",
    "appointment_id": "APPT-20261009-010",
    "patient_id": "2c6b11b5-b005-4e9b-9932-8fae83a1f749",
    "patient_health_id": "HG-001010",
    "patient_name": "Meena Ramanathan",
    "patient_phone": "+91 94440 22319",
    "patient_age": 62,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "11:15 AM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Fasting blood glucose fluctuating (180-210 mg/dL), fatigue",
    "notes": "Chief complaint: Fasting blood glucose fluctuating (180-210 mg/dL), fatigue. Allergies: Ciprofloxacin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "a5c20012-ebf6-46bc-a0ec-7c9e38037606",
    "appointment_id": "APPT-20261009-011",
    "patient_id": "35c96e32-e797-48bb-a355-e50efeb61de8",
    "patient_health_id": "HG-001011",
    "patient_name": "Arun Prakash",
    "patient_phone": "+91 98840 55123",
    "patient_age": 31,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "11:30 AM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Persistent morning sneezing fits and nasal obstruction",
    "notes": "Chief complaint: Persistent morning sneezing fits and nasal obstruction. Allergies: Dust Mite, Pollen.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "97ef5f9b-4277-48e4-a819-d4f393a63f9d",
    "appointment_id": "APPT-20261009-012",
    "patient_id": "32700825-9670-4a93-b365-7dc33fd98928",
    "patient_health_id": "HG-001012",
    "patient_name": "Fathima Begum",
    "patient_phone": "+91 98765 43215",
    "patient_age": 50,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "11:45 AM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Periodic ankle edema and fatigue evaluation",
    "notes": "Chief complaint: Periodic ankle edema and fatigue evaluation. Allergies: Sulfa drugs.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "4f65c8ab-60e1-4cbf-bd6b-3b186924f3bd",
    "appointment_id": "APPT-20261009-013",
    "patient_id": "61e919d6-5862-4066-8396-0a077eeacc0e",
    "patient_health_id": "HG-001013",
    "patient_name": "Vignesh Sundaram",
    "patient_phone": "+91 98765 43216",
    "patient_age": 36,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "12:00 PM",
    "appointment_type": "Consultation",
    "status": "Scheduled",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Dry erythematous scaling plaques on bilateral extensor elbows",
    "notes": "Chief complaint: Dry erythematous scaling plaques on bilateral extensor elbows. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "7f6f4332-838b-4d9f-b9d4-85705cfff09e",
    "appointment_id": "APPT-20261009-014",
    "patient_id": "7bb48cda-eaf9-4618-9ce2-56e0f838512f",
    "patient_health_id": "HG-001014",
    "patient_name": "Deepak Verma",
    "patient_phone": "+91 98105 66723",
    "patient_age": 44,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "12:15 PM",
    "appointment_type": "Consultation",
    "status": "Checked In",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Acute tenderness in right first metatarsophalangeal joint",
    "notes": "Chief complaint: Acute tenderness in right first metatarsophalangeal joint. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "2e601de2-dc08-4a78-9c07-d88343a86168",
    "appointment_id": "APPT-20261009-015",
    "patient_id": "4997b306-86d2-4088-a329-c83ec99587c8",
    "patient_health_id": "HG-001015",
    "patient_name": "Ritu Sen",
    "patient_phone": "+91 98310 77412",
    "patient_age": 29,
    "patient_gender": "Female",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "12:30 PM",
    "appointment_type": "Consultation",
    "status": "Waiting",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Endocrine panel review, weight management consultation",
    "notes": "Chief complaint: Endocrine panel review, weight management consultation. Allergies: None reported.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  },
  {
    "id": "51c81d8a-8a7e-47b2-9baa-172a2930b210",
    "appointment_id": "APPT-20261009-016",
    "patient_id": "c8c468b5-a3a9-45f2-8cd9-0eee603329a1",
    "patient_health_id": "HG-001016",
    "patient_name": "Suresh Babu",
    "patient_phone": "+91 94441 33201",
    "patient_age": 64,
    "patient_gender": "Male",
    "patient_avatar": null,
    "doctor_id": "fb4867dc-b213-46b7-85a9-c0a7cd03988c",
    "doctor_name": "Dr. Mohamed",
    "department": "General Medicine",
    "appointment_date": "2026-10-08T18:30:00.000Z",
    "appointment_time": "12:45 PM",
    "appointment_type": "Consultation",
    "status": "In Consultation",
    "checked_in_at": null,
    "source": "Hospital Reception / Self Kiosk",
    "reason_for_visit": "Increased cough with productive mucoid sputum on exertion",
    "notes": "Chief complaint: Increased cough with productive mucoid sputum on exertion. Allergies: Penicillin.",
    "clinical_observations": null,
    "cancellation_reason": null,
    "rescheduled_from": null,
    "created_at": "2026-10-09T04:30:00.512Z",
    "updated_at": "2026-10-09T04:30:00.512Z",
    "consultation_fee": "500",
    "payment_status": "Paid"
  }
];
