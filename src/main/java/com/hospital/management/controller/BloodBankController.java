package com.hospital.management.controller;

import com.hospital.management.model.BloodDonor;
import com.hospital.management.repository.BloodDonorRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/blood-bank")
public class BloodBankController {

    @Autowired
    private BloodDonorRepository bloodDonorRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<BloodDonor> getAllDonors() {
        return bloodDonorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<BloodDonor> registerDonor(@RequestBody BloodDonor donor, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        BloodDonor saved = bloodDonorRepository.save(donor);
        auditService.log(requestedBy, "REGISTER_BLOOD_DONOR", role, "Registered blood donor: " + saved.getDonorName() + " (" + saved.getBloodGroup() + ")", request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }
}
