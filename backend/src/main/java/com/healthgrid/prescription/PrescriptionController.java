package com.healthgrid.prescription;

import com.healthgrid.prescription.model.GenericMedicine;
import com.healthgrid.prescription.repository.GenericMedicineRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescription")
public class PrescriptionController {

    private final GenericMedicineRepository genericMedicineRepository;

    public PrescriptionController(GenericMedicineRepository genericMedicineRepository) {
        this.genericMedicineRepository = genericMedicineRepository;
    }

    @GetMapping("/medicines")
    public ResponseEntity<List<GenericMedicine>> getAllMedicines() {
        return ResponseEntity.ok(genericMedicineRepository.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<GenericMedicine>> searchMedicines(@RequestParam String query) {
        return ResponseEntity.ok(
                genericMedicineRepository.findByBrandNameContainingIgnoreCaseOrGenericNameContainingIgnoreCase(query, query)
        );
    }
}
