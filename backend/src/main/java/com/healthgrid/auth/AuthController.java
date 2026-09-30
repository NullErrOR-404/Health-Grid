package com.healthgrid.auth;

import com.healthgrid.auth.model.User;
import com.healthgrid.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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

        return userRepository.findByEmail(email)
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
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid email or password")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String fullName = request.get("fullName");
        String phone = request.get("phone");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered"));
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .phoneNumber(phone)
                .role("PATIENT")
                .preferredLanguage("ta")
                .build();

        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail(), saved.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", saved.getId(),
                        "email", saved.getEmail(),
                        "fullName", saved.getFullName(),
                        "role", saved.getRole()
                )
        ));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .fullName(name)
                    .role("PATIENT")
                    .preferredLanguage("ta")
                    .build();
            return userRepository.save(newUser);
        });

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole()
                )
        ));
    }
}
