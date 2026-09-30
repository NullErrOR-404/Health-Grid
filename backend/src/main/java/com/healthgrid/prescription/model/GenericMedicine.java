package com.healthgrid.prescription.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "generic_medicines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "generic_name", nullable = false)
    private String genericName;

    private String strength;

    @Column(name = "brand_price", nullable = false)
    private BigDecimal brandPrice;

    @Column(name = "generic_price", nullable = false)
    private BigDecimal genericPrice;

    @Column(name = "savings_percentage", nullable = false)
    private Integer savingsPercentage;

    private String category;

    @Column(name = "timing_instructions_en")
    private String timingInstructionsEn;

    @Column(name = "timing_instructions_ta")
    private String timingInstructionsTa;
}
