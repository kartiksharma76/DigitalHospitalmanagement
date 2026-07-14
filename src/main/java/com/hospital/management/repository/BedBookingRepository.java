package com.hospital.management.repository;

import com.hospital.management.model.BedBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BedBookingRepository extends JpaRepository<BedBooking, Long> {
    List<BedBooking> findByPatientUsername(String patientUsername);
}
