package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String timestamp; // YYYY-MM-DD HH:mm:ss

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String action; // e.g., ACCESS_PATIENT_RECORD, CREATE_INVOICE, PROCESS_CLAIM, DISPENSE_DRUG

    @Column(nullable = false)
    private String role; // e.g., DOCTOR, PHARMACIST, SUPER_ADMIN

    @Column(length = 1000)
    private String details; // Descriptive details of the action

    private String ipAddress;

    // Constructors
    public AuditLog() {
    }

    public AuditLog(String timestamp, String username, String action, String role, String details, String ipAddress) {
        this.timestamp = timestamp;
        this.username = username;
        this.action = action;
        this.role = role;
        this.details = details;
        this.ipAddress = ipAddress;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
