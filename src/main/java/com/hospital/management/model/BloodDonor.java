package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "blood_donors")
public class BloodDonor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String donorName;

    @Column(nullable = false)
    private String bloodGroup; // A+, B+, AB-, O+, etc.

    @Column(nullable = false)
    private String lastDonatedDate; // YYYY-MM-DD

    @Column(nullable = false)
    private String contactPhone;

    private int volumeMl = 450; // default volume donated

    // Constructors
    public BloodDonor() {
    }

    public BloodDonor(String donorName, String bloodGroup, String lastDonatedDate, String contactPhone, int volumeMl) {
        this.donorName = donorName;
        this.bloodGroup = bloodGroup;
        this.lastDonatedDate = lastDonatedDate;
        this.contactPhone = contactPhone;
        this.volumeMl = volumeMl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getLastDonatedDate() {
        return lastDonatedDate;
    }

    public void setLastDonatedDate(String lastDonatedDate) {
        this.lastDonatedDate = lastDonatedDate;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public int getVolumeMl() {
        return volumeMl;
    }

    public void setVolumeMl(int volumeMl) {
        this.volumeMl = volumeMl;
    }
}
