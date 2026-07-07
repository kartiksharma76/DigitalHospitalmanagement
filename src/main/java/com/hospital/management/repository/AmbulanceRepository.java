package com.hospital.management.repository;

import com.hospital.management.model.Ambulance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
    Optional<Ambulance> findByVehicleNumber(String vehicleNumber);
}
