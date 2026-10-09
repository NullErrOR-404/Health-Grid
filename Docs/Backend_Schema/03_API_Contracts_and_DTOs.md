# 🗄️ Backend Schema & Database Specifications

## Module 03: REST API Contracts, WebSocket Channels & DTOs

---

## 1. Core REST API Endpoints

### 1.1 Authentication & Identity (`/api/auth`)

* `POST /api/auth/login`
  * **Request**: `{ "phone": "+919876543210", "otp": "482910" }`
  * **Response (200 OK)**:

    ```json
    {
      "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
      "role": "CITIZEN",
      "healthId": "HG-PAT-9021",
      "expiresIn": 86400
    }
    ```

* `POST /api/auth/refresh`
  * **Request**: Bearer token in `Authorization` header.
  * **Response (200 OK)**: Refreshed JWT token.

### 1.2 Clinical Triage & Acuity (`/api/triage`)

* `POST /api/triage/evaluate`
  * **Request**:

    ```json
    {
      "patientAge": 45,
      "symptoms": ["retrosternal squeezing chest pain", "diaphoresis", "jaw radiation"],
      "vitals": {
        "systolicBp": 160,
        "diastolicBp": 100,
        "heartRate": 110,
        "spo2": 96
      },
      "comorbidities": ["Type 2 Diabetes", "Hypertension"]
    }
    ```

  * **Response (200 OK)**:

    ```json
    {
      "esiLevel": 1,
      "urgency": "IMMEDIATE_LIFE_THREAT",
      "suggestedAction": "DISPATCH_108_AMBULANCE",
      "targetDepartment": "Emergency Casualty & Cardiology",
      "acuityScore": 95,
      "contraindications": ["Avoid NSAIDs", "Aspirin 325mg chewable indicated if no GI bleed"]
    }
    ```

### 1.3 Jan Aushadhi Generic Medicine Engine (`/api/prescription`)

* `GET /api/prescription/generic-match?query=Pantocid%2040`
  * **Response (200 OK)**:

    ```json
    {
      "searchedBrand": "Pantocid 40",
      "genericName": "Pantoprazole Gastro-Resistant Tablets IP 40mg",
      "genericPrice": 18.00,
      "brandedMrp": 165.00,
      "savingsAmount": 147.00,
      "savingsPercentage": 89,
      "dosageForm": "Tablet",
      "stripSize": "10 Tablets",
      "inStockAtNearestKendra": true
    }
    ```

### 1.4 Hospital Inpatient (IPD) Bed Management (`/api/ipd`)

* `GET /api/ipd/beds`
  * **Query Params**: `?wardType=ICU&isOccupied=false`
  * **Response (200 OK)**:

    ```json
    [
      {
        "id": "bed-icu-04",
        "bedNumber": "ICU-BED-04",
        "wardType": "ICU",
        "isOccupied": false,
        "equipment": "Hamilton C6 Ventilator, Philips IntelliVue Monitor",
        "lastSanitized": "2026-10-08T18:30:00Z"
      }
    ]
    ```

* `PATCH /api/ipd/beds/{id}/allocate`
  * **Request**: `{ "patientId": "e2f1a...", "attendingPhysician": "Dr. V. Raman" }`
  * **Response (200 OK)**: Updated bed entity with `isOccupied: true`.

---

## 2. Real-Time WebSocket STOMP Channels (`/ws-emergency`)

```text
+=================================================================================================+
|                            WEBSOCKET STOMP PUBLISH / SUBSCRIBE MATRIX                           |
+=================================================================================================+
|                                                                                                 |
|   CHANNEL DESTINATION           TYPE         PRODUCER               CONSUMER                    |
|   /topic/ambulance-location     Broadcast    Ambulance Paramedic    Hospital Trauma Desk        |
|   /topic/casualty-alerts        Broadcast    DocBot / Triage Desk   Attending Casualty Doctor   |
|   /topic/ipd-bed-updates        Broadcast    PostgreSQL CDC Hook    Public Bed Radar / ERP      |
|   /app/ambulance/telemetry      Send         Mobile Paramedic GPS   Spring WebSocket Broker     |
|                                                                                                 |
+=================================================================================================+
```

### 2.1 GPS Telemetry Broadcast Payload (`/topic/ambulance-location`)

```json
{
  "dispatchId": "108-DISP-8921",
  "ambulanceId": "TN-01-G-1084",
  "currentLatitude": 13.0827,
  "currentLongitude": 80.2707,
  "headingDegrees": 180.5,
  "speedKmph": 54.2,
  "etaMinutes": 7,
  "assignedHospital": "Rajiv Gandhi Government General Hospital",
  "patientCondition": "Critical STEMI Suspect",
  "spo2": 95,
  "heartRate": 108
}
```

### 2.2 SBAR Paramedic Handover Brief Payload

```json
{
  "situation": "45-year-old male with acute retrosternal chest pain and diaphoresis.",
  "background": "Known diabetic for 8 years on Metformin. No prior stent history.",
  "assessment": "Suspected Acute Coronary Syndrome (STEMI). ST elevations in lead II, III, aVF.",
  "recommendation": "Prepare Cath Lab or Trauma Bay with STAT 12-lead ECG and Aspirin/Ticagrelor."
}
```
