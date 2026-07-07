package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String patientId; // P-1001, etc.

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String dateOfBirth;

    @Column(nullable = false)
    private String phoneNumber;

    private String email;
    private String address;

    private String emergencyContactName;
    private String emergencyContactPhone;

    private String bloodGroup;
    
    @Column(length = 1000)
    private String allergies; // Comma-separated or JSON list
    
    @Column(length = 1000)
    private String chronicDiseases;
    
    @Column(length = 1000)
    private String familyHistory;
    
    @Column(length = 1000)
    private String vaccinationHistory;

    private double healthScore = 100.0; // 0 to 100
    private String riskLevel = "LOW"; // LOW, MEDIUM, HIGH, CRITICAL
    private boolean isVip = false;
    private boolean pregnancyTracking = false;
    private boolean seniorCitizenCare = false;
    private String childGrowthPercentile; // e.g. "90th percentile"

    // Default constructor
    public Patient() {
    }

    public Patient(String patientId, String firstName, String lastName, String gender, String dateOfBirth, 
                   String phoneNumber, String email, String address, String emergencyContactName, 
                   String emergencyContactPhone, String bloodGroup, String allergies, String chronicDiseases, 
                   String familyHistory, String vaccinationHistory, double healthScore, String riskLevel, 
                   boolean isVip, boolean pregnancyTracking, boolean seniorCitizenCare, String childGrowthPercentile) {
        this.patientId = patientId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.address = address;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.bloodGroup = bloodGroup;
        this.allergies = allergies;
        this.chronicDiseases = chronicDiseases;
        this.familyHistory = familyHistory;
        this.vaccinationHistory = vaccinationHistory;
        this.healthScore = healthScore;
        this.riskLevel = riskLevel;
        this.isVip = isVip;
        this.pregnancyTracking = pregnancyTracking;
        this.seniorCitizenCare = seniorCitizenCare;
        this.childGrowthPercentile = childGrowthPercentile;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getChronicDiseases() {
        return chronicDiseases;
    }

    public void setChronicDiseases(String chronicDiseases) {
        this.chronicDiseases = chronicDiseases;
    }

    public String getFamilyHistory() {
        return familyHistory;
    }

    public void setFamilyHistory(String familyHistory) {
        this.familyHistory = familyHistory;
    }

    public String getVaccinationHistory() {
        return vaccinationHistory;
    }

    public void setVaccinationHistory(String vaccinationHistory) {
        this.vaccinationHistory = vaccinationHistory;
    }

    public double getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(double healthScore) {
        this.healthScore = healthScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public boolean isVip() {
        return isVip;
    }

    public void setVip(boolean vip) {
        isVip = vip;
    }

    public boolean isPregnancyTracking() {
        return pregnancyTracking;
    }

    public void setPregnancyTracking(boolean pregnancyTracking) {
        this.pregnancyTracking = pregnancyTracking;
    }

    public boolean isSeniorCitizenCare() {
        return seniorCitizenCare;
    }

    public void setSeniorCitizenCare(boolean seniorCitizenCare) {
        this.seniorCitizenCare = seniorCitizenCare;
    }

    public String getChildGrowthPercentile() {
        return childGrowthPercentile;
    }

    public void setChildGrowthPercentile(String childGrowthPercentile) {
        this.childGrowthPercentile = childGrowthPercentile;
    }
}
