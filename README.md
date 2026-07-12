# AURA HMS - Next-Generation Enterprise Hospital Management Platform

AURA HMS is a modern, single-page hospital information system built with a Spring Boot backend and a glassmorphic dark-mode web frontend. The platform supports clinical operations, telemetry systems, billing administration, AI checkups, and dispatch logs.

---

## 🛠️ Tech Stack

* **Backend**: Java 17, Spring Boot, Spring Data JPA, Hibernate, MySQL Database.
* **Frontend**: HTML5 (Semantic Structure), CSS3 (Custom Glassmorphic styles, neon parameters, micro-animations), Javascript (SPA client router, AJAX telemetry queries).
* **Dependencies**: Lombok, MySQL Connector, Spring Web, Spring DevTools, Spring Data JPA.

---

## 🌟 Key Features

1. **Dashboard & Metrics**: Real-time summaries of occupancy rates, revenue statistics, clinician rosters, and active queue counts.
2. **Patient Registry & EHR**: Demographic records, triage assignments, chronic conditions ledger, allergies, vaccinations, and digital clinical timelines.
3. **Appointment Booking & Token Queue**: Dynamic wait-time calculations, token bookings, and status consultation workflows.
4. **ICU & Real-time Telemetry**: Simulation of live patient monitors (Heart Rate, SpO2, Blood Pressure) with flashing threshold alerts.
5. **Telemedicine Console**: Simulated video consultation portal, clinical note taking, and digital EHR prescription creation.
6. **Surgical Suite & OT**: Schedule surgical procedures, assign surgeons/patients, configure theater rooms (OT-01/02/03), and log status.
7. **Ambulance Emergency Dispatch**: Real-time fleet tracking, dynamic fuel bar gauges, GPS coordinates tracker, and dispatch/maintenance controls.
8. **Blood Bank & Roster**: Live volumes tracking across all 8 groups (A+, B+, AB-, etc.), donation history logs, and donor registration.
9. **Staff Directory**: Clinician directory containing degrees, department assignments, shift timings, weekly schedules, and consult fees.
10. **AURA Clinical AI Assistant**: Diagnostic triage analyzer, diabetes/cardio risk indicators, and drug interaction conflict alerts.
11. **Compliance & Audit trail**: Secure HIPAA logging that records every user action, timestamp, action type, and client IP addresses.

---

## 🗝️ Default Login Credentials

The system automatically detects if the admin user is missing and seeds the database with the following demo credentials:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `SUPER_ADMIN` | System administrator with full configurations |
| `dr_smith` | `doc123` | `DOCTOR` | Head clinician card with consultation accesses |
| `nurse_jane` | `nurse123` | `NURSE` | ICU clinical metrics and vitals editor |
| `recep_alice` | `recep123` | `RECEPTIONIST` | Appointment tokenizer and queue dispatcher |
| `pharm_bob` | `pharm123` | `PHARMACIST` | Drug checker and pharmacy inventory loader |

---

## 📂 Project Architecture Layout

```text
DigitalHospitalmanagement/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/hospital/management/
│   │   │       ├── HospitalManagementApplication.java (Boot Initializer)
│   │   │       ├── DatabaseSeeder.java                 (Default DB Seeder)
│   │   │       ├── model/                              (JPA Entity Models)
│   │   │       │   ├── User.java, Doctor.java, Patient.java, Surgery.java, ...
│   │   │       ├── repository/                         (Spring Data Repositories)
│   │   │       │   ├── UserRepository.java, DoctorRepository.java, ...
│   │   │       ├── controller/                         (Spring REST Controllers)
│   │   │       │   ├── AuthController.java, AmbulanceController.java, ...
│   │   │       └── service/                            (Core Service components)
│   │   │           ├── AuditService.java, QueueService.java
│   │   └── resources/
│   │       ├── application.properties                  (MySQL/JPA config credentials)
│   │       └── static/                                 (Web Client Assets)
│   │           ├── index.html                          (SPA Single Page Application)
│   │           ├── css/
│   │           │   └── style.css                       (Glassmorphic style parameters)
│   │           └── js/
│   │               └── app.js                          (API handlers & UI routers)
├── pom.xml                                             (Maven dependencies)
└── mvnw / mvnw.cmd                                     (Maven wrappers)
```

---

## 🚀 Setup & Execution Guide

### Prerequisite
1. **Java Development Kit (JDK)** version 17 or higher.
2. **MySQL Server** running locally on port `3306`.

### Step 1: Configure Database Connection
Open [application.properties](file:///c:/Users/kartik%20sharma/Downloads/DigitalHoslpitalmanagement/src/main/resources/application.properties) and update your MySQL username and password if they differ from the defaults:
```properties
spring.datasource.username=root
spring.datasource.password=Kartik@2005
```

### Step 2: Run Application
Open your terminal inside the project directory and execute:
```powershell
# Windows
.\mvnw.cmd spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

The server will initialize on port **8080** and run the `DatabaseSeeder` to automatically populate the MySQL schema.

### Step 3: Access client UI
Launch your web browser and open:
```text
http://localhost:8080
```
Use any of the default demo credentials (e.g. `admin` / `admin123`) to access the dashboard.
