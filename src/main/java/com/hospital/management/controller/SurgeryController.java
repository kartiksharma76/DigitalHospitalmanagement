package com.hospital.management.controller;

import com.hospital.management.model.Surgery;
import com.hospital.management.repository.SurgeryRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/surgeries")
public class SurgeryController {

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Surgery> getAllSurgeries() {
        return surgeryRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Surgery> scheduleSurgery(@RequestBody Surgery surgery, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (surgery.getSurgeryCode() == null || surgery.getSurgeryCode().isEmpty()) {
            long count = surgeryRepository.count() + 701;
            surgery.setSurgeryCode("SURG-" + count);
        }
        Surgery saved = surgeryRepository.save(surgery);
        auditService.log(requestedBy, "SCHEDULE_SURGERY", role, "Scheduled surgery: " + saved.getSurgeryCode() + " for Patient ID: " + saved.getPatient().getId() + " in " + saved.getTheaterRoom(), request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Surgery> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<Surgery> surgOpt = surgeryRepository.findById(id);
        if (surgOpt.isPresent()) {
            Surgery surg = surgOpt.get();
            surg.setStatus(status);
            Surgery updated = surgeryRepository.save(surg);
            auditService.log(requestedBy, "UPDATE_SURGERY_STATUS", role, "Surgery " + updated.getSurgeryCode() + " status updated to: " + status, request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
