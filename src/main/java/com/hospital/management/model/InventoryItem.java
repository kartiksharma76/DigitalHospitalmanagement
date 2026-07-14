package com.hospital.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String itemCode; // e.g. MED-5001, EQ-7002

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; // Medicine, Consumable, Equipment, ICU Supply

    private int stockQuantity;
    private int reorderLevel; // Alert if stock drops below this
    private double unitPrice;

    private String expiryDate; // YYYY-MM-DD for medicines

    private String supplierName;
    private String location; // e.g. Pharmacy A, Main Warehouse, ICU Cabinet
    private String imageUrl;
    @Column(length = 2000)
    private String description;

    // Constructors
    public InventoryItem() {
    }

    public InventoryItem(String itemCode, String name, String category, int stockQuantity, 
                         int reorderLevel, double unitPrice, String expiryDate, String supplierName, String location) {
        this(itemCode, name, category, stockQuantity, reorderLevel, unitPrice, expiryDate, supplierName, location, null, null);
    }

    public InventoryItem(String itemCode, String name, String category, int stockQuantity, 
                         int reorderLevel, double unitPrice, String expiryDate, String supplierName, String location,
                         String imageUrl, String description) {
        this.itemCode = itemCode;
        this.name = name;
        this.category = category;
        this.stockQuantity = stockQuantity;
        this.reorderLevel = reorderLevel;
        this.unitPrice = unitPrice;
        this.expiryDate = expiryDate;
        this.supplierName = supplierName;
        this.location = location;
        this.imageUrl = imageUrl;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public int getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(int reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
