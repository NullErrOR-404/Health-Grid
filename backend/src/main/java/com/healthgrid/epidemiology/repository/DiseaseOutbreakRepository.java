package com.healthgrid.epidemiology.repository;

import com.healthgrid.epidemiology.model.DiseaseOutbreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiseaseOutbreakRepository extends JpaRepository<DiseaseOutbreak, UUID> {
    List<DiseaseOutbreak> findByIsActiveTrue();
}
