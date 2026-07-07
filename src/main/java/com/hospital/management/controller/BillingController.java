package com.hospital.management.controller;

import com.hospital.management.model.Billing;
import com.hospital.management.repository.BillingRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Billing> getAllInvoices() {
        return billingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Billing> createInvoice(@RequestBody Billing billing, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (billing.getInvoiceNumber() == null || billing.getInvoiceNumber().isEmpty()) {
            long count = billingRepository.count() + 4001;
            billing.setInvoiceNumber("INV-" + count);
        }

        // Calculate totals dynamically
        double rawAmount = billing.getConsultationCharges() + billing.getRoomCharges() + billing.getIcuCharges() 
                + billing.getOtCharges() + billing.getLabCharges() + billing.getPharmacyCharges();
        double discounted = rawAmount - billing.getDiscount();
        double taxed = discounted * 0.05; // 5% flat healthcare tax
        billing.setTax(taxed);
        billing.setTotalAmount(discounted + taxed);

        Billing saved = billingRepository.save(billing);
        
        auditService.log(requestedBy, "CREATE_INVOICE", role, "Created invoice " + saved.getInvoiceNumber() + " - Total: $" + saved.getTotalAmount(), request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<Billing> processPayment(@PathVariable Long id, @RequestParam String method, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<Billing> billOpt = billingRepository.findById(id);
        if (billOpt.isPresent()) {
            Billing billing = billOpt.get();
            billing.setStatus("Paid");
            billing.setPaymentMethod(method);
            Billing updated = billingRepository.save(billing);

            auditService.log(requestedBy, "PROCESS_BILLING_PAYMENT", role, "Recorded payment for " + updated.getInvoiceNumber() + " via " + method, request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/claim")
    public ResponseEntity<Billing> processInsuranceClaim(@PathVariable Long id, @RequestParam String claimNumber, @RequestParam double approvedAmount, @RequestParam String status, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<Billing> billOpt = billingRepository.findById(id);
        if (billOpt.isPresent()) {
            Billing billing = billOpt.get();
            billing.setClaimNumber(claimNumber);
            billing.setClaimApprovedAmount(approvedAmount);
            billing.setStatus(status); // Claim_Approved or Claim_Rejected
            
            Billing updated = billingRepository.save(billing);
            auditService.log(requestedBy, "PROCESS_INSURANCE_CLAIM", role, "Processed insurance claim: " + claimNumber + " (Status: " + status + ") for Invoice: " + updated.getInvoiceNumber(), request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
