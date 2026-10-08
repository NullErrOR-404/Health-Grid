# 🗺️ User Flow Specifications
## Module 01: Citizen & Patient Clinical Journeys

---

## 1. Journey 1: Citizen Symptom Triage to Consultation

```
[ Citizen Opens DocBot Chat ]
              │
              ▼
[ Types Chief Complaint ("Severe burning stomach pain for 4 days") ]
              │
              ▼
[ DocBot AI Executes SOCRATES History Taking ]
  • Empathetically acknowledges discomfort
  • Asks 1-2 focused questions: Timing, radiation, relation to meals
              │
              ▼
[ Citizen Answers Clarifications ]
              │
              ├──────────────────────────────────────────────┐
              ▼ (Certainty >= 75% or Turn >= 3)              ▼ (Red Flag: Vomiting Blood)
[ Differential Conclusion Presented ]               [ EMERGENCY SOS TRIGGERED ]
  • Explains Gastroesophageal Reflux (GERD)         • Immediate 108 Dispatch Button
  • Jan Aushadhi Pantoprazole 40mg (85% savings)    • Pre-hospital Trauma Bay Alert
  • Embedded Hospital OPD Appointment Card          • Direct dial to emergency line
              │
              ▼
[ Citizen Taps "Book In-Person OPD Consultation" ]
  • Digital Token HG-OPD-1042 issued
  • Added to Hospital Department Queue
```

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Citizen Patient
    participant DocBot as DocBot AI Consultant
    participant Tools as Agentic Tools Service
    participant Supa as Supabase Cloud Database

    Patient->>DocBot: "Severe burning stomach pain for 4 days"
    DocBot->>DocBot: Check SOCRATES Gating (Turn 1: EXPLORING)
    DocBot-->>Patient: "I hear how uncomfortable this must be. Does this burning feel worse when lying down or after spicy meals?"
    Patient->>DocBot: "Yes, worse at night after dinner. No vomiting."
    DocBot->>Tools: searchJanAushadhi("Pantoprazole")
    Tools-->>DocBot: Generic Pantoprazole: Rs 18.00 vs Rs 165.00 branded (89% savings)
    DocBot-->>Patient: Delivers GERD differential + Jan Aushadhi generic recommendation + In-Chat Appointment Card
    Patient->>DocBot: Clicks [Book Cardiology/General Medicine OPD]
    DocBot->>Supa: Insert into public.appointments
    Supa-->>DocBot: Token Generated: HG-OPD-1042
    DocBot-->>Patient: Confirmed OPD Appointment Pass with QR Code
```

---

## 2. Journey 2: AI Live Clinic Virtual Consultation

```
[ Citizen Launches AI Live Clinic ]
              │
              ▼
[ Grants Camera & Microphone Permissions ]
              │
              ▼
[ Full-Bleed Viewfinder Activates (No static doctor imagery) ]
  • Front/Back CameraX feed fills viewport
  • Top HUD confirms verified appointment & round-trip ping latency
              │
              ▼
[ Patient Speaks & Shows Physical Symptom (e.g. Skin Rash / Throat) ]
  • Floating kinetic equalizer waves animate when DocBot speaks
  • AI Assistant dynamically populates observation checklist:
    [x] Erythematous annular border
    [ ] Scaling central clearing
              │
              ▼
[ Interactive Patient Confirmation ]
  • Patient taps checkboxes to confirm physical sensations
  • Bi-directional reasoning updates clinical dossier
              │
              ▼
[ Session Completed ]
  • Encrypted transcript saved in device storage (localStorage / Keystore)
  • 1-Tap Copy Transcript & Download Clinical Summary
```

---

## 3. Journey 3: Prescription Upload to Generic Medicine Savings

```mermaid
flowchart TD
    Upload[Upload Handwritten Prescription Photo] --> Sanitize[FileSanitizerService: Strip EXIF & Verify MIME]
    Sanitize --> Vision[Google Gemini Flash Multimodal OCR]
    Vision --> Extract[Extract Branded Medicines: Glycomet GP1, Telma 40, Pan 40]
    Extract --> Formulary[Jan Aushadhi PMBJP Grounding Engine]
    Formulary --> Match[Match Bioequivalent Generics & Calculate MRP Savings]
    Match --> Slip[Generate Jan Aushadhi Savings Slip: 86% Net Savings]
    Slip --> Actions{Patient Actions}
    Actions -->|WhatsApp Export| WA[Send Dosage Schedule to WhatsApp]
    Actions -->|Calendar Alarm| Cal[Export .ics Calendar Alarms]
    Actions -->|Locate Kendra| Map[Find Nearest Jan Aushadhi Pharmacy on GIS Map]
```

---

## 4. Journey 4: Family Member Caregiver Management (ABDM Standards)

* **Step 1 (Add Dependent)**: Primary user opens Family Hub and selects relationship (Elderly Parent, Child, Spouse).
* **Step 2 (Assign Health ID)**: System generates independent sovereign Health ID (`HG-FAM-XXXX`) with age-calibrated pediatric or geriatric dosing profiles.
* **Step 3 (One-Tap Switching)**: User toggles active beneficiary profile from the consultation header with zero account logging out.
* **Step 4 (Data Sovereignty Porting)**: When a child turns 18, the caregiver initiates a sovereign account porting protocol under the DPDP Act 2023, migrating all records to an independent phone number while preserving clinical audit trails.
