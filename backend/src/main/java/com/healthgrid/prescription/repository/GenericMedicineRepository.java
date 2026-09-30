package com.healthgrid.prescription.repository;

import com.healthgrid.prescription.model.GenericMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GenericMedicineRepository extends JpaRepository<GenericMedicine, UUID> {
    List<GenericMedicine> findByBrandNameContainingIgnoreCaseOrGenericNameContainingIgnoreCase(String brand, String generic);
}
