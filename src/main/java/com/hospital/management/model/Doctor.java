package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String doctorId; // D-2001, etc.

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String specialization; // e.g. Cardiology, Pediatrics, General Medicine

    private String qualification; // e.g. MD, MBBS

    private int experienceYears;

    @Column(nullable = false)
    private String department;

    private double consultationFee;

    private String availability; // e.g. "Mon-Fri: 09:00 - 17:00"
    
    private String shiftTimings; // e.g. "Morning: 09:00 - 13:00"

    private boolean active = true;

    // Constructors
    public Doctor() {
    }

    public Doctor(String doctorId, String firstName, String lastName, String specialization, 
                  String qualification, int experienceYears, String department, 
                  double consultationFee, String availability, String shiftTimings, boolean active) {
        this.doctorId = doctorId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.specialization = specialization;
        this.qualification = qualification;
        this.experienceYears = experienceYears;
        this.department = department;
        this.consultationFee = consultationFee;
        this.availability = availability;
        this.shiftTimings = shiftTimings;
        this.active = active;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getShiftTimings() {
        return shiftTimings;
    }

    public void setShiftTimings(String shiftTimings) {
        this.shiftTimings = shiftTimings;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
