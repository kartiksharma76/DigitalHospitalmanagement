package com.hospital.management.controller;

import com.hospital.management.model.Nurse;
import com.hospital.management.model.User;
import com.hospital.management.repository.NurseRepository;
import com.hospital.management.repository.UserRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/nurses")
public class NurseController {

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Nurse> getAllNurses() {
        return nurseRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Nurse> addNurse(@RequestBody Nurse nurse, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (nurse.getNurseId() == null || nurse.getNurseId().isEmpty()) {
            long count = nurseRepository.count() + 3001;
            nurse.setNurseId("N-" + count);
        }
        Nurse saved = nurseRepository.save(nurse);

        // Auto-create login credentials for NURSE
        String nurseUsername = "nurse_" + nurse.getLastName().toLowerCase().replaceAll("\\s+", "");
        if (!userRepository.findByUsername(nurseUsername).isPresent()) {
            User newUser = new User(nurseUsername, "nurse123", "Nurse " + nurse.getFirstName() + " " + nurse.getLastName(), 
                                    nurse.getFirstName().toLowerCase() + "." + nurse.getLastName().toLowerCase() + "@hospital.com", 
                                    "NURSE", true);
            newUser.setApprovalStatus("APPROVED");
            userRepository.save(newUser);
        }

        auditService.log(requestedBy, "ADD_NEW_NURSE", role, "Added nursing staff: Nurse " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getDepartment() + ") with username: " + nurseUsername, request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }
}
