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

/**
 * HealthGrid Enterprise Rate Limiting Filter
 * Sliding-window token bucket algorithm protecting against API exhaustion and DDoS floods.
 */
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int AUTH_MAX_REQUESTS_PER_MINUTE = 15;
    private static final long WINDOW_MS = 60_000L;

    private final Map<String, ConcurrentLinkedDeque<Long>> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Skip rate limiting on CORS pre-flight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        int maxAllowed = path.startsWith("/api/auth") ? AUTH_MAX_REQUESTS_PER_MINUTE : MAX_REQUESTS_PER_MINUTE;

        long now = System.currentTimeMillis();
        String bucketKey = clientIp + ":" + (path.startsWith("/api/auth") ? "auth" : "api");

        ConcurrentLinkedDeque<Long> timestamps = requestCounts.computeIfAbsent(bucketKey, k -> new ConcurrentLinkedDeque<>());

        // Evict expired timestamps outside the sliding window
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() > WINDOW_MS) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxAllowed) {
            long oldestTimestamp = timestamps.peekFirst() != null ? timestamps.peekFirst() : now;
            long retryAfterSeconds = Math.max(1, (WINDOW_MS - (now - oldestTimestamp)) / 1000);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.getWriter().write(String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded for IP. Retry after %d seconds.\",\"retryAfter\":%d}",
                    retryAfterSeconds, retryAfterSeconds
            ));
            return;
        }

        timestamps.addLast(now);
        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
