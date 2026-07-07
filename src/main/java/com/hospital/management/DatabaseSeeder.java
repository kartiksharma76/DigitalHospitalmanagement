package com.hospital.management;

import com.hospital.management.model.*;
import com.hospital.management.repository.*;
import com.hospital.management.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.text.SimpleDateFormat;
import java.util.Date;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private QueueService queueService;

    @Autowired
    private AmbulanceRepository ambulanceRepository;

    @Autowired
    private BloodDonorRepository bloodDonorRepository;

    @Autowired
    private SurgeryRepository surgeryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Already seeded
        }

        System.out.println("Seeding database with default records...");

        // 1. Seed Users (passwords plain for simplicity/debugging)
        User admin = new User("admin", "admin123", "Super Admin", "admin@hospital.com", "SUPER_ADMIN", true);
        User doc1 = new User("dr_smith", "doc123", "Dr. Sarah Smith", "smith@hospital.com", "DOCTOR", true);
        User nurse1 = new User("nurse_jane", "nurse123", "Nurse Jane Doe", "jane@hospital.com", "NURSE", true);
        User recep1 = new User("recep_alice", "recep123", "Receptionist Alice", "alice@hospital.com", "RECEPTIONIST", true);
        User pharm1 = new User("pharm_bob", "pharm123", "Pharmacist Bob", "bob@hospital.com", "PHARMACIST", true);

        userRepository.save(admin);
        userRepository.save(doc1);
        userRepository.save(nurse1);
        userRepository.save(recep1);
        userRepository.save(pharm1);

        // 2. Seed Doctors
        Doctor d1 = new Doctor("D-2001", "Sarah", "Smith", "Cardiology", "MD, FACC", 15, "Cardiology", 150.00, "Mon-Fri: 09:00 - 17:00", "Morning: 09:00 - 13:00", true);
        Doctor d2 = new Doctor("D-2002", "Alex", "Vance", "Pediatrics", "MD, FAAP", 12, "Pediatrics", 120.00, "Mon-Fri: 10:00 - 18:00", "Evening: 14:00 - 18:00", true);
        Doctor d3 = new Doctor("D-2003", "John", "Watson", "General Medicine", "MBBS, MRCP", 20, "Outpatient Clinic", 80.00, "Mon-Sat: 08:00 - 16:00", "Morning: 08:00 - 12:00", true);

        doctorRepository.save(d1);
        doctorRepository.save(d2);
        doctorRepository.save(d3);

        // 3. Seed Patients
        Patient p1 = new Patient("P-1001", "Robert", "Chen", "Male", "1978-05-12", "555-0199", "robert.chen@gmail.com", "123 Cherry St, NY", "Linda Chen", "555-0198", "A+", "Penicillin", "Hypertension", "Father had coronary disease", "HepB, MMR, Influenza", 82.5, "MEDIUM", false, false, false, "N/A");
        Patient p2 = new Patient("P-1002", "Emily", "Watson", "Female", "2019-11-23", "555-0245", "emily@gmail.com", "456 Oak Ave, NJ", "Marc Watson", "555-0240", "O-", "Peanuts", "None", "None", "BCG, DTaP, Polio", 98.0, "LOW", false, false, false, "85th Percentile");
        Patient p3 = new Patient("P-1003", "Elena", "Rostova", "Female", "1994-08-30", "555-0876", "elena.r@yahoo.com", "789 Pine Rd, NY", "Viktor Rostov", "555-0870", "B+", "Sulfonamides", "Asthma", "Mother has diabetes", "Flu, COVID-19 booster", 70.0, "HIGH", true, true, false, "N/A");

        patientRepository.save(p1);
        patientRepository.save(p2);
        patientRepository.save(p3);

        // 4. Seed Appointments
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        String today = sdf.format(new Date());

        Appointment app1 = new Appointment("APT-3001", p1, d1, today, "09:30", "OPD", "In_Queue", 1, 15, "Regular cardiac assessment and hypertension review.");
        Appointment app2 = new Appointment("APT-3002", p2, d2, today, "11:15", "OPD", "In_Queue", 2, 30, "Child wellness growth percentile checkup.");
        Appointment app3 = new Appointment("APT-3003", p3, d3, today, "12:00", "Telemedicine", "Scheduled", 3, 45, "Follow-up for asthma and prescription refill.");

        appointmentRepository.save(app1);
        appointmentRepository.save(app2);
        appointmentRepository.save(app3);

        // 5. Seed Medical Records (Past Clinical EHR Records)
        MedicalRecord mr1 = new MedicalRecord(p1, d1, "2026-05-10", "Mild chest tightness upon heavy exertion", "BP: 138/85, Temp: 98.2 F, HR: 80 bpm", "Essential Hypertension", "Initiate low-sodium diet and monitor BP daily.", "Lisinopril 10mg QD, Aspirin 81mg QD", "Lipid Panel", "ECG", "AI recommends routine cardiovascular stress test. Risk of CHD is medium.", "Digitally Signed by Dr. Sarah Smith [MD1293]");
        medicalRecordRepository.save(mr1);

        // 6. Seed Billing Records
        Billing b1 = new Billing("INV-4001", p1, today, 150.00, 0.0, 0.0, 0.0, 75.0, 45.0, 10.0, 13.0, 273.0, "Card", "Paid", "", "", 0.0);
        Billing b2 = new Billing("INV-4002", p3, today, 80.0, 350.0, 0.0, 0.0, 0.0, 30.0, 0.0, 23.0, 483.0, "Insurance Cashless", "Claim_Submitted", "BlueShield Health", "CLM-89021", 0.0);
        
        billingRepository.save(b1);
        billingRepository.save(b2);

        // 7. Seed Inventory Items
        InventoryItem item1 = new InventoryItem("MED-5001", "Lisinopril 10mg", "Medicine", 500, 100, 0.45, "2028-09-12", "PharmaCorp Inc", "Pharmacy Cabinet A");
        InventoryItem item2 = new InventoryItem("MED-5002", "Amoxicillin 500mg", "Medicine", 80, 100, 0.65, "2027-04-15", "BioLabs Supply", "Pharmacy Cabinet B"); // Low stock
        InventoryItem item3 = new InventoryItem("EQ-7001", "Disposable Syringes 5ml", "Consumable", 2500, 500, 0.12, "2030-01-01", "MedTech Devices", "Main Warehouse B");
        InventoryItem item4 = new InventoryItem("EQ-7002", "Ventilator Circuit", "ICU Supply", 12, 15, 120.0, "2029-10-30", "AirLife Diagnostics", "ICU Storage Closet"); // Low stock

        inventoryItemRepository.save(item1);
        inventoryItemRepository.save(item2);
        inventoryItemRepository.save(item3);
        inventoryItemRepository.save(item4);

        // 8. Seed Ambulances
        Ambulance amb1 = new Ambulance("AMB-901", "Marcus Cole", "555-0911", "Available", 85.0);
        Ambulance amb2 = new Ambulance("AMB-902", "Delenn Minbari", "555-0922", "Dispatched", 45.0);
        Ambulance amb3 = new Ambulance("AMB-903", "John Sheridan", "555-0933", "Maintenance", 10.0);
        ambulanceRepository.save(amb1);
        ambulanceRepository.save(amb2);
        ambulanceRepository.save(amb3);

        // 9. Seed Blood Bank Donors
        BloodDonor donor1 = new BloodDonor("Alice Vance", "O-", "2026-06-15", "555-7812", 450);
        BloodDonor donor2 = new BloodDonor("Charlie Mercer", "AB+", "2026-05-10", "555-4519", 450);
        BloodDonor donor3 = new BloodDonor("Dana Scully", "B-", "2026-04-20", "555-3211", 500);
        bloodDonorRepository.save(donor1);
        bloodDonorRepository.save(donor2);
        bloodDonorRepository.save(donor3);

        // 10. Seed Surgeries
        Surgery surg1 = new Surgery("SURG-701", p1, d1, today, "OT-01", "General Anesthesia", "Scheduled");
        Surgery surg2 = new Surgery("SURG-702", p3, d1, today, "OT-02", "Local Anesthesia", "In_Progress");
        surgeryRepository.save(surg1);
        surgeryRepository.save(surg2);

        // 11. Seed Audit Log entry
        AuditLog audit1 = new AuditLog("2026-07-02 12:00:00", "system", "DATABASE_INITIALIZATION", "SYSTEM_PROCESS", "Seeded mock schema items and default administrator logins.", "127.0.0.1");
        auditLogRepository.save(audit1);

        System.out.println("Database seeding successfully completed!");
    }
}
