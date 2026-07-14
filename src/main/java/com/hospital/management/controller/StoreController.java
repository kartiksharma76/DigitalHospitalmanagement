package com.hospital.management.controller;

import com.hospital.management.model.MedicineOrder;
import com.hospital.management.model.InventoryItem;
import com.hospital.management.repository.MedicineOrderRepository;
import com.hospital.management.repository.InventoryItemRepository;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    @Autowired
    private MedicineOrderRepository medicineOrderRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private AuditService auditService;

    @GetMapping("/orders")
    public List<MedicineOrder> getAllOrders() {
        return medicineOrderRepository.findAll();
    }

    @GetMapping("/orders/patient/{username}")
    public List<MedicineOrder> getOrdersByPatient(@PathVariable String username) {
        return medicineOrderRepository.findByPatientUsername(username);
    }

    @PostMapping("/order")
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> payload, HttpServletRequest request) {
        String username = (String) payload.get("patientUsername");
        String paymentMethod = (String) payload.get("paymentMethod");
        String address = (String) payload.get("deliveryAddress");
        double total = Double.parseDouble(payload.get("totalAmount").toString());
        
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
        
        // Build items description string
        StringBuilder itemsDesc = new StringBuilder();
        for (Map<String, Object> item : itemsList) {
            String name = (String) item.get("name");
            int qty = Integer.parseInt(item.get("quantity").toString());
            double price = Double.parseDouble(item.get("price").toString());
            
            if (itemsDesc.length() > 0) {
                itemsDesc.append(", ");
            }
            itemsDesc.append(name).append(" (x").append(qty).append(")");

            // Decrement Stock from Inventory
            Optional<InventoryItem> invOpt = inventoryItemRepository.findAll().stream()
                    .filter(i -> i.getName().equalsIgnoreCase(name))
                    .findFirst();
            if (invOpt.isPresent()) {
                InventoryItem inv = invOpt.get();
                int newQty = Math.max(0, inv.getStockQuantity() - qty);
                inv.setStockQuantity(newQty);
                inventoryItemRepository.save(inv);
            }
        }

        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());

        MedicineOrder order = new MedicineOrder(username, today, itemsDesc.toString(), total, "Pending", paymentMethod, address);
        MedicineOrder saved = medicineOrderRepository.save(order);

        auditService.log(username, "PLACE_MEDICINE_ORDER", "PATIENT", 
                "Placed pharmacy e-commerce order: " + saved.getItems() + " [Total: $" + total + "]", 
                request.getRemoteAddr());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<MedicineOrder> updateOrderStatus(@PathVariable Long id, @RequestParam String status, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        Optional<MedicineOrder> orderOpt = medicineOrderRepository.findById(id);
        if (orderOpt.isPresent()) {
            MedicineOrder order = orderOpt.get();
            order.setStatus(status);
            MedicineOrder updated = medicineOrderRepository.save(order);
            auditService.log(requestedBy, "UPDATE_ORDER_STATUS", role, 
                    "Updated order #" + id + " status to: " + status, 
                    request.getRemoteAddr());
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
