package com.hospital.management.controller;

import com.hospital.management.model.Patient;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<Patient> pOpt = patientRepository.findById(id);
        if (pOpt.isPresent()) {
            auditService.log(requestedBy, "ACCESS_PATIENT_RECORD", role, "Viewed clinical record of patient: " + pOpt.get().getPatientId(), request.getRemoteAddr());
            return ResponseEntity.ok(pOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Patient> registerPatient(@RequestBody Patient patient, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        // Generate automatic patient ID if not provided
        if (patient.getPatientId() == null || patient.getPatientId().isEmpty()) {
            long count = patientRepository.count() + 1001;
            patient.setPatientId("P-" + count);
        }
        
        Patient saved = patientRepository.save(patient);
        auditService.log(requestedBy, "REGISTER_PATIENT", role, "Registered new patient record: " + saved.getPatientId(), request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }
}
