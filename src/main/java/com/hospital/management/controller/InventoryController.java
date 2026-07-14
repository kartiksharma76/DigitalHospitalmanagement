package com.hospital.management.controller;

import com.hospital.management.model.InventoryItem;
import com.hospital.management.repository.InventoryItemRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping
    public List<InventoryItem> getAllInventory() {
        return inventoryItemRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<InventoryItem> addInventoryItem(@RequestBody InventoryItem item, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        if (item.getItemCode() == null || item.getItemCode().isEmpty()) {
            long count = inventoryItemRepository.count() + 5001;
            item.setItemCode("INV-" + count);
        }
        
        InventoryItem saved = inventoryItemRepository.save(item);
        auditService.log(requestedBy, "ADD_INVENTORY_ITEM", role, "Added inventory stock item: " + saved.getName() + " [Code: " + saved.getItemCode() + "]", request.getRemoteAddr());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<InventoryItem> updateStock(@PathVariable Long id, @RequestParam int newQuantity, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<InventoryItem> itemOpt = inventoryItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            InventoryItem item = itemOpt.get();
            int oldQuantity = item.getStockQuantity();
            item.setStockQuantity(newQuantity);
            
            InventoryItem updated = inventoryItemRepository.save(item);
            auditService.log(requestedBy, "UPDATE_INVENTORY_STOCK", role, "Adjusted stock for item: " + updated.getName() + " (" + oldQuantity + " -> " + newQuantity + ")", request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable Long id, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<InventoryItem> itemOpt = inventoryItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            InventoryItem item = itemOpt.get();
            inventoryItemRepository.delete(item);
            auditService.log(requestedBy, "DELETE_INVENTORY_ITEM", role, "Deleted inventory item: " + item.getName() + " [Code: " + item.getItemCode() + "]", request.getRemoteAddr());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
