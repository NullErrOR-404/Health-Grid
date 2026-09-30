package com.healthgrid.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // In-memory message broker destination prefixes
        config.enableSimpleBroker("/topic", "/queue");
        // Application destination prefix for client messages sent to @MessageMapping handlers
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP WebSocket endpoint with SockJS fallback and CORS support
        registry.addEndpoint("/ws-healthgrid")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
