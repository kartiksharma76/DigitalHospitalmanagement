package com.hospital.management.controller;

import com.hospital.management.model.Doctor;
import com.hospital.management.model.User;
import com.hospital.management.repository.DoctorRepository;
import com.hospital.management.repository.UserRepository;
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
    private UserRepository userRepository;

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

        // Auto-create login credentials for DOCTOR
        String docUsername = "dr_" + doctor.getLastName().toLowerCase().replaceAll("\\s+", "");
        if (!userRepository.findByUsername(docUsername).isPresent()) {
            User newUser = new User(docUsername, "doc123", "Dr. " + doctor.getFirstName() + " " + doctor.getLastName(), 
                                    doctor.getFirstName().toLowerCase() + "." + doctor.getLastName().toLowerCase() + "@hospital.com", 
                                    "DOCTOR", true);
            newUser.setApprovalStatus("APPROVED");
            userRepository.save(newUser);
        }

        auditService.log(requestedBy, "ADD_NEW_DOCTOR", role, "Added clinician: Dr. " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getSpecialization() + ") with username: " + docUsername, request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }
}
