package com.hospital.management.repository;

import com.hospital.management.model.MedicineOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineOrderRepository extends JpaRepository<MedicineOrder, Long> {
    List<MedicineOrder> findByPatientUsername(String patientUsername);
}
