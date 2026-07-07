package com.hospital.management.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AiService {

    /**
     * Checks symptoms and provides possible conditions and severity triage levels.
     */
    public Map<String, Object> checkSymptoms(String symptoms) {
        Map<String, Object> result = new HashMap<>();
        String normalized = symptoms.toLowerCase();
        
        List<String> conditions = new ArrayList<>();
        String recommendation = "Consult a general physician.";
        String alertLevel = "Routine";

        if (normalized.contains("chest pain") || normalized.contains("shortness of breath")) {
            conditions.add("Cardiovascular emergency (e.g. Myocardial Infarction)");
            conditions.add("Pulmonary Embolism");
            recommendation = "EMERGENCY: Proceed to the nearest Emergency Room immediately.";
            alertLevel = "CRITICAL";
        } else if (normalized.contains("fever") && (normalized.contains("cough") || normalized.contains("throat"))) {
            conditions.add("Influenza (Flu)");
            conditions.add("COVID-19");
            conditions.add("Acute Bronchitis");
            recommendation = "Schedule an OPD consultation. Keep hydrated and isolate.";
            alertLevel = "MODERATE";
        } else if (normalized.contains("headache") && normalized.contains("vision")) {
            conditions.add("Migraine Aura");
            conditions.add("Severe Hypertension");
            recommendation = "Get vitals (BP) checked. Schedule neurology/general consulting.";
            alertLevel = "MODERATE";
        } else {
            conditions.add("Common Cold");
            conditions.add("Allergic Rhinitis");
            conditions.add("General Fatigue");
            recommendation = "Rest and hydrate. If symptoms persist for >3 days, visit clinic.";
            alertLevel = "LOW";
        }

        result.put("possibleConditions", conditions);
        result.put("recommendation", recommendation);
        result.put("alertLevel", alertLevel);
        result.put("processedAt", new java.util.Date().toString());
        return result;
    }

    /**
     * Predicts disease risk levels based on patient metrics (age, blood pressure, blood sugar, BMI).
     */
    public Map<String, Object> predictDiseaseRisk(double bmi, String bloodPressure, int fastingSugar, int age) {
        Map<String, Object> response = new HashMap<>();
        List<String> riskFactors = new ArrayList<>();
        
        double diabetesRisk = 10.0;
        double cardioRisk = 10.0;

        if (bmi > 30) {
            diabetesRisk += 30;
            cardioRisk += 20;
            riskFactors.add("High BMI (Obesity)");
        }
        if (fastingSugar > 126) {
            diabetesRisk += 50;
            riskFactors.add("Impaired Fasting Glucose (Diabetic range)");
        } else if (fastingSugar > 100) {
            diabetesRisk += 20;
            riskFactors.add("Borderline Glucose levels (Prediabetic)");
        }

        if (bloodPressure != null && (bloodPressure.contains("/") || bloodPressure.contains("-"))) {
            try {
                String[] parts = bloodPressure.split("[/-]");
                int systolic = Integer.parseInt(parts[0].trim());
                if (systolic > 140) {
                    cardioRisk += 40;
                    riskFactors.add("Stage 1/2 Hypertension");
                } else if (systolic > 120) {
                    cardioRisk += 15;
                    riskFactors.add("Prehypertension");
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        if (age > 60) {
            cardioRisk += 15;
            diabetesRisk += 10;
            riskFactors.add("Age above 60");
        }

        response.put("diabetesRiskScore", Math.min(diabetesRisk, 100.0));
        response.put("cardiovascularRiskScore", Math.min(cardioRisk, 100.0));
        response.put("detectedRiskFactors", riskFactors);
        response.put("summary", "AI engine recommends targeted lifestyle modifications, regular glucose monitoring, and annual cardiac evaluations.");
        return response;
    }

    /**
     * Analyzes drug interactions based on active list of prescribed medicines.
     */
    public List<Map<String, String>> detectDrugInteractions(List<String> medicines) {
        List<Map<String, String>> warnings = new ArrayList<>();
        if (medicines == null || medicines.size() < 2) {
            return warnings;
        }

        boolean hasIbuprofen = false;
        boolean hasAspirin = false;
        boolean hasWarfarin = false;

        for (String m : medicines) {
            String lm = m.toLowerCase();
            if (lm.contains("ibuprofen") || lm.contains("advil") || lm.contains("motrin")) hasIbuprofen = true;
            if (lm.contains("aspirin") || lm.contains("ecotrin")) hasAspirin = true;
            if (lm.contains("warfarin") || lm.contains("coumadin")) hasWarfarin = true;
        }

        if (hasIbuprofen && hasAspirin) {
            Map<String, String> warn = new HashMap<>();
            warn.put("severity", "MODERATE");
            warn.put("drugs", "Ibuprofen + Aspirin");
            warn.put("effect", "Ibuprofen may decrease the cardioprotective effect of low-dose aspirin. Increased risk of gastrointestinal irritation.");
            warnings.add(warn);
        }

        if (hasWarfarin && (hasAspirin || hasIbuprofen)) {
            Map<String, String> warn = new HashMap<>();
            warn.put("severity", "HIGH");
            warn.put("drugs", "Warfarin + NSAID (Aspirin/Ibuprofen)");
            warn.put("effect", "Concomitant use significantly increases the risk of severe bleeding. Strict coagulation monitoring required.");
            warnings.add(warn);
        }

        return warnings;
    }

    /**
     * AI prescription suggestions based on active diagnoses.
     */
    public List<String> suggestPrescriptions(String diagnosis) {
        List<String> medications = new ArrayList<>();
        String normalized = diagnosis.toLowerCase();

        if (normalized.contains("hypertension")) {
            medications.add("Lisinopril 10mg QD");
            medications.add("Amlodipine 5mg QD");
        } else if (normalized.contains("diabetes") || normalized.contains("hyperglycemia")) {
            medications.add("Metformin 500mg BID (with meals)");
            medications.add("Glipizide 5mg QD");
        } else if (normalized.contains("bronchitis") || normalized.contains("pneumonia")) {
            medications.add("Amoxicillin-Clavulanate 875mg BID x 7 days");
            medications.add("Albuterol Inhaler (PRN)");
        } else if (normalized.contains("allergy") || normalized.contains("rhinitis")) {
            medications.add("Cetirizine 10mg HS");
            medications.add("Fluticasone Nasal Spray");
        } else {
            medications.add("Multivitamin capsules (Daily)");
            medications.add("Paracetamol 650mg PRN for pain/fever");
        }

        return medications;
    }

    /**
     * AI Smart Billing Auditor and Fraud Detection checks.
     */
    public Map<String, Object> auditBillingCharges(double consultation, double room, double lab, double pharma, String insuranceProvider) {
        Map<String, Object> audit = new HashMap<>();
        boolean alert = false;
        List<String> findings = new ArrayList<>();

        if (consultation > 500.0) {
            alert = true;
            findings.add("Consultation fee exceeds regional network bounds ($500.00).");
        }
        if (room > 2000.0) {
            alert = true;
            findings.add("Daily room charges flagged as anomalous (> $2000.00/day).");
        }
        if (pharma > 1500.0 && (insuranceProvider == null || insuranceProvider.isEmpty())) {
            alert = true;
            findings.add("High self-pay pharmaceutical bill. AI recommends discount-program verification.");
        }

        audit.put("fraudDetected", alert);
        audit.put("findings", findings);
        audit.put("auditStatus", alert ? "Flagged For Auditor Review" : "Passed Automated Compliance");
        return audit;
    }
}
