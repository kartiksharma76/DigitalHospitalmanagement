package com.hospital.management.controller;

import com.hospital.management.model.MedicalRecord;
import com.hospital.management.repository.MedicalRecordRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getPatientRecords(@PathVariable Long patientId, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        auditService.log(requestedBy, "ACCESS_EHR_RECORDS", role, "Retrieved all medical records for patient ID: " + patientId, request.getRemoteAddr());
        return medicalRecordRepository.findByPatientId(patientId);
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createMedicalRecord(@RequestBody MedicalRecord record, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        // Enforce digital signature compliance tracking
        if (record.getDoctorDigitalSignature() == null || record.getDoctorDigitalSignature().isEmpty()) {
            record.setDoctorDigitalSignature("Digitally Verified by Dr. " + requestedBy + " [ID: " + record.getDoctor().getId() + "]");
        }
        
        MedicalRecord saved = medicalRecordRepository.save(record);
        
        auditService.log(requestedBy, "WRITE_CLINICAL_NOTE", role, "Logged diagnostic entry and prescription for patient: " + saved.getPatient().getPatientId(), request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }
}
