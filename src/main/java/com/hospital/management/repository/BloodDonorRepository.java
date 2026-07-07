package com.hospital.management.repository;

import com.hospital.management.model.BloodDonor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BloodDonorRepository extends JpaRepository<BloodDonor, Long> {
    List<BloodDonor> findByBloodGroup(String bloodGroup);
}
