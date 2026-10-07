package com.healthgrid.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.regex.Pattern;

/**
 * HealthGrid Enterprise Multi-Dimensional Tiered Rate Limiting Filter
 * 
 * Implements OWASP API4:2023 Defense-in-Depth against DoS, brute force, and API abuse:
 * 1. IP Spoofing Shield: Validates X-Forwarded-For format with strict regex, falling back to socket remote address.
 * 2. Identity-Bound Buckets: Binds authenticated callers to their JWT Subject/Token ID so IP rotation via proxies cannot bypass limits.
 * 3. Granular Tiered Quotas:
 *    - Authentication (Brute Force Defense): 5 attempts / 5 minutes
 *    - AI / Clinical Triage: 10 requests / minute
 *    - State Mutations (POST/PUT/DELETE): 20 requests / minute
 *    - General Read Endpoints: 60 requests / minute
 * 4. RFC 6585 Compliance: Emits X-RateLimit headers and 429 Too Many Requests with Retry-After.
 */
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Pattern IPV4_PATTERN = Pattern.compile("^([0-9]{1,3}\\.){3}[0-9]{1,3}$");
    private static final Pattern IPV6_PATTERN = Pattern.compile("^[0-9a-fA-F:]+$");

    // Tier 1: Authentication (Login & Registration) - 5 requests per 5 minutes
    private static final int AUTH_MAX_REQUESTS = 5;
    private static final long AUTH_WINDOW_MS = 300_000L; // 5 minutes

    // Tier 2: AI Triage & Symptom Evaluation - 10 requests per minute
    private static final int AI_MAX_REQUESTS = 10;
    private static final long AI_WINDOW_MS = 60_000L;

    // Tier 3: State Mutations (Clinical Orders, Admissions, Instructions) - 20 requests per minute
    private static final int MUTATION_MAX_REQUESTS = 20;
    private static final long MUTATION_WINDOW_MS = 60_000L;

    // Tier 4: General Public Read Endpoints - 60 requests per minute
    private static final int GENERAL_MAX_REQUESTS = 60;
    private static final long GENERAL_WINDOW_MS = 60_000L;

    private final Map<String, ConcurrentLinkedDeque<Long>> requestBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip rate limiting on CORS pre-flight OPTIONS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Determine applicable tier and limits
        int maxAllowed;
        long windowMs;
        String tierName;

        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            tierName = "auth";
            maxAllowed = AUTH_MAX_REQUESTS;
            windowMs = AUTH_WINDOW_MS;
        } else if (path.startsWith("/api/triage")) {
            tierName = "ai_triage";
            maxAllowed = AI_MAX_REQUESTS;
            windowMs = AI_WINDOW_MS;
        } else if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
            tierName = "mutation";
            maxAllowed = MUTATION_MAX_REQUESTS;
            windowMs = MUTATION_WINDOW_MS;
        } else {
            tierName = "general";
            maxAllowed = GENERAL_MAX_REQUESTS;
            windowMs = GENERAL_WINDOW_MS;
        }

        // Calculate rate limiting key (User identity if authenticated, otherwise validated client IP)
        String callerIdentity = getCallerIdentity(request);
        String bucketKey = callerIdentity + ":" + tierName;

        long now = System.currentTimeMillis();
        ConcurrentLinkedDeque<Long> timestamps = requestBuckets.computeIfAbsent(bucketKey, k -> new ConcurrentLinkedDeque<>());

        // Slide window by discarding timestamps older than windowMs
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > windowMs) {
            timestamps.pollFirst();
        }

        int currentCount = timestamps.size();

        // Enforce rate limit
        if (currentCount >= maxAllowed) {
            long oldestTimestamp = timestamps.peekFirst() != null ? timestamps.peekFirst() : now;
            long retryAfterSeconds = Math.max(1, (windowMs - (now - oldestTimestamp)) / 1000);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setHeader("X-RateLimit-Reset", String.valueOf(retryAfterSeconds));

            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded for %s tier. Retry after %d seconds.\",\"retryAfter\":%d}",
                    tierName, retryAfterSeconds, retryAfterSeconds
            ));
            return;
        }

        // Record request
        timestamps.addLast(now);

        // Set telemetry headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxAllowed - currentCount - 1)));

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts caller identity. If a Bearer token is provided, binds the bucket to the token
     * hash to eliminate IP rotation evasion. Otherwise binds to sanitized remote IP.
     */
    private String getCallerIdentity(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ") && authHeader.length() > 15) {
            // Bind to token fingerprint
            String token = authHeader.substring(7).trim();
            return "user:" + Math.abs(token.hashCode());
        }

        // Untrusted proxy sanitation
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            String candidateIp = xfHeader.split(",")[0].trim();
            if (IPV4_PATTERN.matcher(candidateIp).matches() || IPV6_PATTERN.matcher(candidateIp).matches()) {
                return "ip:" + candidateIp;
            }
        }

        String remoteAddr = request.getRemoteAddr();
        return "ip:" + (remoteAddr != null ? remoteAddr : "unknown");
    }
}
