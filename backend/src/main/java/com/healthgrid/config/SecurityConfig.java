package com.healthgrid.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * HealthGrid Enterprise Zero-Trust Security Configuration
 * Incorporates RateLimitingFilter, JwtAuthenticationFilter, strict CORS whitelist,
 * Anti-Clickjacking headers, fine-grained endpoint authorization, and SpEL method security.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;

    @Value("${healthgrid.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://healthgrid-app.vercel.app,https://healthgrid-live.vercel.app,https://healthgrid-network.vercel.app,https://healthgrid-nu.vercel.app}")
    private List<String> allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, RateLimitingFilter rateLimitingFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Stateless JWT architecture
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny()) // OWASP Anti-Clickjacking
                .contentTypeOptions(content -> {})  // X-Content-Type-Options: nosniff
                .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(63072000))
                .referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public Health & Emergency Triage Routes (No barrier to life-saving care)
                .requestMatchers(
                    "/api/auth/**",
                    "/api/triage/**",
                    "/api/prescription/medicines",
                    "/api/prescription/search",
                    "/api/epidemiology/active-outbreaks",
                    "/api/emergency/active-dispatch",
                    "/ws-healthgrid/**",
                    "/error"
                ).permitAll()

                // State-changing routes require authenticated identity
                .requestMatchers(HttpMethod.POST, "/api/emergency/instruction").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/epidemiology/report-hazard").authenticated()

                // All other requests require valid Bearer token
                .anyRequest().authenticated()
            )
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
