package com.hospital.management.controller;

import com.hospital.management.model.Ambulance;
import com.hospital.management.repository.AmbulanceRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ambulances")
public class AmbulanceController {

    @Autowired
    private AmbulanceRepository ambulanceRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Ambulance> getAllAmbulances() {
        return ambulanceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Ambulance> registerAmbulance(@RequestBody Ambulance ambulance, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (ambulance.getVehicleNumber() == null || ambulance.getVehicleNumber().isEmpty()) {
            long count = ambulanceRepository.count() + 901;
            ambulance.setVehicleNumber("AMB-" + count);
        }
        Ambulance saved = ambulanceRepository.save(ambulance);
        auditService.log(requestedBy, "REGISTER_AMBULANCE", role, "Registered ambulance vehicle: " + saved.getVehicleNumber(), request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ambulance> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<Ambulance> ambOpt = ambulanceRepository.findById(id);
        if (ambOpt.isPresent()) {
            Ambulance amb = ambOpt.get();
            amb.setStatus(status);
            Ambulance updated = ambulanceRepository.save(amb);
            auditService.log(requestedBy, "DISPATCH_AMBULANCE", role, "Ambulance vehicle " + updated.getVehicleNumber() + " status updated to: " + status, request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
