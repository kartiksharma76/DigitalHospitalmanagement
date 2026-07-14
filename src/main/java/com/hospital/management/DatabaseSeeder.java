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

        // Ensure inventory items have images/descriptions even if main seeding is skipped
        if (inventoryItemRepository.count() > 0) {
            java.util.Optional<InventoryItem> testItem = inventoryItemRepository.findAll().stream()
                    .filter(i -> i.getItemCode().equals("MED-5001"))
                    .findFirst();
            if (testItem.isPresent() && testItem.get().getImageUrl() == null) {
                System.out.println("DatabaseSeeder: Re-seeding inventory to populate images and descriptions...");
                inventoryItemRepository.deleteAll();
                seedAllInventoryItems();
            }
        } else {
            System.out.println("DatabaseSeeder: Seeding empty inventory items...");
            seedAllInventoryItems();
        }

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
        seedAllInventoryItems();

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

    private void seedAllInventoryItems() {
        inventoryItemRepository.save(new InventoryItem("MED-5001", "Lisinopril 10mg", "Tablets", 500, 100, 0.45, "2028-09-12", "PharmaCorp Inc", "Cabinet A", 
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400", 
                "Lisinopril is an ACE (angiotensin-converting enzyme) inhibitor. It is clinically indicated to treat hypertension (high blood pressure) in adults and children. Lowering high blood pressure helps prevent strokes, heart attacks, and severe kidney problems. Active components inhibit angiotensin conversion, allowing vessels to dilate. Take once daily or as prescribed. Warning: Do not use during pregnancy."));

        inventoryItemRepository.save(new InventoryItem("MED-5002", "Paracetamol 500mg", "Tablets", 800, 200, 0.10, "2029-01-01", "PharmaCorp Inc", "Cabinet A", 
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400", 
                "Paracetamol is a widely used over-the-counter analgesic (pain reliever) and antipyretic (fever reducer). It is clinically indicated for the relief of mild to moderate aches, headaches, muscle pains, and reducing high body temperatures. It has minimal anti-inflammatory properties and is gentle on the stomach lining compared to NSAIDs. Dosage: 1-2 tablets every 4-6 hours. Max 8 tablets daily. Warning: Avoid alcohol to prevent liver toxicity."));

        inventoryItemRepository.save(new InventoryItem("MED-5003", "Ibuprofen 400mg", "Tablets", 600, 150, 0.15, "2028-11-15", "Global Pharma", "Cabinet A", 
                "https://images.unsplash.com/photo-1607619275066-47e87c0a5542?w=400", 
                "Ibuprofen is a Nonsteroidal Anti-inflammatory Drug (NSAID). It works by reducing hormones that cause pain and inflammation in the body. Commonly used for arthritis, back pain, dental pain, menstrual cramps, and minor sports injuries. Active chemicals block COX enzymes to lower prostaglandins production. Take with food or milk to minimize gastrointestinal discomfort. Max daily dosage: 3200mg."));

        inventoryItemRepository.save(new InventoryItem("MED-5004", "Amoxicillin 500mg", "Capsules", 80, 100, 0.65, "2027-04-15", "BioLabs Supply", "Cabinet B", 
                "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400", 
                "Amoxicillin is a penicillin-type antibiotic used to treat a wide variety of bacterial infections, such as middle ear infections, strep throat, pneumonia, skin infections, and urinary tract infections. It acts by preventing bacterial cell wall synthesis. Complete the full prescribed course of this medication even if symptoms disappear early to prevent antibiotic resistance. Caution: Contraindicated in patients with penicillin allergy."));

        inventoryItemRepository.save(new InventoryItem("MED-5005", "Omeprazole 20mg", "Capsules", 400, 100, 0.35, "2028-10-10", "BioLabs Supply", "Cabinet B", 
                "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400", 
                "Omeprazole is a proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach. It is used to treat symptoms of gastroesophageal reflux disease (GERD), stomach ulcers, erosive esophagitis, and Zollinger-Ellison syndrome. Take on an empty stomach at least 30-60 minutes before breakfast. Prolonged use may affect magnesium and B12 absorption."));

        inventoryItemRepository.save(new InventoryItem("MED-5006", "Cough Syrup 100ml", "Syrups", 150, 40, 2.50, "2027-09-30", "Apex Med", "Cabinet C", 
                "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400", 
                "Formulated to relieve chest congestion, dry coughs, and throat irritation. Contains active antitussives and expectorants (Guaifenesin, Dextromethorphan) to help loosen phlegm and soothe airways for easier breathing. Dosage: 10ml every 4 hours. Do not exceed 60ml per day. May cause light drowsiness; avoid operating heavy machinery."));

        inventoryItemRepository.save(new InventoryItem("MED-5007", "Insulin Glargine", "Injections", 120, 30, 25.00, "2027-06-20", "LifeSciences Ltd", "Cold Storage", 
                "https://images.unsplash.com/photo-1579152638863-c4df4e2a3a40?w=400", 
                "Insulin Glargine is a long-acting, recombinant human insulin analog indicated to improve glycemic control in adults and pediatric patients with Type 1 or Type 2 diabetes mellitus. It provides a constant, basal level of insulin over 24 hours. Administer subcutaneously once daily at the same time. Do not dilute, mix with other insulins, or administer intravenously. Store unopened vials in refrigerator."));

        inventoryItemRepository.save(new InventoryItem("MED-5008", "Hydrocortisone Cream 1%", "Creams", 200, 50, 4.50, "2028-03-12", "DermaMed", "Cabinet D", 
                "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400", 
                "A mild topical corticosteroid used to reduce skin swelling, itchiness, redness, and inflammation associated with eczema, insect bites, poison ivy, or contact dermatitis. Apply a thin layer to the affected area 2-3 times daily. Do not apply to open wounds, infected skin, or use on the face for extended periods unless directed."));

        inventoryItemRepository.save(new InventoryItem("MED-5009", "Tears Naturale Eye Drops", "Eye Drops", 180, 50, 3.20, "2027-11-30", "Ocular Care", "Cabinet E", 
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400", 
                "Sterile lubricant eye drops designed to provide temporary relief from burning and irritation due to dryness of the eye or exposure to wind and sun. Instill 1 or 2 drops in the affected eye(s) as needed. Discard bottle 30 days after opening to prevent microbial contamination."));

        inventoryItemRepository.save(new InventoryItem("MED-5010", "Otopain Ear Drops", "Ear Drops", 100, 20, 5.00, "2027-12-15", "Ocular Care", "Cabinet E", 
                "https://images.unsplash.com/photo-1585438701332-ab9efd53c6ba?w=400", 
                "Antibacterial and analgesic ear drops indicated for the treatment of acute otitis externa and inflammation of the outer ear canal. Clean and dry the ear canal before application. Instill 3-4 drops into the affected ear 2-3 times daily. Avoid contact with eyes."));

        // Medical Equipment
        inventoryItemRepository.save(new InventoryItem("EQ-7001", "BP Machine", "Medical Equipment", 50, 10, 35.00, "2032-01-01", "MedTech Devices", "Warehouse", 
                "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400", 
                "Digital upper arm blood pressure monitor. Features automatic inflation, irregular heartbeat detection, dual-user memory logs (90 readings each), and an easy-to-read backlit LCD display. Comes with an adjustable medium-to-large cuff (22-42 cm). Runs on batteries or micro-USB."));

        inventoryItemRepository.save(new InventoryItem("EQ-7002", "Glucometer", "Medical Equipment", 75, 15, 20.00, "2032-01-01", "MedTech Devices", "Warehouse", 
                "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400", 
                "Compact blood glucose monitoring system. Delivers accurate blood sugar readings within 5 seconds using a tiny 0.6 microliter blood sample. Features pre-meal and post-meal markers, testing reminders, and USB data transfer capabilities. Kit includes 50 test strips, 50 lancets, and a lancing device."));

        inventoryItemRepository.save(new InventoryItem("EQ-7003", "Walker", "Medical Equipment", 25, 5, 45.00, "N/A", "Surgical Supplies", "Warehouse", 
                "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400", 
                "Lightweight aluminum folding mobility walker with dual-trigger release mechanism. Features adjustable height controls (32-39 inches) and slip-resistant rubber tips. Folds flat for compact storage. Designed to provide support and stability for post-surgical orthopedic rehabilitation. Capacity: 300 lbs."));

        inventoryItemRepository.save(new InventoryItem("EQ-7004", "Wheelchair", "Medical Equipment", 15, 3, 120.00, "N/A", "Surgical Supplies", "Warehouse", 
                "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400", 
                "Heavy-duty foldable manual wheelchair with carbon steel frame. Features padded armrests, swing-away footrests, heel loops, and durable solid rubber tires with push-to-lock wheels. Engineered for reliable indoor and outdoor mobility. Upholstery is durable and easy to clean. Weight capacity: 250 lbs."));

        inventoryItemRepository.save(new InventoryItem("EQ-7005", "Crutches", "Medical Equipment", 40, 8, 25.00, "N/A", "Surgical Supplies", "Warehouse", 
                "https://images.unsplash.com/photo-1584515901407-d8f4bc47c2cd?w=400", 
                "Adjustable underarm aluminum crutches with push-button adjustment grids. Comfortable underarm pads and handgrips minimize fatigue. Slip-resistant rubber tips provide excellent traction. Indicated for lower limb rehabilitation or non-weight bearing recovery. Adjusts for heights from 5'2\" to 5'10\"."));

        inventoryItemRepository.save(new InventoryItem("EQ-7006", "Neck Belt", "Medical Equipment", 60, 10, 12.00, "N/A", "OrthoCare", "Warehouse", 
                "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400", 
                "Semi-rigid cervical collar designed to support and immobilize the neck following cervical sprains, minor trauma, whiplash, or post-surgical recovery. Made of high-density foam with a breathable stockinette sleeve and adjustable velcro closure. Anatomically contoured for comfort."));

        inventoryItemRepository.save(new InventoryItem("EQ-7007", "Knee Cap", "Medical Equipment", 100, 20, 8.00, "N/A", "OrthoCare", "Warehouse", 
                "https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=400", 
                "Elastic knee support sleeve providing compression, warmth, and joint stabilization. Indicated for arthritis, mild sprains, or running injuries. Made of four-way stretch fabric that does not bunch up behind the knee. Comfortable for all-day wear."));

        inventoryItemRepository.save(new InventoryItem("EQ-7008", "Oxygen Mask", "Medical Equipment", 120, 25, 6.50, "2030-01-01", "Oxygen Systems", "Warehouse", 
                "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400", 
                "Medium-concentration simple oxygen mask with adjustable nose clip, elastic strap, and 7-foot oxygen supply tubing. Vinyl mask is soft and anatomical. Universal connector fits standard oxygen ports. Latex-free."));

        // Hospital Supplies
        inventoryItemRepository.save(new InventoryItem("SUP-8001", "Face Mask (Box of 50)", "Hospital Supplies", 300, 50, 8.00, "2031-01-01", "Main Distributors", "Warehouse", 
                "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400", 
                "3-ply disposable medical earloop face masks. High filtration efficiency (BFE > 98%) against dust, pollen, droplets, and particulate matter. Features adjustable nose clip and soft elastic loops. Soft, non-woven fabric prevents skin irritation."));

        inventoryItemRepository.save(new InventoryItem("SUP-8002", "Gloves (Box of 100)", "Hospital Supplies", 250, 40, 10.00, "2031-01-01", "Main Distributors", "Warehouse", 
                "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400", 
                "Powder-free medical grade nitrile examination gloves. Ambidextrous, highly elastic, puncture-resistant, and latex-free for sensitive skin. Features textured fingertips for enhanced grip. Ideal for clinic, lab, or cleaning operations."));

        inventoryItemRepository.save(new InventoryItem("SUP-8003", "Sanitizer 500ml", "Hospital Supplies", 180, 30, 4.00, "2029-01-01", "CleanSafe", "Warehouse", 
                "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400", 
                "Instant hand sanitizer gel containing 70% Ethyl Alcohol. Kills 99.9% of common germs. Enriched with Aloe Vera and Glycerin to keep hands moisturized. Dries quickly without leaving a sticky residue."));

        inventoryItemRepository.save(new InventoryItem("SUP-8004", "Cotton Roll 500g", "Hospital Supplies", 150, 25, 3.50, "N/A", "Main Distributors", "Warehouse", 
                "https://images.unsplash.com/photo-1584515901407-d8f4bc47c2cd?w=400", 
                "Highly absorbent 100% pure surgical cotton roll. Chemically inert and bleached to a high standard of purity. Ideal for cleaning wounds, applying antiseptics, absorbing fluids, and padding orthopedic dressings."));

        inventoryItemRepository.save(new InventoryItem("SUP-8005", "Surgical Tape", "Hospital Supplies", 200, 30, 1.50, "N/A", "Main Distributors", "Warehouse", 
                "https://images.unsplash.com/photo-1584515901407-d8f4bc47c2cd?w=400", 
                "Hypoallergenic microporous medical paper tape. Adhesive holds dressings securely in place even on damp skin, leaving minimal residue upon removal. Easy to tear by hand without scissors."));

        // Health Packages
        inventoryItemRepository.save(new InventoryItem("PKG-9001", "Full Body Checkup Package", "Packages", 1000, 100, 99.00, "N/A", "HMS Labs", "Services", 
                "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400", 
                "Comprehensive health screening covering Complete Blood Count (CBC), Kidney Function (Urea, Creatinine), Liver Function (SGOT, SGPT, Bilirubin), Lipid Profile (Cholesterol, HDL, LDL), Thyroid panel, HbA1c, and urine analysis. Includes a dietitian consultation."));

        inventoryItemRepository.save(new InventoryItem("PKG-9002", "Diabetes Care Package", "Packages", 1000, 100, 49.00, "N/A", "HMS Labs", "Services", 
                "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400", 
                "Tailored screening panel for diabetes management: fasting blood sugar, HbA1c, microalbuminuria, lipid profile, renal panel, and specialized consultation with an endocrinologist specialist."));

        inventoryItemRepository.save(new InventoryItem("PKG-9003", "Heart Evaluation Package", "Packages", 1000, 100, 149.00, "N/A", "HMS Labs", "Services", 
                "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=400", 
                "Advanced cardiac assessment including Electrocardiogram (ECG), Lipid Profile, hs-CRP, cardiac risk ratios, echocardiography advisory, and a consultation with a senior cardiologist."));

        inventoryItemRepository.save(new InventoryItem("PKG-9004", "Senior Citizen Package", "Packages", 1000, 100, 79.00, "N/A", "HMS Labs", "Services", 
                "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400", 
                "Geriatric health screening focusing on bone health (Calcium, Vitamin D), renal profiling, blood count, sugar monitoring, uric acid, arthritis indices, and physical health consults."));

        inventoryItemRepository.save(new InventoryItem("PKG-9005", "Women's Health Package", "Packages", 1000, 100, 89.00, "N/A", "HMS Labs", "Services", 
                "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400", 
                "Dedicated checkup for women containing thyroid panel (TSH), CBC, Calcium, Vitamin D3, mammography screening advisory, Pap smear advice, and a gynaecologist consultation."));
    }
}
