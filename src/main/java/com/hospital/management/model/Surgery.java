package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "surgeries")
public class Surgery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String surgeryCode; // e.g. SURG-701

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "surgeon_id")
    private Doctor surgeon;

    @Column(nullable = false)
    private String date; // YYYY-MM-DD

    @Column(nullable = false)
    private String theaterRoom; // OT-01, OT-02, etc.

    @Column(nullable = false)
    private String anesthesiaType; // General, Local, Epidural

    @Column(nullable = false)
    private String status = "Scheduled"; // Scheduled, In_Progress, Completed, Post_Op_Recovery

    // Constructors
    public Surgery() {
    }

    public Surgery(String surgeryCode, Patient patient, Doctor surgeon, String date, String theaterRoom, String anesthesiaType, String status) {
        this.surgeryCode = surgeryCode;
        this.patient = patient;
        this.surgeon = surgeon;
        this.date = date;
        this.theaterRoom = theaterRoom;
        this.anesthesiaType = anesthesiaType;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSurgeryCode() {
        return surgeryCode;
    }

    public void setSurgeryCode(String surgeryCode) {
        this.surgeryCode = surgeryCode;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getSurgeon() {
        return surgeon;
    }

    public void setSurgeon(Doctor surgeon) {
        this.surgeon = surgeon;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTheaterRoom() {
        return theaterRoom;
    }

    public void setTheaterRoom(String theaterRoom) {
        this.theaterRoom = theaterRoom;
    }

    public String getAnesthesiaType() {
        return anesthesiaType;
    }

    public void setAnesthesiaType(String anesthesiaType) {
        this.anesthesiaType = anesthesiaType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
