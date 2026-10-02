package com.healthgrid.security;

import com.healthgrid.triage.dto.TriageResponse;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.List;
import java.util.regex.Pattern;

/**
 * HealthGrid Red-Hat Defense: Schedule H/X Drug Shield & Prompt Injection Interceptor
 * 
 * Automatically inspects outgoing JSON payloads for Schedule H/X controlled substances
 * (Narcotics, Sedatives, Habit-forming Opioids, High-risk unmonitored Antibiotics).
 * If an attempted LLM jailbreak or unverified dispensing is detected, this advice
 * deterministically intercepts and sanitizes the output with a clinical safety warning.
 */
@ControllerAdvice
public class DrugJailbreakAdvice implements ResponseBodyAdvice<Object> {

    // Regulated CDSCO Schedule H and X Controlled Substances
    private static final List<String> RESTRICTED_SUBSTANCES = List.of(
            "alprazolam", "diazepam", "fentanyl", "morphine", "tramadol",
            "codeine", "ketamine", "clonazepam", "lorazepam", "zolpidem",
            "buprenorphine", "pentazocine", "methadone", "midazolam",
            "ciprofloxacin", "azithromycin", "doxycycline", "steroid",
            "dexamethasone", "prednisolone", "hydrocortisone"
    );

    private static final String EN_SAFETY_SHIELD =
            "⚠️ Medical Safety Shield (CDSCO Schedule H/X): Prescriptions for controlled narcotics, sedatives, " +
            "and restricted antibiotics cannot be dispensed autonomously by AI. A direct clinical examination " +
            "by a registered medical practitioner (MBBS/MD) is legally mandated under NMC guidelines. " +
            "Please visit your nearest Primary Health Centre (PHC) or Government Hospital for evaluated care.";

    private static final String TA_SAFETY_SHIELD =
            "⚠️ மருத்துவப் பாதுகாப்பு எச்சரிக்கை (அட்டவணை H/X): கட்டுப்படுத்தப்பட்ட மயக்க மருந்துகள், " +
            "மன அமைதி மருந்துகள் மற்றும் உயர் வீரிய நுண்ணுயிர் எதிர்ப்பிகள் (Antibiotics) AI மூலம் பரிந்துரைக்கப்படக் கூடாது. " +
            "பதிவு செய்யப்பட்ட மருத்துவரின் நேரடி பரிசோதனை அவசியமானது. அருகிலுள்ள அரசு ஆரம்ப சுகாதார நிலையம் (PHC) " +
            "அல்லது அரசு மருத்துவமனையை அணுகவும்.";

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Intercept all response bodies returned by controllers
        return true;
    }

    @Override
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response
    ) {
        if (body == null) {
            return null;
        }

        // 1. Intercept TriageResponse objects
        if (body instanceof TriageResponse triageResponse) {
            String adviceEn = triageResponse.getAdviceEn() != null ? triageResponse.getAdviceEn() : "";
            String adviceTa = triageResponse.getAdviceTa() != null ? triageResponse.getAdviceTa() : "";
            String genericRec = triageResponse.getGenericMedicineRecommendation() != null
                    ? triageResponse.getGenericMedicineRecommendation() : "";

            if (containsRestrictedSubstance(adviceEn) || containsRestrictedSubstance(genericRec)) {
                return TriageResponse.builder()
                        .triageLevel("AMBER")
                        .isRedFlag(false)
                        .adviceEn(EN_SAFETY_SHIELD)
                        .adviceTa(TA_SAFETY_SHIELD)
                        .detectedKeywords(List.of("Schedule H/X Drug Shield Triggered"))
                        .shouldDispatchAmbulance(false)
                        .genericMedicineRecommendation("Physical Doctor Consultation Mandated")
                        .urgencyMessage("SCHEDULE H/X CONTROLLED SUBSTANCE SHIELD INTERCEPTED")
                        .evaluationTimeMs(triageResponse.getEvaluationTimeMs())
                        .build();
            }
        }

        return body;
    }

    /**
     * Checks if a string contains any Schedule H/X controlled substance keyword using word-boundary matching.
     */
    public static boolean containsRestrictedSubstance(String input) {
        if (input == null || input.isBlank()) {
            return false;
        }
        String lower = input.toLowerCase();
        for (String drug : RESTRICTED_SUBSTANCES) {
            // Match whole word boundary to prevent false positives (e.g., 'code' matching 'codeine')
            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(drug) + "\\b", Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(lower).find()) {
                return true;
            }
        }
        return false;
    }
}
