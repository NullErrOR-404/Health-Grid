package com.healthgrid.emergency;

import com.healthgrid.emergency.model.AmbulanceDispatch;
import com.healthgrid.emergency.repository.AmbulanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergency")
public class AmbulanceController {

    private final AmbulanceRepository ambulanceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AmbulanceController(AmbulanceRepository ambulanceRepository, SimpMessagingTemplate messagingTemplate) {
        this.ambulanceRepository = ambulanceRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/active-dispatch")
    public ResponseEntity<AmbulanceDispatch> getActiveDispatch() {
        // Return latest active dispatch or high-fidelity simulated 108 ambulance
        return ambulanceRepository.findTopByStatusOrderByCreatedAtDesc("EN_ROUTE")
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    AmbulanceDispatch demo = AmbulanceDispatch.builder()
                            .id(UUID.randomUUID())
                            .dispatchNumber("108-DISP-2026-CH09")
                            .status("EN_ROUTE")
                            .vehicleNumber("TN-09-G-1084")
                            .driverName("M. Selvam")
                            .paramedicName("Dr. K. Ramesh (Paramedic Lead)")
                            .pickupAddress("No. 14, 2nd Main Road, Royapuram, Chennai")
                            .pickupLatitude(13.1147000)
                            .pickupLongitude(80.2970000)
                            .ambulanceLatitude(13.1021000)
                            .ambulanceLongitude(80.2850000)
                            .etaMinutes(5)
                            .distanceKm(2.1)
                            .speedKmh(45)
                            .quickInstructions(new ArrayList<>(List.of(
                                    "Bring Stretcher (2nd Floor, No Lift)",
                                    "Narrow Street (Park on Main Road)"
                            )))
                            .customNotes(new ArrayList<>(List.of(
                                    "Green gate behind the Pillayar temple."
                            )))
                            .paramedicAdvice("Keep patient resting at 45 degree angle. Do not administer oral fluids. Turn on porch light for identification.")
                            .createdAt(Instant.now())
                            .build();
                    return ResponseEntity.ok(demo);
                });
    }

    @PostMapping("/instruction")
    public ResponseEntity<Map<String, Object>> addInstruction(@RequestBody Map<String, String> payload) {
        String instruction = payload.get("instruction");
        String dispatchId = payload.get("dispatchId");

        // Broadcast to WebSocket subscribers for live crew sync
        messagingTemplate.convertAndSend("/topic/ambulance/instructions", Map.of(
                "dispatchId", dispatchId != null ? dispatchId : "108-DISP-2026-CH09",
                "instruction", instruction,
                "timestamp", Instant.now().toString()
        ));

        return ResponseEntity.ok(Map.of(
                "status", "DELIVERED_TO_PARAMEDIC",
                "message", "Instruction confirmed on paramedic onboard tablet."
        ));
    }

    @MessageMapping("/ambulance/{id}/note")
    @SendTo("/topic/ambulance/{id}")
    public Map<String, Object> streamLiveInstruction(@DestinationVariable String id, Map<String, String> message) {
        return Map.of(
                "dispatchId", id,
                "note", message.get("note"),
                "sender", message.get("sender"),
                "timestamp", Instant.now().toString()
        );
    }
}
