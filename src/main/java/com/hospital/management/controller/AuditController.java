package com.hospital.management.controller;

import com.hospital.management.model.AuditLog;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/logs")
    public List<AuditLog> getLogs() {
        return auditService.getRecentLogs();
    }
}
