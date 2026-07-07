package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "billing_records")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber; // INV-4001, etc.

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(nullable = false)
    private String billingDate; // YYYY-MM-DD

    private double consultationCharges;
    private double roomCharges;
    private double icuCharges;
    private double otCharges;
    private double labCharges;
    private double pharmacyCharges;
    
    private double discount;
    private double tax;
    private double totalAmount;

    private String paymentMethod; // Cash, Card, UPI, NetBanking, Insurance Cashless
    
    @Column(nullable = false)
    private String status = "Unpaid"; // Unpaid, Paid, Claim_Submitted, Claim_Approved, Claim_Rejected

    private String insuranceProvider;
    private String claimNumber;
    private double claimApprovedAmount;

    // Constructors
    public Billing() {
    }

    public Billing(String invoiceNumber, Patient patient, String billingDate, double consultationCharges, 
                   double roomCharges, double icuCharges, double otCharges, double labCharges, 
                   double pharmacyCharges, double discount, double tax, double totalAmount, 
                   String paymentMethod, String status, String insuranceProvider, String claimNumber, 
                   double claimApprovedAmount) {
        this.invoiceNumber = invoiceNumber;
        this.patient = patient;
        this.billingDate = billingDate;
        this.consultationCharges = consultationCharges;
        this.roomCharges = roomCharges;
        this.icuCharges = icuCharges;
        this.otCharges = otCharges;
        this.labCharges = labCharges;
        this.pharmacyCharges = pharmacyCharges;
        this.discount = discount;
        this.tax = tax;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.insuranceProvider = insuranceProvider;
        this.claimNumber = claimNumber;
        this.claimApprovedAmount = claimApprovedAmount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getBillingDate() {
        return billingDate;
    }

    public void setBillingDate(String billingDate) {
        this.billingDate = billingDate;
    }

    public double getConsultationCharges() {
        return consultationCharges;
    }

    public void setConsultationCharges(double consultationCharges) {
        this.consultationCharges = consultationCharges;
    }

    public double getRoomCharges() {
        return roomCharges;
    }

    public void setRoomCharges(double roomCharges) {
        this.roomCharges = roomCharges;
    }

    public double getIcuCharges() {
        return icuCharges;
    }

    public void setIcuCharges(double icuCharges) {
        this.icuCharges = icuCharges;
    }

    public double getOtCharges() {
        return otCharges;
    }

    public void setOtCharges(double otCharges) {
        this.otCharges = otCharges;
    }

    public double getLabCharges() {
        return labCharges;
    }

    public void setLabCharges(double labCharges) {
        this.labCharges = labCharges;
    }

    public double getPharmacyCharges() {
        return pharmacyCharges;
    }

    public void setPharmacyCharges(double pharmacyCharges) {
        this.pharmacyCharges = pharmacyCharges;
    }

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    public double getTax() {
        return tax;
    }

    public void setTax(double tax) {
        this.tax = tax;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public double getClaimApprovedAmount() {
        return claimApprovedAmount;
    }

    public void setClaimApprovedAmount(double claimApprovedAmount) {
        this.claimApprovedAmount = claimApprovedAmount;
    }
}
