package com.hospital.management.controller;

import com.hospital.management.model.Appointment;
import com.hospital.management.repository.AppointmentRepository;
import com.hospital.management.service.QueueService;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private QueueService queueService;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (appointment.getAppointmentNumber() == null || appointment.getAppointmentNumber().isEmpty()) {
            long count = appointmentRepository.count() + 3001;
            appointment.setAppointmentNumber("APT-" + count);
        }

        // Save scheduled record
        Appointment saved = appointmentRepository.save(appointment);

        // Put in doctor's queue active schedule
        saved = queueService.addToQueue(saved);

        auditService.log(requestedBy, "BOOK_APPOINTMENT", role, "Created appointment: " + saved.getAppointmentNumber() + " with Doctor ID " + saved.getDoctor().getId() + " - Token: " + saved.getTokenNumber(), request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<Appointment> apptOpt = appointmentRepository.findById(id);
        if (apptOpt.isPresent()) {
            Appointment appt = apptOpt.get();
            appt.setStatus(status);
            
            // If completed or cancelled, release token and refresh waiting times
            if ("Completed".equals(status) || "Cancelled".equals(status)) {
                appt.setEstimatedWaitMinutes(0);
            }
            
            Appointment updated = appointmentRepository.save(appt);
            
            // Re-evaluate queues
            queueService.refreshWaitTimes(updated.getDoctor().getId(), updated.getDate());
            
            auditService.log(requestedBy, "UPDATE_APPOINTMENT_STATUS", role, "Updated appointment status to " + status + " for " + updated.getAppointmentNumber(), request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
