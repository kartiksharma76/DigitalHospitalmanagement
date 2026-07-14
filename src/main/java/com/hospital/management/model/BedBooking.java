package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bed_bookings")
public class BedBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String patientUsername;

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private String roomType; // General Ward, Semi Private, Private Room, Deluxe Room, ICU, NICU

    private String roomNumber;

    @Column(nullable = false)
    private String bookingDate; // YYYY-MM-DD

    @Column(nullable = false)
    private String status = "Active"; // Active, Discharged

    private double pricePerDay;
    private int days = 1;
    private double totalAmount;

    // Constructors
    public BedBooking() {
    }

    public BedBooking(String patientUsername, String patientName, String roomType, String roomNumber, 
                      String bookingDate, double pricePerDay, int days, double totalAmount) {
        this.patientUsername = patientUsername;
        this.patientName = patientName;
        this.roomType = roomType;
        this.roomNumber = roomNumber;
        this.bookingDate = bookingDate;
        this.pricePerDay = pricePerDay;
        this.days = days;
        this.totalAmount = totalAmount;
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

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(double pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
