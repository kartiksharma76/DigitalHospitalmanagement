package com.hospital.management.controller;

import com.hospital.management.model.User;
import com.hospital.management.model.Patient;
import com.hospital.management.repository.UserRepository;
import com.hospital.management.repository.PatientRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                if (!user.isActive()) {
                    return ResponseEntity.status(403).body(Map.of("message", "User account is suspended."));
                }
                if ("PENDING".equals(user.getApprovalStatus())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Your registration is pending approval by an Admin or Doctor."));
                }
                if ("REJECTED".equals(user.getApprovalStatus())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Your registration request has been rejected."));
                }
                
                auditService.log(username, "USER_LOGIN", user.getRole(), "User logged in successfully", request.getRemoteAddr());

                Map<String, Object> session = new HashMap<>();
                session.put("username", user.getUsername());
                session.put("fullName", user.getFullName());
                session.put("role", user.getRole());
                session.put("email", user.getEmail());
                session.put("status", "Authenticated");
                
                return ResponseEntity.ok(session);
            }
        }
        
        auditService.log(username != null ? username : "unknown", "FAILED_LOGIN_ATTEMPT", "GUEST", "Incorrect credentials", request.getRemoteAddr());
        return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> sessionData, HttpServletRequest request) {
        String username = sessionData.get("username");
        String role = sessionData.get("role");
        auditService.log(username, "USER_LOGOUT", role, "User logged out", request.getRemoteAddr());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/register-patient")
    public ResponseEntity<?> registerPatient(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String username = (String) payload.get("username");
        String password = (String) payload.get("password");
        String fullName = (String) payload.get("fullName");
        String email = (String) payload.get("email");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken."));
        }

        // Create User (Pending Approval)
        User user = new User(username, password, fullName, email, "PATIENT", true);
        user.setApprovalStatus("PENDING");
        userRepository.save(user);

        // Create corresponding Patient record
        Patient patient = new Patient();
        patient.setUsername(username);
        patient.setEmail(email);
        
        // Parse names
        String[] nameParts = fullName.split(" ", 2);
        patient.setFirstName(nameParts[0]);
        patient.setLastName(nameParts.length > 1 ? nameParts[1] : "");

        patient.setGender((String) payload.get("gender"));
        String dob = (String) payload.get("dateOfBirth");
        patient.setDateOfBirth(dob);
        
        // Calculate Age
        try {
            LocalDate birthDate = LocalDate.parse(dob);
            int age = Period.between(birthDate, LocalDate.now()).getYears();
            patient.setAge(age);
        } catch (Exception e) {
            patient.setAge(0);
        }

        patient.setBloodGroup((String) payload.get("bloodGroup"));
        patient.setPhoneNumber((String) payload.get("phoneNumber"));
        patient.setProfilePhoto((String) payload.get("profilePhoto"));

        // Address
        patient.setAddressHouseNumber((String) payload.get("addressHouseNumber"));
        patient.setAddressStreet((String) payload.get("addressStreet"));
        patient.setAddressCity((String) payload.get("addressCity"));
        patient.setAddressState((String) payload.get("addressState"));
        patient.setAddressPincode((String) payload.get("addressPincode"));
        patient.setAddress(patient.getAddressHouseNumber() + ", " + patient.getAddressStreet() + ", " + 
                            patient.getAddressCity() + ", " + patient.getAddressState() + " - " + patient.getAddressPincode());

        // Emergency Contact
        patient.setEmergencyContactName((String) payload.get("emergencyContactName"));
        patient.setEmergencyRelation((String) payload.get("emergencyRelation"));
        patient.setEmergencyContactPhone((String) payload.get("emergencyContactPhone"));

        // Medical Details
        try {
            patient.setHeight(Double.parseDouble(payload.get("height").toString()));
        } catch (Exception e) {}
        try {
            patient.setWeight(Double.parseDouble(payload.get("weight").toString()));
        } catch (Exception e) {}
        patient.setAllergies((String) payload.get("allergies"));
        patient.setChronicDiseases((String) payload.get("chronicDiseases"));
        patient.setPreviousSurgeries((String) payload.get("previousSurgeries"));
        patient.setCurrentMedications((String) payload.get("currentMedications"));

        // Identity Proof
        patient.setAadhaarNumber((String) payload.get("aadhaarNumber"));
        patient.setPanNumber((String) payload.get("panNumber"));

        // Insurance Details
        patient.setInsuranceCompany((String) payload.get("insuranceCompany"));
        patient.setInsurancePolicyNumber((String) payload.get("insurancePolicyNumber"));
        patient.setInsuranceValidTill((String) payload.get("insuranceValidTill"));

        // Clinical Defaults
        long patientCount = patientRepository.count() + 1001;
        patient.setPatientId("P-" + patientCount);
        patient.setHealthScore(100.0);
        patient.setRiskLevel("LOW");

        patientRepository.save(patient);

        auditService.log(username, "SELF_REGISTER_PATIENT", "PATIENT", "Patient registered pending admin approval: " + patient.getPatientId(), request.getRemoteAddr());

        return ResponseEntity.ok(Map.of("message", "Registration successful. Pending approval by Admin/Doctor."));
    }

    @GetMapping("/pending-registrations")
    public ResponseEntity<?> getPendingRegistrations() {
        List<User> allUsers = userRepository.findAll();
        List<User> pending = new ArrayList<>();
        for (User u : allUsers) {
            if ("PENDING".equals(u.getApprovalStatus())) {
                pending.add(u);
            }
        }
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/approve-patient/{id}")
    public ResponseEntity<?> approvePatient(@PathVariable Long id, @RequestParam String requestedBy, HttpServletRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApprovalStatus("APPROVED");
            userRepository.save(user);
            auditService.log(requestedBy, "APPROVE_PATIENT_REGISTRATION", "ADMIN", "Approved registration for user: " + user.getUsername(), request.getRemoteAddr());
            return ResponseEntity.ok(Map.of("message", "Patient approved successfully."));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/reject-patient/{id}")
    public ResponseEntity<?> rejectPatient(@PathVariable Long id, @RequestParam String requestedBy, HttpServletRequest request) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApprovalStatus("REJECTED");
            userRepository.save(user);
            auditService.log(requestedBy, "REJECT_PATIENT_REGISTRATION", "ADMIN", "Rejected registration for user: " + user.getUsername(), request.getRemoteAddr());
            return ResponseEntity.ok(Map.of("message", "Patient registration rejected."));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String aadhaarNumber = payload.get("aadhaarNumber");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            Optional<Patient> pOpt = patientRepository.findAll().stream()
                    .filter(p -> username.equals(p.getUsername()) && aadhaarNumber.equals(p.getAadhaarNumber()))
                    .findFirst();
            if (pOpt.isPresent()) {
                return ResponseEntity.ok(Map.of("message", "Verification successful. You can reset your password."));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Username and Aadhaar Number do not match our records."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String aadhaarNumber = payload.get("aadhaarNumber");
        String newPassword = payload.get("newPassword");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            Optional<Patient> pOpt = patientRepository.findAll().stream()
                    .filter(p -> username.equals(p.getUsername()) && aadhaarNumber.equals(p.getAadhaarNumber()))
                    .findFirst();
            if (pOpt.isPresent()) {
                User user = userOpt.get();
                user.setPassword(newPassword);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid password reset request."));
    }
}

