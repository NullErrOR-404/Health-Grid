package com.healthgrid.epidemiology.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "disease_outbreaks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseOutbreak {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "disease_name", nullable = false)
    private String diseaseName;

    @Column(name = "ward_name", nullable = false)
    private String wardName;

    private String district;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel; // "HIGH", "MODERATE", "LOW"

    @Column(name = "case_count")
    private Integer caseCount;

    @Column(name = "advisory_en")
    private String advisoryEn;

    @Column(name = "advisory_ta")
    private String advisoryTa;

    private Double latitude;
    private Double longitude;

    @Column(name = "is_active")
    private Boolean isActive;
}
