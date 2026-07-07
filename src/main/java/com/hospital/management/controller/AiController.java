package com.hospital.management.controller;

import com.hospital.management.service.AiService;
import com.hospital.management.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private AuditService auditService;

    @PostMapping("/symptoms")
    public ResponseEntity<?> checkSymptoms(@RequestBody Map<String, String> body, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        String symptoms = body.get("symptoms");
        if (symptoms == null || symptoms.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Symptoms content is required"));
        }
        
        Map<String, Object> analysis = aiService.checkSymptoms(symptoms);
        auditService.log(requestedBy, "AI_SYMPTOM_CHECK", role, "Requested symptom evaluation for: " + (symptoms.length() > 50 ? symptoms.substring(0, 50) + "..." : symptoms), request.getRemoteAddr());
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/risk-prediction")
    public ResponseEntity<?> predictDiseaseRisk(@RequestBody Map<String, Object> body, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        double bmi = Double.parseDouble(body.getOrDefault("bmi", "22.0").toString());
        String bloodPressure = body.getOrDefault("bloodPressure", "120/80").toString();
        int fastingSugar = Integer.parseInt(body.getOrDefault("fastingSugar", "90").toString());
        int age = Integer.parseInt(body.getOrDefault("age", "30").toString());

        Map<String, Object> prediction = aiService.predictDiseaseRisk(bmi, bloodPressure, fastingSugar, age);
        auditService.log(requestedBy, "AI_RISK_PREDICTION", role, "Requested diagnostic risk check (BMI: " + bmi + ", Age: " + age + ")", request.getRemoteAddr());
        return ResponseEntity.ok(prediction);
    }

    @PostMapping("/drug-interactions")
    public ResponseEntity<?> checkDrugInteractions(@RequestBody Map<String, List<String>> body, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        List<String> medicines = body.get("medicines");
        List<Map<String, String>> warnings = aiService.detectDrugInteractions(medicines);
        
        auditService.log(requestedBy, "AI_DRUG_INTERACTION_CHECK", role, "Checked prescription interactions for: " + (medicines != null ? String.join(", ", medicines) : "none"), request.getRemoteAddr());
        return ResponseEntity.ok(warnings);
    }

    @GetMapping("/suggest-prescriptions")
    public ResponseEntity<?> suggestPrescriptions(@RequestParam String diagnosis, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        List<String> suggestions = aiService.suggestPrescriptions(diagnosis);
        auditService.log(requestedBy, "AI_PRESCRIPTION_SUGGESTION", role, "Suggested medications for diagnosis: " + diagnosis, request.getRemoteAddr());
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/billing-audit")
    public ResponseEntity<?> auditBilling(@RequestBody Map<String, Object> body, @RequestParam String requestedBy, @RequestParam String role, HttpServletRequest request) {
        double consultation = Double.parseDouble(body.getOrDefault("consultationCharges", "0").toString());
        double room = Double.parseDouble(body.getOrDefault("roomCharges", "0").toString());
        double lab = Double.parseDouble(body.getOrDefault("labCharges", "0").toString());
        double pharma = Double.parseDouble(body.getOrDefault("pharmacyCharges", "0").toString());
        String provider = (String) body.get("insuranceProvider");

        Map<String, Object> complianceReport = aiService.auditBillingCharges(consultation, room, lab, pharma, provider);
        auditService.log(requestedBy, "AI_BILLING_COMPLIANCE_AUDIT", role, "Audited charge entries for invoice details", request.getRemoteAddr());
        return ResponseEntity.ok(complianceReport);
    }
}
