package com.healthgrid.epidemiology.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "citizen_hazard_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenHazardReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reporter_phone")
    private String reporterPhone;

    @Column(name = "hazard_type", nullable = false)
    private String hazardType;

    @Column(name = "location_address", nullable = false)
    private String locationAddress;

    private Double latitude;
    private Double longitude;

    @Column(name = "image_url")
    private String imageUrl;

    private String status; // "SUBMITTED", "DISPATCHED", "RESOLVED"

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
