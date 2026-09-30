package com.healthgrid.triage;

import com.healthgrid.triage.dto.TriageRequest;
import com.healthgrid.triage.dto.TriageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/triage")
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<TriageResponse> evaluateSymptoms(@RequestBody TriageRequest request) {
        TriageResponse response = triageService.evaluate(request);
        return ResponseEntity.ok(response);
    }
}
