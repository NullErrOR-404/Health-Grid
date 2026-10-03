---
title: "ADR-011: Family & Beneficiary Multi-Profile Architecture (ABDM Caregiver Standard)"
status: accepted
date: 2026-10-03
tags:
  - adr
  - architecture
  - family-members
  - caregiver-mode
  - abdm
  - cowin
  - tele-clinic
  - his
parent: "[[00_Index]]"
---

# 📜 ADR-011: Family & Beneficiary Multi-Profile Architecture (ABDM Caregiver Standard)

Back to [[00_Index]]

## Context
Citizens frequently need to seek medical guidance and register hospital consultations for family members—such as elderly parents (e.g. Mother, Father, Grandparents) or young children—who do not own a smartphone, personal email, or individual HealthGrid account.

Prior to this architecture, consultation clinical context was rigidly locked to the single logged-in account holder's demographics. If an adult child consulted the AI doctor on behalf of their 58-year-old mother experiencing hypertension or joint pain, the AI would address the son/daughter directly as the patient, risking contaminated personal health records and miscalibrated clinical triage.

Key challenges identified:
1. **Digital Exclusion of Elderly & Dependent Patients**: Millions of vulnerable patients rely entirely on digital proxies (caregivers).
2. **Clinical Safety & Record Bleeding**: A mother's chronic condition (e.g., osteoarthritis, hypertension) must never pollute the primary user's personal health passport.
3. **Bedside Manner & Perspective Disconnect**: When a user queries *"My mother has had a fever for 2 days"*, generic AI responses often switch inconsistently between second-person ("take this medication") and third-person advice.
4. **Hospital OPD Token Disconnect**: Hospital admission and triage queues require the actual patient's identity, age, and biological sex for accurate clinical assignment.

---

## Decision

We designed and implemented the **Family & Beneficiary Multi-Profile Architecture** aligned with the National Health Authority (NHA) **Ayushman Bharat Digital Mission (ABDM)** and **CoWIN** multi-beneficiary specifications.

### 1. Unified Multi-Profile Service (`familyMemberService.ts`)
- Implemented a dedicated service managing family profiles with the following data contract:
  ```typescript
  export interface FamilyMember {
    id: string;
    healthId: string; // Auto-generated ABDM standard: HG-FAM-XXXX
    name: string;
    relationship: 'Mother' | 'Father' | 'Spouse' | 'Child' | 'Son' | 'Daughter' | 'Brother' | 'Sister' | 'Sibling' | 'Grandparent' | 'Relative' | 'Friend' | 'Other';
    age: number;
    gender: 'Female' | 'Male' | 'Other';
    bloodGroup?: string;
    chronicConditions?: string[];
    allergies?: string[];
    isSelf?: boolean;
    createdAt?: string;
  }
  ```
- **Dual Persistence Strategy**: Immediate optimistic local storage (`healthgrid_family_members_${userId}`) paired with PostgreSQL Supabase cloud synchronization (`family_members` table) with Row-Level Security (RLS).
- **Reactive State Subscription**: Observer pattern allowing all pages, headers, and modal dialogs to dynamically respond when the active patient is switched.

### 2. Streamlined 2-Field Quick Intake Flow (`ConsultationBeneficiaryModal.tsx`)
- Zero friction intake: Caregivers only enter **Patient Name** and **Age / Biological Sex**, selecting a relationship chip (`Mother`, `Father`, `Child`, etc.).
- **Natural Doctor History Elicitation**: No mandatory checkboxes for past conditions or allergies during intake. The AI doctor naturally inquiries about the patient's medical history during the conversational consultation.
- Instant 1-tap switching between "Myself" (Primary Account Holder) and any linked family member.

### 3. Third-Person Caregiver AI Prompting (`ChatbotPage.tsx`)
- When a family beneficiary is selected as active, `handleSendMessage` injects a rigorous caregiver directive:
  ```
  CAREGIVER CONSULTATION MODE: The user is consulting on behalf of their [Relationship], [Name].
  Patient: [Name], Age: [Age]y, Gender: [Gender], Health ID: [HG-FAM-XXXX]
  BEDSIDE MANNER DIRECTIVE: You MUST address the user in the third person regarding the patient as a caring family member/caregiver (e.g. "I understand you are consulting for your mother, Lakshmi. What symptoms is she experiencing?"). Calibrate triage questions, red flags, and safe dosages for a [Age]-year-old [Gender]. Inquire gently about any chronic conditions or daily medications [Name] takes.
  ```
- Result: Eliminates robotic confusion, gives warm, empathetic caregiver bedside guidance, and ensures pediatric and geriatric dosage safety.

### 4. Dynamic UI Integration Across Key Surfaces
- **Chatbot Header**: Embedded a pill switcher (`[ 👤 Mom: Lakshmi (58F) ▼ ]` / `[ 👤 Myself ▼ ]`) enabling instant patient switching at any point in a consultation session.
- **Caregiver Banner**: Displayed an amber status card above the chat messages showing the active patient's relationship, age, biological sex, and permanent Health ID with a 1-tap `[ Switch Patient ]` trigger.
- **Hospital OPD Queue Intake (`PatientIntakeModal.tsx`)**: Quick-select segmented chips (`[ Myself | Mom | + Add Family ]`) auto-populate hospital OPD consultation tokens with the selected beneficiary's identity and Health ID (`HG-FAM-XXXX`).
- **Profile Hub (`ProfilePage.tsx` & `Navbar.tsx`)**: Dedicated "Family & Beneficiary Profiles" card showcasing all linked family members with quick "Consult AI" and "Add Family Member" actions.

---

## Consequences & Verification

### Positive
- **Zero Record Contamination**: Family consultations are partitioned and tagged under distinct `HG-FAM-XXXX` identifiers.
- **Inclusive Healthcare**: Empowers rural and semi-urban families where an entire household shares one smartphone.
- **Geriatric & Pediatric Accuracy**: Triage and dosage rules are calibrated according to the patient's biological age and sex rather than the caregiver's profile.
- **Full Compliance**: Aligns with India's Ayushman Bharat Digital Mission guidelines for dependent beneficiary registration.

---

## References
- [[00_Index]]
- [[DocBot_TeleClinic]]
- [[Hospital_Information_System_HIS]]
- [[Data_Sovereignty_and_Security]]
