package com.hospital.management.repository;

import com.hospital.management.model.Surgery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SurgeryRepository extends JpaRepository<Surgery, Long> {
    List<Surgery> findByDate(String date);
    List<Surgery> findByPatientId(Long patientId);
}
