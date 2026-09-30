package com.healthgrid.triage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageRequest {
    private String symptomsText;
    private String language; // "ta" or "en"
    private String patientPhone;
    private Integer patientAge;
    private String patientGender;
}
