package com.hospital.management.controller;

import com.hospital.management.model.User;
import com.hospital.management.repository.UserRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // In a production system, use password encoders like BCrypt. For simplicity, direct check is used here.
            if (user.getPassword().equals(password)) {
                if (!user.isActive()) {
                    return ResponseEntity.status(403).body(Map.of("message", "User account is suspended."));
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
}
