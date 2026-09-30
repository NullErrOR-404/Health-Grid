package com.healthgrid.emergency.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ambulance_dispatches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmbulanceDispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "dispatch_number", unique = true, nullable = false)
    private String dispatchNumber;

    @Column(nullable = false)
    private String status; // "DISPATCHED", "EN_ROUTE", "ARRIVED", "COMPLETED"

    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @Column(name = "driver_name", nullable = false)
    private String driverName;

    @Column(name = "paramedic_name", nullable = false)
    private String paramedicName;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "pickup_latitude", nullable = false)
    private Double pickupLatitude;

    @Column(name = "pickup_longitude", nullable = false)
    private Double pickupLongitude;

    @Column(name = "ambulance_latitude", nullable = false)
    private Double ambulanceLatitude;

    @Column(name = "ambulance_longitude", nullable = false)
    private Double ambulanceLongitude;

    @Column(name = "eta_minutes", nullable = false)
    private Integer etaMinutes;

    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;

    @Column(name = "speed_kmh", nullable = false)
    private Integer speedKmh;

    @ElementCollection
    @CollectionTable(name = "ambulance_quick_instructions", joinColumns = @JoinColumn(name = "dispatch_id"))
    @Column(name = "instruction")
    @Builder.Default
    private List<String> quickInstructions = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ambulance_custom_notes", joinColumns = @JoinColumn(name = "dispatch_id"))
    @Column(name = "note")
    @Builder.Default
    private List<String> customNotes = new ArrayList<>();

    @Column(name = "paramedic_advice")
    private String paramedicAdvice;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
