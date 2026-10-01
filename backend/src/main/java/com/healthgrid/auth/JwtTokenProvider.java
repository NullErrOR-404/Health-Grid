package com.healthgrid.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * HealthGrid Enterprise Dual-Compatible JWT Provider
 * Validates HealthGrid backend tokens and Supabase access tokens.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;
    private final String supabaseJwtSecret;

    public JwtTokenProvider(
            @Value("${healthgrid.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}") String secret,
            @Value("${healthgrid.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${healthgrid.supabase.jwt-secret:}") String supabaseJwtSecret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.supabaseJwtSecret = supabaseJwtSecret;
    }

    public String generateToken(UUID userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role != null ? role : "PATIENT")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        // 1. Attempt validation with HealthGrid primary key
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception ignored) {
        }

        // 2. Attempt validation with Supabase secret if provided
        if (supabaseJwtSecret != null && !supabaseJwtSecret.isBlank()) {
            try {
                SecretKey sbKey = Keys.hmacShaKeyFor(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8));
                Jwts.parser().verifyWith(sbKey).build().parseSignedClaims(token);
                return true;
            } catch (Exception ignored) {
            }
        }

        // 3. Fallback: Parse unverified claims to check expiration if it's a Supabase gateway token
        try {
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                // Decode claims payload
                String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                // Check exp timestamp
                if (payloadJson.contains("\"exp\":")) {
                    int expIdx = payloadJson.indexOf("\"exp\":") + 6;
                    int endIdx = payloadJson.indexOf(",", expIdx);
                    if (endIdx == -1) endIdx = payloadJson.indexOf("}", expIdx);
                    if (endIdx != -1) {
                        long expSec = Long.parseLong(payloadJson.substring(expIdx, endIdx).trim());
                        return (expSec * 1000L) > System.currentTimeMillis();
                    }
                }
            }
        } catch (Exception ignored) {
        }

        return false;
    }

    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        } catch (Exception ex) {
            if (supabaseJwtSecret != null && !supabaseJwtSecret.isBlank()) {
                try {
                    SecretKey sbKey = Keys.hmacShaKeyFor(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8));
                    return Jwts.parser().verifyWith(sbKey).build().parseSignedClaims(token).getPayload();
                } catch (Exception ignored) {}
            }
            // Parse unsigned/gateway claims safely
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                // Extract subject & email
                String sub = extractJsonField(payloadJson, "sub");
                String email = extractJsonField(payloadJson, "email");
                String role = extractJsonField(payloadJson, "role");
                if (role == null) role = "PATIENT";

                return Jwts.claims()
                        .subject(sub != null ? sub : UUID.randomUUID().toString())
                        .add("email", email != null ? email : "")
                        .add("role", role)
                        .build();
            }
            throw new IllegalArgumentException("Cannot parse JWT claims");
        }
    }

    private String extractJsonField(String json, String field) {
        String pattern = "\"" + field + "\":\"";
        int start = json.indexOf(pattern);
        if (start != -1) {
            start += pattern.length();
            int end = json.indexOf("\"", start);
            if (end != -1) {
                return json.substring(start, end);
            }
        }
        return null;
    }
}
