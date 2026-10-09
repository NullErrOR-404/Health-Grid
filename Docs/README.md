# 📚 HealthGrid Engineering Documentation Hub

Welcome to the comprehensive technical and operational documentation repository for **HealthGrid (நலம் AI)**. This documentation suite serves as the source of truth for software engineers, clinical architects, database administrators, and AI researchers working on the platform.

---

## 🗂️ Documentation Navigation Directory

```text
Docs/
├── README.md                            # Documentation Hub & Navigation Master (This File)
│
├── PRD/                                 # Product Requirements Document
│   ├── 01_Executive_Summary_and_Scope.md   # Problem statement, mission, personas & boundaries
│   ├── 02_Functional_Requirements.md       # Citizen portal, AI triage, PMBJP generic store & Hospital ERP
│   └── 03_Non_Functional_Requirements.md   # Performance SLAs, security, reliability & regulatory compliance
│
├── TRD/                                 # Technical Requirements Document
│   ├── 01_System_Architecture_and_Stack.md # Multi-tier architecture, tech stack & cloud topology
│   ├── 02_Backend_and_Services_TRD.md      # Java 21 Spring Boot, Project Loom, WebSockets & CDSCO guard
│   ├── 03_Mobile_Architecture_and_Security.md # React Native Expo 57, New Architecture & OWASP Mobile Top 10
│   └── 04_AI_Intelligence_and_Model_Cascade.md # Complexity arbiter, Groq/Gemini/HF models & SOCRATES gating
│
├── UI_UX_Design/                        # User Interface & Experience Specifications
│   ├── 01_Design_System_and_Tokens.md      # Color tokens, typography, glassmorphism & kinetic animations
│   ├── 02_Screen_Layouts_and_Responsive_Specs.md # Desktop 3-column workspaces vs mobile slide-up sheets
│   └── 03_Accessibility_and_Interaction_Guidelines.md # WCAG 2.1 AA, touch targets, screen privacy & ARIA
│
├── Backend_Schema/                      # Database & API Specifications
│   ├── 01_Database_Schema_and_ERD.md       # PostgreSQL schemas, tables, constraints & ER diagrams
│   ├── 02_Security_RLS_and_Access_Policies.md # 100% Row-Level Security policies & role-based access
│   └── 03_API_Contracts_and_DTOs.md        # REST endpoints, STOMP channels & JSON payload schemas
│
├── User_Flow/                           # User Journeys & Workflow Diagrams
│   ├── 01_Citizen_and_Patient_Journeys.md  # Symptom triage, Live Clinic, prescription OCR & family hub
│   └── 02_Emergency_and_Hospital_Operations_Journeys.md # 108 SOS dispatch, OPD queue, IPD bed allocation & ERP
│
└── Implementation_Plan/                 # Engineering Milestones & Operations
    ├── 01_Phase_Milestones_and_Roadmap.md  # Phased development history & feature progression
    └── 02_Testing_Verification_and_Deployment.md # Quality gates, build scripts, edge deploys & APK release
```

---

## 🏛️ Quick Architectural Summary

* **Frontend Presentation Layer**: React 19.x + Vite 8.3 + Tailwind CSS v4 running on global Vercel edge networks with in-memory volatile session management.
* **Native Mobile Presentation Layer**: React Native 0.86.3 + Expo SDK 57 (New Architecture enabled with Fabric & TurboModules) with the complete OWASP Mobile Top 10 security suite.
* **Enterprise Core Backend**: Java 21 LTS + Spring Boot 3.3.4 leveraging Project Loom Virtual Threads (`spring.threads.virtual.enabled=true`), STOMP WebSockets, and tiered token-bucket rate limiting.
* **Data Persistence**: PostgreSQL 15 on Supabase with 100% Row-Level Security (RLS) enforcement across all 7 core tables, WAL Change Data Capture (<35ms latency), and `pgvector` semantic hybrid search.
* **Autonomous AI Engine**: Dynamic complexity arbitration routing across Groq LPU (GPT-OSS 120B / 20B, Qwen 27B Tanglish), Google Gemini Flash Multimodal Vision, and a custom fine-tuned 8-Billion parameter Llama-3.1 clinical model served via Hugging Face Serverless Inference.
* **Regulatory Governance**: Built for strict compliance with India's **DPDP Act 2023**, the **Ayushman Bharat Digital Mission (ABDM)** CoWIN standards, and **CDSCO Schedule H / Schedule X** drug safety rules.
