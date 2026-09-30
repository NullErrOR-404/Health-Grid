package com.healthgrid.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;

    private String fullName;

    private String phoneNumber;

    @Column(nullable = false)
    @Builder.Default
    private String role = "PATIENT"; // "PATIENT", "DOCTOR", "PARAMEDIC", "ADMIN"

    private String preferredLanguage;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
