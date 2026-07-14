<div align="center">

# 🏥 AURA HMS
### **Next-Generation Enterprise Hospital Management System**

*A modern full-stack Hospital Management Platform built with Spring Boot, Java 17, MySQL, and a premium Glassmorphic UI.*

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql)
![Spring Security](https://img.shields.io/badge/Spring-Security-success?style=for-the-badge&logo=springsecurity)
![Hibernate](https://img.shields.io/badge/Hibernate-ORM-59666C?style=for-the-badge&logo=hibernate)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

### ❤️ Smart Healthcare • Intelligent Management • Better Patient Care

</div>

---

# 📖 Overview

**AURA HMS (Hospital Management System)** is a modern enterprise-grade healthcare platform that digitizes every aspect of hospital operations—from patient registration and appointments to ICU monitoring, AI-assisted diagnosis, telemedicine, pharmacy management, ambulance dispatch, billing, and administrative analytics.

Built using **Spring Boot**, **Java 17**, **MySQL**, and a premium **Glassmorphism UI**, the platform provides a scalable architecture suitable for hospitals, clinics, and healthcare organizations.

---

# ✨ Core Features

---

# 📊 Smart Dashboard

Monitor hospital operations in real time.

### Dashboard includes

- Hospital Occupancy
- Patient Statistics
- Revenue Analytics
- Doctor Availability
- Active Queue
- Daily Admissions
- Emergency Alerts
- Department Overview

---

# 🧑‍⚕️ Patient Management

Complete Electronic Health Record (EHR) system.

### Features

- Patient Registration
- Digital Health Records
- Medical History
- Allergies
- Vaccination Records
- Chronic Diseases
- Clinical Timeline
- Treatment History

---

# 📅 Appointment & Queue Management

Simplify patient scheduling.

Features include

- Appointment Booking
- Token Generation
- Queue Management
- Doctor Scheduling
- Estimated Wait Time
- Appointment Status
- Consultation Workflow

---

# ❤️ ICU Live Monitoring

Real-time telemetry simulation.

Monitor

- ❤️ Heart Rate
- 🫁 Oxygen Saturation (SpO₂)
- 🩸 Blood Pressure
- 🌡 Body Temperature
- Respiratory Rate

Automatic emergency alerts are triggered when vitals exceed configured thresholds.

---

# 📹 Telemedicine

Virtual consultation platform.

Features

- Video Consultation
- Clinical Notes
- Online Prescriptions
- Digital EHR Access
- Remote Patient Monitoring

---

# 🏥 Surgery & Operation Theater

Manage surgical workflows.

Features

- Surgery Scheduling
- OT Allocation
- Surgeon Assignment
- Patient Assignment
- Surgery Status
- Operation History

Operation Theaters

- OT-01
- OT-02
- OT-03

---

# 🚑 Ambulance Dispatch

Emergency fleet management.

Features

- Live Vehicle Tracking
- GPS Location
- Dispatch Control
- Fuel Monitoring
- Driver Assignment
- Maintenance Status

---

# 🩸 Blood Bank

Blood inventory management.

Supports all blood groups

- A+
- A-
- B+
- B-
- AB+
- AB-
- O+
- O-

Additional features

- Donor Registration
- Blood Requests
- Donation History
- Inventory Monitoring

---

# 👨‍⚕️ Staff Management

Manage hospital employees.

Includes

- Doctors
- Nurses
- Receptionists
- Pharmacists
- Administrators

Track

- Department
- Qualification
- Shift Timing
- Weekly Schedule
- Consultation Fee

---

# 🤖 AURA AI Assistant

Integrated AI-powered clinical assistant.

Capabilities include

- Disease Risk Analysis
- Diabetes Prediction
- Cardiac Risk Detection
- Drug Interaction Alerts
- Clinical Suggestions
- Triage Assistance

---

# 💊 Pharmacy Management

Manage medicines efficiently.

Features

- Medicine Inventory
- Stock Monitoring
- Prescription Management
- Drug Availability
- Purchase Records

---

# 💰 Billing & Finance

Hospital financial management.

Features

- Patient Billing
- Invoice Generation
- Payment History
- Revenue Reports
- Insurance Support

---

# 🔐 Security & Audit

Enterprise-grade security.

Features

- Role-Based Authentication
- User Management
- Activity Logs
- Audit Trail
- IP Tracking
- Timestamp Logging
- Secure Access Control

---

# 👥 User Roles

| Role | Access |
|-------|---------|
| 👑 Super Admin | Complete System Access |
| 👨‍⚕️ Doctor | Patient Care & Clinical Records |
| 👩‍⚕️ Nurse | Patient Monitoring & ICU |
| 🧾 Receptionist | Registration & Appointments |
| 💊 Pharmacist | Medicine Inventory |

---

# 🛠 Technology Stack

| Category | Technology |
|-----------|------------|
| Backend | Spring Boot 3.x |
| Language | Java 17 |
| Database | MySQL |
| ORM | Hibernate / Spring Data JPA |
| Security | Spring Security |
| Build Tool | Maven |
| Frontend | HTML5 |
| Styling | CSS3 |
| Programming | JavaScript |

---

# 📂 Project Structure

```text
AURA-HMS/
│
├── src/
│
├── main/
│
├── java/
│
├── com/
│   └── hospital/
│       └── management/
│           ├── config/
│           ├── controller/
│           ├── model/
│           ├── repository/
│           ├── service/
│           ├── security/
│           ├── util/
│           └── HospitalManagementApplication.java
│
├── resources/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   ├── images/
│   │   └── index.html
│   │
│   └── application.properties
│
├── pom.xml
├── mvnw
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/AURA-HMS.git
```

---

## Configure Database

Update your MySQL credentials inside

```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## Run Application

### Windows

```bash
mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

The application starts on

```
http://localhost:8080
```

---

# 👤 Demo Login Accounts

| Role | Username | Password |
|------|----------|----------|
| 👑 Super Admin | admin | admin123 |
| 👨‍⚕️ Doctor | dr_smith | doc123 |
| 👩‍⚕️ Nurse | nurse_jane | nurse123 |
| 🧾 Receptionist | recep_alice | recep123 |
| 💊 Pharmacist | pharm_bob | pharm123 |

---

# 📊 Modules

- Dashboard
- Patient Management
- Electronic Health Records
- Doctor Management
- Staff Management
- Appointment Booking
- Queue System
- ICU Monitoring
- Telemedicine
- Pharmacy
- Blood Bank
- Surgery Management
- Ambulance Tracking
- Billing
- AI Diagnosis
- Reports
- Audit Logs

---

# 📈 Future Enhancements

Upcoming enterprise features

- 🤖 Generative AI Medical Assistant
- ☁ Cloud Deployment
- 📱 Android & iOS Apps
- 🛰 IoT Medical Device Integration
- 🧠 Machine Learning Disease Prediction
- 📄 PDF Medical Reports
- 📧 Email & SMS Notifications
- 💳 Online Payment Gateway
- 📹 Real-Time Video Consultation
- 🗣 Voice Assistant
- 🔒 Multi-Factor Authentication
- 🌐 Multi-Hospital Support
- 📊 Power BI Dashboard Integration
- 🧬 AI Radiology Analysis

---

# 🎯 Learning Outcomes

This project demonstrates

- Spring Boot Development
- Java 17
- MVC Architecture
- REST API Design
- Hibernate ORM
- Spring Data JPA
- MySQL Integration
- CRUD Operations
- Enterprise Dashboard Development
- Hospital Workflow Automation
- Responsive UI Design
- Healthcare Information System Architecture

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to GitHub.
5. Open a Pull Request.

---

# 📜 License

Licensed under the **MIT License**.

---

<div align="center">

## ⭐ Support This Project

If you found this project helpful, please consider giving it a **⭐ Star** on GitHub.

It motivates future improvements and helps others discover the project.

---

# 🏥 AURA HMS

### **Smart Healthcare. Intelligent Care. Better Outcomes.**

Built with ❤️ using **Spring Boot • Java 17 • MySQL • HTML • CSS • JavaScript**

</div>
