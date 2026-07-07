package com.hospital.management.repository;

import com.hospital.management.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByItemCode(String itemCode);
    List<InventoryItem> findByCategory(String category);
}
