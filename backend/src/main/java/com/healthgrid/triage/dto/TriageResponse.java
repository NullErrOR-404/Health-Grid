package com.healthgrid.triage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageResponse {
    private String triageLevel; // "RED", "AMBER", "YELLOW", "GREEN"
    private boolean isRedFlag;
    private String adviceEn;
    private String adviceTa;
    private List<String> detectedKeywords;
    private String urgencyMessage;
    private boolean shouldDispatchAmbulance;
    private String genericMedicineRecommendation;
    private long evaluationTimeMs;
}
