package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(nullable = false)
    private String recordDate; // YYYY-MM-DD

    @Column(length = 1000)
    private String symptoms;

    private String vitals; // e.g. "BP: 120/80, Temp: 98.6 F, HR: 72 bpm, SpO2: 98%"

    private String diagnosis;

    @Column(length = 2000)
    private String treatmentPlan;

    @Column(length = 2000)
    private String prescriptions; // JSON or newline separated

    private String labTestsRecommended;
    private String radiologyTestsRecommended;

    @Column(length = 2000)
    private String aiAnalysisSummary; // Automated AI summary for reports

    private String doctorDigitalSignature; // e.g., "Digitally Signed by Dr. Smith [MD1293]"

    // Constructors
    public MedicalRecord() {
    }

    public MedicalRecord(Patient patient, Doctor doctor, String recordDate, String symptoms, String vitals, 
                         String diagnosis, String treatmentPlan, String prescriptions, String labTestsRecommended, 
                         String radiologyTestsRecommended, String aiAnalysisSummary, String doctorDigitalSignature) {
        this.patient = patient;
        this.doctor = doctor;
        this.recordDate = recordDate;
        this.symptoms = symptoms;
        this.vitals = vitals;
        this.diagnosis = diagnosis;
        this.treatmentPlan = treatmentPlan;
        this.prescriptions = prescriptions;
        this.labTestsRecommended = labTestsRecommended;
        this.radiologyTestsRecommended = radiologyTestsRecommended;
        this.aiAnalysisSummary = aiAnalysisSummary;
        this.doctorDigitalSignature = doctorDigitalSignature;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(String recordDate) {
        this.recordDate = recordDate;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getVitals() {
        return vitals;
    }

    public void setVitals(String vitals) {
        this.vitals = vitals;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }

    public String getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(String prescriptions) {
        this.prescriptions = prescriptions;
    }

    public String getLabTestsRecommended() {
        return labTestsRecommended;
    }

    public void setLabTestsRecommended(String labTestsRecommended) {
        this.labTestsRecommended = labTestsRecommended;
    }

    public String getRadiologyTestsRecommended() {
        return radiologyTestsRecommended;
    }

    public void setRadiologyTestsRecommended(String radiologyTestsRecommended) {
        this.radiologyTestsRecommended = radiologyTestsRecommended;
    }

    public String getAiAnalysisSummary() {
        return aiAnalysisSummary;
    }

    public void setAiAnalysisSummary(String aiAnalysisSummary) {
        this.aiAnalysisSummary = aiAnalysisSummary;
    }

    public String getDoctorDigitalSignature() {
        return doctorDigitalSignature;
    }

    public void setDoctorDigitalSignature(String doctorDigitalSignature) {
        this.doctorDigitalSignature = doctorDigitalSignature;
    }
}
