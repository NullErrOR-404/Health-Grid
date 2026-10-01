package com.healthgrid.config;

import com.healthgrid.auth.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * HealthGrid JWT Authentication Filter
 * Extracts Bearer token, validates signatures, and injects authentication into Spring SecurityContext.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && tokenProvider.validateToken(token)) {
            try {
                Claims claims = tokenProvider.getClaimsFromToken(token);
                String email = (String) claims.get("email");
                String role = (String) claims.get("role");
                if (role == null || role.isBlank()) {
                    role = "PATIENT";
                }

                String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase();
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email != null ? email : claims.getSubject(),
                        null,
                        List.of(new SimpleGrantedAuthority(roleName))
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                logger.warn("Failed to set user authentication in SecurityContext: " + ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7).trim();
        }
        return null;
    }
}
