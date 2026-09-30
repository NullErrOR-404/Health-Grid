package com.healthgrid.triage;

import com.healthgrid.triage.dto.TriageRequest;
import com.healthgrid.triage.dto.TriageResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TriageService {

    public TriageResponse evaluate(TriageRequest request) {
        long startTime = System.currentTimeMillis();
        String text = request.getSymptomsText() != null ? request.getSymptomsText().toLowerCase() : "";
        List<String> detected = new ArrayList<>();

        boolean isRedFlag = false;

        // Emergency Red-Flag detection (Cardiac, Respiratory, Stroke, Severe Bleeding)
        if (text.contains("chest pain") || text.contains("heart") || text.contains("நெஞ்சு") ||
            text.contains("இதய") || text.contains("breath") || text.contains("மூச்சு") ||
            text.contains("unconscious") || text.contains("மயக்கம்") || text.contains("stroke") ||
            text.contains("ரத்தம்") || text.contains("bleeding")) {
            isRedFlag = true;
            detected.add("Emergency Triage Red-Flag");
        }

        if (text.contains("fever") || text.contains("காய்ச்சல்") || text.contains("kaichal") || text.contains("suram")) {
            detected.add("காய்ச்சல் (Fever)");
        }
        if (text.contains("cold") || text.contains("சளி") || text.contains("sali")) {
            detected.add("சளி (Cold)");
        }
        if (text.contains("headache") || text.contains("தலைவலி") || text.contains("thalai vali") || text.contains("mandai")) {
            detected.add("தலைவலி (Headache)");
        }

        String triageLevel;
        String adviceEn;
        String adviceTa;
        boolean dispatchAmbulance = false;
        String genericRec = null;

        if (isRedFlag) {
            triageLevel = "RED";
            dispatchAmbulance = true;
            adviceEn = "CRITICAL ALERT: Your reported symptoms indicate a high-priority cardiac or respiratory emergency. Please do not exert yourself. Sit upright and take deep breaths. We recommend dispatching the 108 Emergency Ambulance immediately!";
            adviceTa = "அதிதீவிர அவசர எச்சரிக்கை: நீங்கள் கூறும் அறிகுறிகள் தீவிர நெஞ்சு அல்லது மூச்சுக்குழாய் பிரச்சினையாக இருக்கக்கூடும். உடனே படுக்காமல் நேராக அமருங்கள். இப்போதே 108 அவசர ஆம்புலன்ஸ் அழைக்கப்படுகிறது!";
        } else if (detected.stream().anyMatch(d -> d.contains("காய்ச்சல்") || d.contains("Fever"))) {
            triageLevel = "AMBER";
            adviceEn = "Mild to moderate fever symptoms detected. Hydrate with tender coconut water / ORS. For fever management, consider Paracetamol 500mg (Generic cost ₹0.40/tab). If fever persists for >48h or reaches 102°F, visit a nearby clinic for a complete blood count (CBC).";
            adviceTa = "காய்ச்சல் அறிகுறிகள் கண்டறியப்பட்டுள்ளன. இளநீர், ஓஆர்எஸ் நீர்ச்சத்து பருகவும். பாராசிட்டமால் 500 மிகி (அரசு மலிவு விலை ₹0.40) பரிந்துரைக்கப்படுகிறது. 48 மணி நேரத்திற்கு மேல் நீடித்தால் அல்லது 102°F தாண்டினால் ரத்த பரிசோதனை செய்து கொள்ள வேண்டும்.";
            genericRec = "Paracetamol 500mg (TNMSC Generic: ₹0.40/tablet vs Brand ₹3.50)";
        } else {
            triageLevel = "GREEN";
            adviceEn = "Symptoms appear mild and stable. Rest well and maintain balanced hydration. Logged in your longitudinal health record.";
            adviceTa = "அறிகுறிகள் இயல்பான நிலையிலேயே உள்ளன. போதிய ஓய்வு மற்றும் குடிநீர் எடுத்துக்கொள்ளுங்கள். உங்கள் குடும்ப நலக் குறிப்பேட்டில் இது பதிவு செய்யப்பட்டுள்ளது.";
            genericRec = "Generic Wellness Care";
        }

        long duration = System.currentTimeMillis() - startTime;

        return TriageResponse.builder()
                .triageLevel(triageLevel)
                .isRedFlag(isRedFlag)
                .adviceEn(adviceEn)
                .adviceTa(adviceTa)
                .detectedKeywords(detected)
                .shouldDispatchAmbulance(dispatchAmbulance)
                .genericMedicineRecommendation(genericRec)
                .urgencyMessage(isRedFlag ? "108 EMERGENCY REQUIRED" : "STANDARD CLINICAL MONITORING")
                .evaluationTimeMs(duration)
                .build();
    }
}
