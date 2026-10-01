package com.healthgrid.auth;

import com.healthgrid.auth.model.User;
import com.healthgrid.auth.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * HealthGrid Authenticated Identity Controller
 * Hardened against Account Takeover (ATO), credential stuffing, and injection attacks.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public AuthController(UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        return userRepository.findByEmail(email.trim().toLowerCase())
                .filter(u -> u.getPasswordHash() != null && passwordEncoder.matches(password, u.getPasswordHash()))
                .map(u -> {
                    String token = tokenProvider.generateToken(u.getId(), u.getEmail(), u.getRole());
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "user", Map.of(
                                    "id", u.getId(),
                                    "email", u.getEmail(),
                                    "fullName", u.getFullName() != null ? u.getFullName() : "",
                                    "role", u.getRole()
                            )
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String fullName = request.get("fullName");
        String phone = request.get("phone");

        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid email address is required."));
        }

        if (password == null || password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters long."));
        }

        String sanitizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(sanitizedEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email is already registered."));
        }

        String sanitizedFullName = fullName != null ? fullName.replaceAll("<[^>]*>", "").trim() : "Patient";

        User user = User.builder()
                .email(sanitizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(sanitizedFullName)
                .phoneNumber(phone != null ? phone.trim() : null)
                .role("PATIENT")
                .preferredLanguage("ta")
                .build();

        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token", token,
                "user", Map.of(
                        "id", saved.getId(),
                        "email", saved.getEmail(),
                        "fullName", saved.getFullName(),
                        "role", saved.getRole()
                )
        ));
    }

    /**
     * Authenticates verified OAuth tokens (Google / Supabase)
     * Mitigates Account Takeover (ATO) by requiring and validating bearer token signature.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> request) {
        String idToken = request.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            idToken = request.get("token");
        }

        if (idToken == null || !tokenProvider.validateToken(idToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Unauthorized: Valid OAuth signature or bearer token is required."
            ));
        }

        Claims claims = tokenProvider.getClaimsFromToken(idToken);
        String email = (String) claims.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid OAuth payload: missing email claim."));
        }

        String name = request.get("name");
        String finalEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .email(finalEmail)
                    .fullName(name != null ? name.replaceAll("<[^>]*>", "").trim() : "Patient")
                    .role("PATIENT")
                    .preferredLanguage("ta")
                    .build();
            return userRepository.save(newUser);
        });

        String sessionToken = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "token", sessionToken,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole()
                )
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName() != null ? u.getFullName() : "",
                        "role", u.getRole()
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User profile not found")));
    }
}
