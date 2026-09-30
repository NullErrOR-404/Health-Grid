package com.healthgrid.epidemiology.repository;

import com.healthgrid.epidemiology.model.CitizenHazardReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CitizenHazardRepository extends JpaRepository<CitizenHazardReport, UUID> {
}
