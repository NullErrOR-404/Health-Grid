package com.healthgrid.emergency.repository;

import com.healthgrid.emergency.model.AmbulanceDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AmbulanceRepository extends JpaRepository<AmbulanceDispatch, UUID> {
    Optional<AmbulanceDispatch> findTopByStatusOrderByCreatedAtDesc(String status);
    Optional<AmbulanceDispatch> findByDispatchNumber(String dispatchNumber);
}
