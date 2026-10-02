# ==============================================================================
# HealthGrid Backend - Production Multi-Stage Dockerfile
# Java 21 LTS (Project Loom Virtual Threads) + Spring Boot 3.3.4
# Built for SIH25049 - 100,000+ Concurrent User Scalability Target
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Spring Boot executable fat JAR
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal Distroless / Hardened Alpine Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Create dedicated non-root application user for military-grade security
RUN addgroup -S healthgrid && adduser -S healthgrid -G healthgrid

WORKDIR /app

# Copy artifact from build stage
COPY --from=builder /build/target/healthgrid-backend-*.jar app.jar

# Grant ownership to non-root user
RUN chown -R healthgrid:healthgrid /app

USER healthgrid

# Expose HTTP API & WebSocket Port
EXPOSE 8080

# Environment Defaults for Java 21 Virtual Threads & Low-Latency Garbage Collection
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication -Dspring.threads.virtual.enabled=true"

# Healthcheck to verify Spring Boot responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/prescription/medicines || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
