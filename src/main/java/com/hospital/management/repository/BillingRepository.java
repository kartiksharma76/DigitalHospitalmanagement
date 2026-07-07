package com.hospital.management.repository;

import com.hospital.management.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, Long> {
    Optional<Billing> findByInvoiceNumber(String invoiceNumber);
    List<Billing> findByPatientId(Long patientId);
}
