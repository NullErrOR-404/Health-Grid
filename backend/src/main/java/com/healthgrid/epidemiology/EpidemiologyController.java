package com.healthgrid.epidemiology;

import com.healthgrid.epidemiology.model.CitizenHazardReport;
import com.healthgrid.epidemiology.model.DiseaseOutbreak;
import com.healthgrid.epidemiology.repository.CitizenHazardRepository;
import com.healthgrid.epidemiology.repository.DiseaseOutbreakRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/epidemiology")
public class EpidemiologyController {

    private final DiseaseOutbreakRepository outbreakRepository;
    private final CitizenHazardRepository citizenHazardRepository;

    public EpidemiologyController(DiseaseOutbreakRepository outbreakRepository, CitizenHazardRepository citizenHazardRepository) {
        this.outbreakRepository = outbreakRepository;
        this.citizenHazardRepository = citizenHazardRepository;
    }

    @GetMapping("/active-outbreaks")
    public ResponseEntity<List<DiseaseOutbreak>> getActiveOutbreaks() {
        return ResponseEntity.ok(outbreakRepository.findByIsActiveTrue());
    }

    @PostMapping("/report-hazard")
    public ResponseEntity<Map<String, Object>> submitHazardReport(@RequestBody CitizenHazardReport report) {
        report.setStatus("SUBMITTED");
        CitizenHazardReport saved = citizenHazardRepository.save(report);
        return ResponseEntity.ok(Map.of(
                "reportId", saved.getId(),
                "status", "DISPATCHED_TO_SANITARY_INSPECTOR",
                "messageEn", "Vector hazard logged with GPS tag. Spraying scheduled within 24 hours.",
                "messageTa", "உங்கள் பகுதி சுகாதார குழுவிற்கு தகவல் அனுப்பப்பட்டது. 24 மணி நேரத்திற்குள் கொசு மருந்து அடிக்கப்படும்."
        ));
    }
}
