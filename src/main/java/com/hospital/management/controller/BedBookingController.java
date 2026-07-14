package com.hospital.management.controller;

import com.hospital.management.model.BedBooking;
import com.hospital.management.repository.BedBookingRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BedBookingController {

    @Autowired
    private BedBookingRepository bedBookingRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping("/beds")
    public List<BedBooking> getAllBookings() {
        return bedBookingRepository.findAll();
    }

    @GetMapping("/beds/patient/{username}")
    public List<BedBooking> getBookingsByPatient(@PathVariable String username) {
        return bedBookingRepository.findByPatientUsername(username);
    }

    @PostMapping("/bed")
    public ResponseEntity<?> bookBed(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String username = (String) payload.get("patientUsername");
        String patientName = (String) payload.get("patientName");
        String roomType = (String) payload.get("roomType");
        int days = Integer.parseInt(payload.get("days").toString());
        double price = Double.parseDouble(payload.get("pricePerDay").toString());
        double total = price * days;

        // Generate random room number for realism
        String roomNumber = "";
        int num = new Random().nextInt(100) + 101;
        if (roomType.contains("ICU")) roomNumber = "ICU-0" + (new Random().nextInt(8) + 3);
        else if (roomType.contains("NICU")) roomNumber = "NICU-0" + (new Random().nextInt(5) + 1);
        else if (roomType.contains("Deluxe")) roomNumber = "DX-" + num;
        else if (roomType.contains("Private")) roomNumber = "PV-" + num;
        else roomNumber = "GW-Bed-" + (new Random().nextInt(40) + 10);

        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

        BedBooking booking = new BedBooking(username, patientName, roomType, roomNumber, today, price, days, total);
        BedBooking saved = bedBookingRepository.save(booking);

        auditService.log(username, "BOOK_HOSPITAL_BED", "PATIENT", 
                "Booked bed/room: " + saved.getRoomType() + " [Room Number: " + saved.getRoomNumber() + "]", 
                request.getRemoteAddr());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/beds/{id}/status")
    public ResponseEntity<BedBooking> updateBookingStatus(@PathVariable Long id, @RequestParam String status, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<BedBooking> bookingOpt = bedBookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            BedBooking booking = bookingOpt.get();
            booking.setStatus(status);
            BedBooking updated = bedBookingRepository.save(booking);
            auditService.log(requestedBy, "UPDATE_BED_BOOKING_STATUS", role, 
                    "Updated bed booking #" + id + " status to: " + status, 
                    request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
