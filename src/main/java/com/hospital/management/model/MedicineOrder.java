package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "medicine_orders")
public class MedicineOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String patientUsername;

    @Column(nullable = false)
    private String orderDate; // YYYY-MM-DD

    @Column(length = 2000, nullable = false)
    private String items; // Comma-separated or JSON list of items

    private double totalAmount;

    @Column(nullable = false)
    private String status = "Pending"; // Pending, Dispatched, Delivered

    private String paymentMethod; // UPI, Card, NetBanking, Cash, Insurance

    private String deliveryAddress;

    // Constructors
    public MedicineOrder() {
    }

    public MedicineOrder(String patientUsername, String orderDate, String items, double totalAmount, 
                         String status, String paymentMethod, String deliveryAddress) {
        this.patientUsername = patientUsername;
        this.orderDate = orderDate;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.deliveryAddress = deliveryAddress;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientUsername() {
        return patientUsername;
    }

    public void setPatientUsername(String patientUsername) {
        this.patientUsername = patientUsername;
    }

    public String getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(String orderDate) {
        this.orderDate = orderDate;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }
}
