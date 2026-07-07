package com.hospital.management.controller;

import com.hospital.management.model.Doctor;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor doctor, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (doctor.getDoctorId() == null || doctor.getDoctorId().isEmpty()) {
            long count = doctorRepository.count() + 2001;
            doctor.setDoctorId("D-" + count);
        }
        Doctor saved = doctorRepository.save(doctor);
        auditService.log(requestedBy, "ADD_NEW_DOCTOR", role, "Added clinician: Dr. " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getSpecialization() + ")", request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }
}
