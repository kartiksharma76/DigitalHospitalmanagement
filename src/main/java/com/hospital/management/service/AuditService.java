package com.hospital.management.service;

import com.hospital.management.model.AuditLog;
import com.hospital.management.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /**
     * Inserts an audit log entry in the database.
     */
    public void log(String username, String action, String role, String details, String ipAddress) {
        String timestamp = dateFormat.format(new Date());
        AuditLog log = new AuditLog(timestamp, username, action, role, details, ipAddress);
        auditLogRepository.save(log);
    }

    /**
     * Retrieves the latest 100 system audit logs.
     */
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
