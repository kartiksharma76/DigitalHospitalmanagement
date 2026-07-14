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

    @Autowired
    private BedBookingRepository bedBookingRepository;

    @Autowired
    private MedicineOrderRepository medicineOrderRepository;

    @Autowired
    private NurseRepository nurseRepository;

    @Override
    public void run(String... args) throws Exception {
        seedAdditionalDataIfEmpty();

        if (userRepository.findByUsername("admin").isPresent()) {
            System.out.println("DatabaseSeeder: 'admin' user already exists. Skipping database seeding.");
            return;
        }

        System.out.println("DatabaseSeeder: Default 'admin' user not found. Reseeding all database tables...");
        
        try {
            // Delete all records to start fresh and avoid foreign key conflicts
            auditLogRepository.deleteAll();
            surgeryRepository.deleteAll();
            medicalRecordRepository.deleteAll();
            billingRepository.deleteAll();
            appointmentRepository.deleteAll();
            patientRepository.deleteAll();
            doctorRepository.deleteAll();
            userRepository.deleteAll();
            inventoryItemRepository.deleteAll();
            ambulanceRepository.deleteAll();
            bloodDonorRepository.deleteAll();
        } catch (Exception e) {
            System.out.println("DatabaseSeeder Warning: Error clearing tables, will try seeding anyway: " + e.getMessage());
        }

        System.out.println("Seeding database with default records...");

        // 1. Seed Users (passwords plain for simplicity/debugging)
        User admin = new User("admin", "admin123", "Super Admin", "admin@hospital.com", "SUPER_ADMIN", true);
        User doc1 = new User("dr_smith", "doc123", "Dr. Sarah Smith", "smith@hospital.com", "DOCTOR", true);
        User nurse1 = new User("nurse_jane", "nurse123", "Nurse Jane Doe", "jane@hospital.com", "NURSE", true);
        User recep1 = new User("recep_alice", "recep123", "Receptionist Alice", "alice@hospital.com", "RECEPTIONIST", true);
        User pharm1 = new User("pharm_bob", "pharm123", "Pharmacist Bob", "bob@hospital.com", "PHARMACIST", true);
        User patientUser = new User("robert", "patient123", "Robert Chen", "robert.chen@gmail.com", "PATIENT", true);

        userRepository.save(admin);
        userRepository.save(doc1);
        userRepository.save(nurse1);
        userRepository.save(recep1);
        userRepository.save(pharm1);
        userRepository.save(patientUser);

        // 2. Seed Doctors
        Doctor d1 = new Doctor("D-2001", "Sarah", "Smith", "Cardiology", "MD, FACC", 15, "Cardiology", 150.00, "Mon-Fri: 09:00 - 17:00", "Morning: 09:00 - 13:00", true);
        Doctor d2 = new Doctor("D-2002", "Alex", "Vance", "Pediatrics", "MD, FAAP", 12, "Pediatrics", 120.00, "Mon-Fri: 10:00 - 18:00", "Evening: 14:00 - 18:00", true);
        Doctor d3 = new Doctor("D-2003", "John", "Watson", "General Medicine", "MBBS, MRCP", 20, "Outpatient Clinic", 80.00, "Mon-Sat: 08:00 - 16:00", "Morning: 08:00 - 12:00", true);

        doctorRepository.save(d1);
        doctorRepository.save(d2);
        doctorRepository.save(d3);

        // 3. Seed Patients
        Patient p1 = new Patient("P-1001", "Robert", "Chen", "Male", "1978-05-12", "555-0199", "robert.chen@gmail.com", "123 Cherry St, NY", "Linda Chen", "555-0198", "A+", "Penicillin", "Hypertension", "Father had coronary disease", "HepB, MMR, Influenza", 82.5, "MEDIUM", false, false, false, "N/A");
        p1.setUsername("robert");
        p1.setAadhaarNumber("123456789012");
        p1.setAge(48);
        p1.setHeight(175.0);
        p1.setWeight(82.5);
        p1.setEmergencyRelation("Spouse");
        p1.setInsuranceCompany("HealthCare Corp");
        p1.setInsurancePolicyNumber("POL-998877");
        p1.setInsuranceValidTill("2028-12-31");

        Patient p2 = new Patient("P-1002", "Emily", "Watson", "Female", "2019-11-23", "555-0245", "emily@gmail.com", "456 Oak Ave, NJ", "Marc Watson", "555-0240", "O-", "Peanuts", "None", "None", "BCG, DTaP, Polio", 98.0, "LOW", false, false, false, "85th Percentile");
        p2.setAge(6);
        p2.setHeight(110.0);
        p2.setWeight(19.0);
        p2.setEmergencyRelation("Father");

        Patient p3 = new Patient("P-1003", "Elena", "Rostova", "Female", "1994-08-30", "555-0876", "elena.r@yahoo.com", "789 Pine Rd, NY", "Viktor Rostov", "555-0870", "B+", "Sulfonamides", "Asthma", "Mother has diabetes", "Flu, COVID-19 booster", 70.0, "HIGH", true, true, false, "N/A");
        p3.setAge(31);
        p3.setHeight(168.0);
        p3.setWeight(70.0);
        p3.setEmergencyRelation("Brother");

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
        inventoryItemRepository.save(new InventoryItem("MED-5001", "Lisinopril 10mg", "Tablets", 500, 100, 0.45, "2028-09-12", "PharmaCorp Inc", "Cabinet A"));
        inventoryItemRepository.save(new InventoryItem("MED-5002", "Paracetamol 500mg", "Tablets", 800, 200, 0.10, "2029-01-01", "PharmaCorp Inc", "Cabinet A"));
        inventoryItemRepository.save(new InventoryItem("MED-5003", "Ibuprofen 400mg", "Tablets", 600, 150, 0.15, "2028-11-15", "Global Pharma", "Cabinet A"));
        inventoryItemRepository.save(new InventoryItem("MED-5004", "Amoxicillin 500mg", "Capsules", 80, 100, 0.65, "2027-04-15", "BioLabs Supply", "Cabinet B"));
        inventoryItemRepository.save(new InventoryItem("MED-5005", "Omeprazole 20mg", "Capsules", 400, 100, 0.35, "2028-10-10", "BioLabs Supply", "Cabinet B"));
        inventoryItemRepository.save(new InventoryItem("MED-5006", "Cough Syrup 100ml", "Syrups", 150, 40, 2.50, "2027-09-30", "Apex Med", "Cabinet C"));
        inventoryItemRepository.save(new InventoryItem("MED-5007", "Insulin Glargine", "Injections", 120, 30, 25.00, "2027-06-20", "LifeSciences Ltd", "Cold Storage"));
        inventoryItemRepository.save(new InventoryItem("MED-5008", "Hydrocortisone Cream 1%", "Creams", 200, 50, 4.50, "2028-03-12", "DermaMed", "Cabinet D"));
        inventoryItemRepository.save(new InventoryItem("MED-5009", "Tears Naturale Eye Drops", "Eye Drops", 180, 50, 3.20, "2027-11-30", "Ocular Care", "Cabinet E"));
        inventoryItemRepository.save(new InventoryItem("MED-5010", "Otopain Ear Drops", "Ear Drops", 100, 20, 5.00, "2027-12-15", "Ocular Care", "Cabinet E"));
        
        // Medical Equipment
        inventoryItemRepository.save(new InventoryItem("EQ-7001", "BP Machine", "Medical Equipment", 50, 10, 35.00, "2032-01-01", "MedTech Devices", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7002", "Glucometer", "Medical Equipment", 75, 15, 20.00, "2032-01-01", "MedTech Devices", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7003", "Walker", "Medical Equipment", 25, 5, 45.00, "N/A", "Surgical Supplies", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7004", "Wheelchair", "Medical Equipment", 15, 3, 120.00, "N/A", "Surgical Supplies", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7005", "Crutches", "Medical Equipment", 40, 8, 25.00, "N/A", "Surgical Supplies", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7006", "Neck Belt", "Medical Equipment", 60, 10, 12.00, "N/A", "OrthoCare", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7007", "Knee Cap", "Medical Equipment", 100, 20, 8.00, "N/A", "OrthoCare", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("EQ-7008", "Oxygen Mask", "Medical Equipment", 120, 25, 6.50, "2030-01-01", "Oxygen Systems", "Warehouse"));

        // Hospital Supplies
        inventoryItemRepository.save(new InventoryItem("SUP-8001", "Face Mask (Box of 50)", "Hospital Supplies", 300, 50, 8.00, "2031-01-01", "Main Distributors", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("SUP-8002", "Gloves (Box of 100)", "Hospital Supplies", 250, 40, 10.00, "2031-01-01", "Main Distributors", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("SUP-8003", "Sanitizer 500ml", "Hospital Supplies", 180, 30, 4.00, "2029-01-01", "CleanSafe", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("SUP-8004", "Cotton Roll 500g", "Hospital Supplies", 150, 25, 3.50, "N/A", "Main Distributors", "Warehouse"));
        inventoryItemRepository.save(new InventoryItem("SUP-8005", "Surgical Tape", "Hospital Supplies", 200, 30, 1.50, "N/A", "Main Distributors", "Warehouse"));

        // Health Packages
        inventoryItemRepository.save(new InventoryItem("PKG-9001", "Full Body Checkup Package", "Packages", 1000, 100, 99.00, "N/A", "HMS Labs", "Services"));
        inventoryItemRepository.save(new InventoryItem("PKG-9002", "Diabetes Care Package", "Packages", 1000, 100, 49.00, "N/A", "HMS Labs", "Services"));
        inventoryItemRepository.save(new InventoryItem("PKG-9003", "Heart Evaluation Package", "Packages", 1000, 100, 149.00, "N/A", "HMS Labs", "Services"));
        inventoryItemRepository.save(new InventoryItem("PKG-9004", "Senior Citizen Package", "Packages", 1000, 100, 79.00, "N/A", "HMS Labs", "Services"));
        inventoryItemRepository.save(new InventoryItem("PKG-9005", "Women's Health Package", "Packages", 1000, 100, 89.00, "N/A", "HMS Labs", "Services"));

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

    private void seedAdditionalDataIfEmpty() {
        if (medicineOrderRepository.count() == 0) {
            System.out.println("Seeding mock Medicine Orders...");
            medicineOrderRepository.save(new MedicineOrder("robert", "2026-07-10", "Paracetamol 500mg (x5), Lisinopril 10mg (x2)", 5.90, "Pending", "UPI", "123 Cherry St, NY"));
            medicineOrderRepository.save(new MedicineOrder("robert", "2026-07-12", "Ibuprofen 400mg (x3), Cough Syrup 100ml (x1)", 2.95, "Dispatched", "Cash", "123 Cherry St, NY"));
            medicineOrderRepository.save(new MedicineOrder("robert", "2026-07-14", "Insulin Glargine (x1), Tears Naturale Eye Drops (x2)", 31.40, "Delivered", "Card", "123 Cherry St, NY"));
        }
        if (bedBookingRepository.count() == 0) {
            System.out.println("Seeding mock Bed Bookings...");
            bedBookingRepository.save(new BedBooking("robert", "Robert Chen", "Deluxe Room", "D-402", "2026-07-14", 250.00, 3, 750.00));
            
            BedBooking closedBooking = new BedBooking("robert", "Robert Chen", "General Ward", "G-102", "2026-07-01", 20.00, 5, 100.00);
            closedBooking.setStatus("Discharged");
            bedBookingRepository.save(closedBooking);
        }
        if (nurseRepository.count() == 0) {
            System.out.println("Seeding mock Nurses...");
            nurseRepository.save(new Nurse("N-3001", "Jane", "Doe", "General Ward", "Mon-Fri: 07:00 - 15:00", "Morning: 07:00 - 15:00", true));
            nurseRepository.save(new Nurse("N-3002", "Carol", "Danvers", "ICU", "Mon-Sat: 15:00 - 23:00", "Evening: 15:00 - 23:00", true));
        }
    }
}
