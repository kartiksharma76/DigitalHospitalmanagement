package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String appointmentNumber; // APT-3001, etc.

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(nullable = false)
    private String date; // YYYY-MM-DD

    @Column(nullable = false)
    private String time; // HH:MM

    @Column(nullable = false)
    private String type; // e.g. OPD, Telemedicine, Emergency, Surgery

    @Column(nullable = false)
    private String status = "Scheduled"; // Scheduled, In_Queue, Completed, Rescheduled, Cancelled

    private int tokenNumber;
    private int estimatedWaitMinutes;
    
    @Column(length = 500)
    private String notes;

    // Constructors
    public Appointment() {
    }

    public Appointment(String appointmentNumber, Patient patient, Doctor doctor, String date, String time, 
                       String type, String status, int tokenNumber, int estimatedWaitMinutes, String notes) {
        this.appointmentNumber = appointmentNumber;
        this.patient = patient;
        this.doctor = doctor;
        this.date = date;
        this.time = time;
        this.type = type;
        this.status = status;
        this.tokenNumber = tokenNumber;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAppointmentNumber() {
        return appointmentNumber;
    }

    public void setAppointmentNumber(String appointmentNumber) {
        this.appointmentNumber = appointmentNumber;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(int tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public int getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
