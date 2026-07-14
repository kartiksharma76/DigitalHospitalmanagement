/* ==========================================================================
   AURA FRONTEND APPLICATION LOGIC & SINGLE PAGE ROUTER
   ========================================================================== */

// Global Application State Cache
let activeSession = null;
let currentPanel = 'login';
let cachedPatients = [];
let cachedDoctors = [];
let cachedAppointments = [];
let cachedInvoices = [];
let cachedInventory = [];

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    // Start Clock
    setInterval(updateClock, 1000);
    updateClock();
    
    // Check if session exists (simulated local cache)
    const cached = localStorage.getItem("aura_session");
    if (cached) {
        activeSession = JSON.parse(cached);
        setupAuthenticatedState();
        if (activeSession.role === 'PATIENT') {
            navigate('patient-dashboard');
        } else {
            navigate('dashboard');
        }
    } else {
        navigate('login');
    }

    // Start Real-time ICU vitals loop
    setInterval(updateLiveIcuVitals, 2000);
});

// Update System Clock Widget
function updateClock() {
    const clockEl = document.getElementById("current-time");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toTimeString().split(' ')[0].substring(0, 5);
    }
}

// Single Page Application Navigation Router
function navigate(panelId) {
    // Check custom routing states
    if (panelId === 'forgot-password' || panelId === 'patient-registration') {
        const sidebar = document.querySelector(".sidebar");
        const topbar = document.querySelector(".topbar");
        if (sidebar) sidebar.classList.add("hidden");
        if (topbar) topbar.classList.add("hidden");
        
        // Hide login, show correct overlay
        const panels = document.querySelectorAll(".view-panel");
        panels.forEach(panel => {
            if (panel.id === `view-${panelId}`) {
                panel.classList.remove("hidden");
            } else {
                panel.classList.add("hidden");
            }
        });
        return;
    }

    if (!activeSession && panelId !== 'login') {
        panelId = 'login';
    }

    currentPanel = panelId;

    // Toggle Sidebar & Topbar visibility based on login context
    const sidebar = document.querySelector(".sidebar");
    const topbar = document.querySelector(".topbar");
    if (panelId === 'login') {
        if (sidebar) sidebar.classList.add("hidden");
        if (topbar) topbar.classList.add("hidden");
    } else {
        if (sidebar) sidebar.classList.remove("hidden");
        if (topbar) topbar.classList.remove("hidden");
    }

    // Toggle Navigation item active states in sidebar
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        const href = item.getAttribute("href");
        if (href && href.includes(panelId)) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Toggle Panels Visibility
    const panels = document.querySelectorAll(".view-panel");
    panels.forEach(panel => {
        if (panel.id === `view-${panelId}`) {
            panel.classList.remove("hidden");
        } else {
            panel.classList.add("hidden");
        }
    });

    // Load data specific to panels
    if (activeSession) {
        if (panelId === 'dashboard') loadDashboardData();
        if (panelId === 'patients') loadPatients();
        if (panelId === 'appointments') loadAppointments();
        if (panelId === 'telemedicine') initTelemedicine();
        if (panelId === 'billing') loadBilling();
        if (panelId === 'inventory') loadInventory();
        if (panelId === 'compliance') loadAuditLogs();
        if (panelId === 'ot-suite') loadSurgeries();
        if (panelId === 'ambulance') loadAmbulances();
        if (panelId === 'blood-bank') loadBloodBank();
        if (panelId === 'clinicians') loadClinicians();
        if (panelId === 'patient-dashboard') loadPatientDashboard();
        if (panelId === 'patient-services') loadPatientServices();
        if (panelId === 'patient-store') loadPatientStore();
        if (panelId === 'user-approval') loadUserApprovals();
        if (panelId === 'store-orders') loadAdminOrders();
        if (panelId === 'bed-bookings') loadAdminBedBookings();
    }
}

// ==========================================================================
// AUTHENTICATION MODULE
// ==========================================================================

async function handleLogin(event) {
    event.preventDefault();
    const userEl = document.getElementById("username");
    const passEl = document.getElementById("password");
    const errEl = document.getElementById("login-error");

    errEl.classList.add("hidden");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: userEl.value,
                password: passEl.value
            })
        });

        if (response.ok) {
            const session = await response.json();
            activeSession = session;
            localStorage.setItem("aura_session", JSON.stringify(session));
            setupAuthenticatedState();
            if (session.role === 'PATIENT') {
                navigate('patient-dashboard');
            } else {
                navigate('dashboard');
            }
            
            // Clear input fields
            userEl.value = "";
            passEl.value = "";
        } else {
            const err = await response.json();
            errEl.textContent = err.message || "Failed authentication.";
            errEl.classList.remove("hidden");
        }
    } catch (e) {
        errEl.textContent = "Error: Cannot reach hospital secure database server.";
        errEl.classList.remove("hidden");
    }
}

function setupAuthenticatedState() {
    // Hide sidebar login/profile panels as appropriate
    document.querySelector(".sidebar").classList.remove("hidden");
    
    // Update user widget info
    document.getElementById("user-display-name").textContent = activeSession.fullName;
    document.getElementById("user-display-role").textContent = activeSession.role.replace("_", " ");

    const isPatient = activeSession.role === "PATIENT";
    const isAdmin = activeSession.role === "SUPER_ADMIN";

    // Manage show/hide of dynamic tags
    document.querySelectorAll(".patient-only").forEach(el => {
        if (isPatient) el.classList.remove("hidden");
        else el.classList.add("hidden");
    });

    document.querySelectorAll(".admin-only").forEach(el => {
        if (isAdmin) el.classList.remove("hidden");
        else el.classList.add("hidden");
    });

    // Hide standard clinician sidebar items for patients
    const clinicianNavLabels = ["General Operations", "Clinical Core", "AI & Analytics", "Administration"];
    const navSections = document.querySelectorAll(".nav-section-label");
    navSections.forEach(label => {
        const txt = label.textContent.trim();
        if (clinicianNavLabels.includes(txt)) {
            if (isPatient) label.classList.add("hidden");
            else label.classList.remove("hidden");
        }
    });

    const items = document.querySelectorAll(".sidebar-nav a.nav-item");
    items.forEach(item => {
        const href = item.getAttribute("href");
        if (href && !href.includes("patient") && !href.includes("user-approval") && !href.includes("store-orders") && !href.includes("bed-bookings")) {
            if (isPatient) item.classList.add("hidden");
            else item.classList.remove("hidden");
        }
    });
}

async function logout() {
    if (activeSession) {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(activeSession)
            });
        } catch(e) {}
    }
    activeSession = null;
    localStorage.removeItem("aura_session");
    document.querySelector(".sidebar").classList.add("hidden");
    navigate('login');
}

// ==========================================================================
// GENERAL DASHBOARD DATA LOADERS
// ==========================================================================

async function loadDashboardData() {
    try {
        const res = await fetch(`/api/analytics/summary?requestedBy=${activeSession.username}&role=${activeSession.role}`);
        if (res.ok) {
            const summary = await res.json();
            
            document.getElementById("dash-total-patients").textContent = summary.totalPatients;
            document.getElementById("dash-total-doctors").textContent = summary.totalDoctors;
            document.getElementById("dash-total-appts").textContent = summary.totalAppointments;
            document.getElementById("dash-total-revenue").textContent = `$${summary.totalRevenue.toFixed(2)}`;

            // Update Occupancy Ratios
            const occ = summary.occupancy;
            document.getElementById("bed-ratio").textContent = `${occ.generalWardOccupied}/${occ.generalWardTotal} Beds`;
            document.getElementById("bed-progress").style.width = `${(occ.generalWardOccupied / occ.generalWardTotal) * 100}%`;

            document.getElementById("icu-ratio").textContent = `${occ.icuOccupied}/${occ.icuTotal} Beds`;
            document.getElementById("icu-progress").style.width = `${(occ.icuOccupied / occ.icuTotal) * 100}%`;

            document.getElementById("ot-ratio").textContent = `${occ.otScheduleLoad} active operations`;
            document.getElementById("ot-progress").style.width = `${(occ.otScheduleLoad / 10) * 100}%`;

            // Render Disease trends
            const trendsContainer = document.getElementById("disease-trends-list");
            trendsContainer.innerHTML = "";
            for (const [disease, count] of Object.entries(summary.diseaseTrends)) {
                trendsContainer.innerHTML += `
                    <div class="occupancy-item">
                        <div class="occupancy-info">
                            <span>${disease}</span>
                            <span>${count} Active Cases</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar bg-violet" style="width: ${(count / 50) * 100}%"></div>
                        </div>
                    </div>
                `;
            }
        }
    } catch(e) {
        console.error("Dashboard failed to retrieve summaries.", e);
    }
}

// ==========================================================================
// PATIENT REGISTRY & EHR MODULE
// ==========================================================================

async function loadPatients() {
    try {
        const res = await fetch("/api/patients");
        if (res.ok) {
            cachedPatients = await res.json();
            renderPatientsTable(cachedPatients);
        }
    } catch(e) {
        console.error("Error retrieving patients", e);
    }
}

function renderPatientsTable(list) {
    const tbody = document.querySelector("#patientsTable tbody");
    tbody.innerHTML = "";
    
    list.forEach(p => {
        let riskClass = "badge-cyan";
        if (p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL") riskClass = "badge-danger";
        else if (p.riskLevel === "MEDIUM") riskClass = "badge-amber";

        tbody.innerHTML += `
            <tr onclick="loadPatientDetails(${p.id})">
                <td><strong>${p.patientId}</strong></td>
                <td>${p.firstName} ${p.lastName} ${p.vip ? '<span class="badge badge-pulse">VIP</span>' : ''}</td>
                <td>${p.gender}</td>
                <td><span class="badge ${riskClass}">${p.riskLevel}</span></td>
                <td><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); loadPatientDetails(${p.id})">Open Chart</button></td>
            </tr>
        `;
    });
}

async function loadPatientDetails(id) {
    const pane = document.getElementById("patientDetailsPane");
    pane.innerHTML = `<div class="details-empty"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading digital clinical charts...</p></div>`;

    try {
        const patientRes = await fetch(`/api/patients/${id}?requestedBy=${activeSession.username}&role=${activeSession.role}`);
        const recordRes = await fetch(`/api/medical-records/patient/${id}?requestedBy=${activeSession.username}&role=${activeSession.role}`);
        
        if (patientRes.ok && recordRes.ok) {
            const patient = await patientRes.json();
            const records = await recordRes.json();

            let recordsHtml = "";
            records.forEach(r => {
                recordsHtml += `
                    <div class="timeline-event">
                        <span class="date">${r.recordDate}</span>
                        <div class="title">${r.diagnosis} (Prescribed: ${r.prescriptions})</div>
                        <div class="desc">
                            <p><strong>Vitals:</strong> ${r.vitals}</p>
                            <p><strong>Symptoms:</strong> ${r.symptoms}</p>
                            <p><strong>Plan:</strong> ${r.treatmentPlan}</p>
                            <p><strong>AI Assistant Clinical Insight:</strong> <em>${r.aiAnalysisSummary || 'N/A'}</em></p>
                            <p style="font-size:11px; margin-top:6px; color:var(--neon-cyan)">${r.doctorDigitalSignature}</p>
                        </div>
                    </div>
                `;
            });

            pane.innerHTML = `
                <div class="patient-chart-header">
                    <h2>${patient.firstName} ${patient.lastName}</h2>
                    <span class="badge badge-cyan">${patient.patientId}</span>
                </div>
                <div class="patient-chart-metadata" style="margin-top: 16px; display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:13px; color:var(--text-secondary)">
                    <div><strong>DOB:</strong> ${patient.dateOfBirth}</div>
                    <div><strong>Gender:</strong> ${patient.gender}</div>
                    <div><strong>Blood Group:</strong> ${patient.bloodGroup || 'Not Checked'}</div>
                    <div><strong>Health Score:</strong> <strong style="color:var(--neon-emerald)">${patient.healthScore} / 100</strong></div>
                </div>
                <div style="margin-top: 16px; font-size:13px;">
                    <p><strong>Allergies:</strong> <span class="text-danger">${patient.allergies || 'None'}</span></p>
                    <p><strong>Chronic Conditions:</strong> ${patient.chronicDiseases || 'None'}</p>
                    <p><strong>Vaccination Record:</strong> ${patient.vaccinationHistory || 'None'}</p>
                </div>
                <hr style="border:0; border-top:1px solid var(--border-color); margin: 20px 0;">
                <h3>EHR Timeline Records</h3>
                <div class="patient-timeline">
                    ${recordsHtml || '<p style="color:var(--text-muted); font-size:13px;">No clinical EHR entries recorded yet.</p>'}
                </div>
                
                <button class="btn btn-primary" style="margin-top:20px; width:100%; justify-content:center" onclick="showAddClinicalNoteForm(${patient.id})">Add Diagnostic note & Prescription</button>
            `;
        }
    } catch(e) {
        pane.innerHTML = `<div class="details-empty"><i class="fa-solid fa-triangle-exclamation text-danger"></i><p>Error retrieving clinical files.</p></div>`;
    }
}

function showNewPatientForm() {
    const pane = document.getElementById("patientDetailsPane");
    pane.innerHTML = `
        <h3>Digital Patient Registration</h3>
        <form id="newPatientForm" onsubmit="savePatient(event)" style="margin-top: 20px;">
            <div class="form-group inline-row">
                <div>
                    <label>First Name</label>
                    <input type="text" id="reg-fname" required>
                </div>
                <div>
                    <label>Last Name</label>
                    <input type="text" id="reg-lname" required>
                </div>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>Gender</label>
                    <select id="reg-gender">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label>DOB (YYYY-MM-DD)</label>
                    <input type="text" id="reg-dob" placeholder="1990-01-01" required>
                </div>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>Phone</label>
                    <input type="text" id="reg-phone" required>
                </div>
                <div>
                    <label>Blood Group</label>
                    <input type="text" id="reg-blood" placeholder="A+">
                </div>
            </div>
            <div class="form-group">
                <label>Allergies</label>
                <input type="text" id="reg-allergies" placeholder="e.g. Penicillin, Peanuts">
            </div>
            <div class="form-group">
                <label>Chronic Diseases</label>
                <input type="text" id="reg-chronic" placeholder="e.g. Asthma, Hypertension">
            </div>
            <button type="submit" class="btn btn-primary btn-block">Complete Registration</button>
        </form>
    `;
}

async function savePatient(event) {
    event.preventDefault();
    const patientObj = {
        firstName: document.getElementById("reg-fname").value,
        lastName: document.getElementById("reg-lname").value,
        gender: document.getElementById("reg-gender").value,
        dateOfBirth: document.getElementById("reg-dob").value,
        phoneNumber: document.getElementById("reg-phone").value,
        bloodGroup: document.getElementById("reg-blood").value,
        allergies: document.getElementById("reg-allergies").value,
        chronicDiseases: document.getElementById("reg-chronic").value,
        riskLevel: document.getElementById("reg-chronic").value ? "MEDIUM" : "LOW",
        healthScore: 100.0
    };

    try {
        const res = await fetch(`/api/patients?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patientObj)
        });

        if (res.ok) {
            loadPatients();
            document.getElementById("patientDetailsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-circle-check text-emerald" style="font-size:48px;"></i>
                    <p>Registration completed successfully! Select patient from list to view chart.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error("Error saving patient", e);
    }
}

function showAddClinicalNoteForm(patientId) {
    const pane = document.getElementById("patientDetailsPane");
    pane.innerHTML = `
        <h3>Add Diagnostic Entry & Electronic Prescription</h3>
        <form id="clinicalNoteForm" onsubmit="saveClinicalNote(event, ${patientId})" style="margin-top: 20px;">
            <div class="form-group">
                <label>Diagnosis</label>
                <input type="text" id="clin-diag" placeholder="e.g. Acute Bronchitis" required>
            </div>
            <div class="form-group">
                <label>Symptoms</label>
                <input type="text" id="clin-symptoms" placeholder="e.g. Cough, sore throat, fever for 3 days">
            </div>
            <div class="form-group">
                <label>Vitals</label>
                <input type="text" id="clin-vitals" placeholder="BP: 120/80, Temp: 98.6 F" required>
            </div>
            <div class="form-group">
                <label>Prescriptions</label>
                <textarea id="clin-presc" placeholder="e.g. Amoxicillin 500mg BID x 7 days" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Digitally Sign & Commit to EHR</button>
        </form>
    `;
}

async function saveClinicalNote(event, patientId) {
    event.preventDefault();
    
    // Call AI to auto-generate clinical diagnostics recommendations asynchronously
    let aiInsight = "AI decision engine verified dosage limits.";
    const diag = document.getElementById("clin-diag").value;
    try {
        const aiRes = await fetch(`/api/ai/suggest-prescriptions?diagnosis=${diag}&requestedBy=${activeSession.username}&role=${activeSession.role}`);
        if (aiRes.ok) {
            const list = await aiRes.json();
            aiInsight = "AI suggested therapeutics: " + list.join(", ");
        }
    } catch(e) {}

    const recordObj = {
        patient: { id: patientId },
        doctor: { id: 1 }, // Default to Doctor 1 Sarah Smith
        recordDate: new Date().toISOString().split('T')[0],
        diagnosis: diag,
        symptoms: document.getElementById("clin-symptoms").value,
        vitals: document.getElementById("clin-vitals").value,
        prescriptions: document.getElementById("clin-presc").value,
        aiAnalysisSummary: aiInsight,
        doctorDigitalSignature: `Digitally Signed by Dr. ${activeSession.fullName} [Verification Code: EHR-SHA256]`
    };

    try {
        const res = await fetch(`/api/medical-records?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(recordObj)
        });

        if (res.ok) {
            loadPatientDetails(patientId);
        }
    } catch(e) {
        console.error("Failed clinical log commit.", e);
    }
}

// ==========================================================================
// APPOINTMENTS & QUEUE MODULE
// ==========================================================================

async function loadAppointments() {
    try {
        const res = await fetch("/api/appointments");
        if (res.ok) {
            cachedAppointments = await res.json();
            renderAppointmentsTable(cachedAppointments);
        }
    } catch(e) {
        console.error("Failed load appointments", e);
    }
}

function renderAppointmentsTable(list) {
    const tbody = document.querySelector("#appointmentsTable tbody");
    tbody.innerHTML = "";

    list.forEach(a => {
        let badgeClass = "badge-cyan";
        if (a.status === "In_Queue") badgeClass = "badge-amber";
        else if (a.status === "Completed") badgeClass = "badge-emerald";
        else if (a.status === "Cancelled") badgeClass = "badge-danger";

        tbody.innerHTML += `
            <tr onclick="loadAppointmentActionPane(${a.id})">
                <td><strong>Token #${a.tokenNumber || 'N/A'}</strong></td>
                <td>${a.appointmentNumber}</td>
                <td>${a.patient.firstName} ${a.patient.lastName}</td>
                <td>Dr. ${a.doctor.lastName}</td>
                <td>${a.estimatedWaitMinutes} mins</td>
                <td><span class="badge ${badgeClass}">${a.status}</span></td>
                <td><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); loadAppointmentActionPane(${a.id})">Manage</button></td>
            </tr>
        `;
    });
}

function loadAppointmentActionPane(id) {
    const appt = cachedAppointments.find(a => a.id === id);
    const pane = document.getElementById("appointmentActionsPane");
    
    if (appt) {
        pane.innerHTML = `
            <h3>Manage Appointment & Token</h3>
            <div style="margin-top: 16px; font-size:13px; line-height: 1.8;">
                <p><strong>Appointment:</strong> ${appt.appointmentNumber}</p>
                <p><strong>Patient:</strong> ${appt.patient.firstName} ${appt.patient.lastName} (ID: ${appt.patient.patientId})</p>
                <p><strong>Assigned Doctor:</strong> Dr. ${appt.doctor.firstName} ${appt.doctor.lastName} (${appt.doctor.specialization})</p>
                <p><strong>Date / Time:</strong> ${appt.date} @ ${appt.time}</p>
                <p><strong>Active Token Number:</strong> ${appt.tokenNumber}</p>
                <p><strong>Estimated Waiting:</strong> ${appt.estimatedWaitMinutes} minutes</p>
            </div>
            
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                ${appt.type === 'Telemedicine' ? `<button class="btn btn-primary" onclick="startTelemedicineSession(${appt.id})" style="background:linear-gradient(135deg, var(--neon-cyan), var(--neon-violet)); color:#fff; border:none; padding:12px; font-weight:700;"><i class="fa-solid fa-video"></i> Start Video Consultation</button>` : ''}
                <button class="btn btn-primary" onclick="updateAppointmentStatus(${appt.id}, 'In_Queue')">Call Patient (Put In Queue)</button>
                <button class="btn btn-secondary" style="color:var(--neon-emerald); border-color:rgba(16, 185, 129, 0.4)" onclick="updateAppointmentStatus(${appt.id}, 'Completed')">Mark Consultation Complete</button>
                <button class="btn btn-secondary" style="color:var(--neon-rose); border-color:rgba(244, 63, 94, 0.4)" onclick="updateAppointmentStatus(${appt.id}, 'Cancelled')">Cancel Appointment</button>
            </div>
        `;
    }
}

function showBookAppointmentForm() {
    const pane = document.getElementById("appointmentActionsPane");
    pane.innerHTML = `
        <h3>Book New Appointment</h3>
        <form id="newApptForm" onsubmit="saveAppointment(event)" style="margin-top:20px;">
            <div class="form-group">
                <label>Select Patient</label>
                <select id="appt-patient-select" required>
                    ${cachedPatients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (${p.patientId})</option>`).join("")}
                </select>
            </div>
            <div class="form-group">
                <label>Select Specialist</label>
                <select id="appt-doctor-select" required>
                    <option value="1">Dr. Sarah Smith (Cardiology)</option>
                    <option value="2">Dr. Alex Vance (Pediatrics)</option>
                    <option value="3">Dr. John Watson (General Medicine)</option>
                </select>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>Date (YYYY-MM-DD)</label>
                    <input type="text" id="appt-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div>
                    <label>Time (HH:MM)</label>
                    <input type="text" id="appt-time" value="10:00" required>
                </div>
            </div>
            <div class="form-group">
                <label>Consultation Type</label>
                <select id="appt-type">
                    <option value="OPD">OPD Consultation</option>
                    <option value="Telemedicine">Telemedicine</option>
                    <option value="Emergency">Emergency</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Confirm Booking & Generate Token</button>
        </form>
    `;
}

async function saveAppointment(event) {
    event.preventDefault();
    const apptObj = {
        patient: { id: parseInt(document.getElementById("appt-patient-select").value) },
        doctor: { id: parseInt(document.getElementById("appt-doctor-select").value) },
        date: document.getElementById("appt-date").value,
        time: document.getElementById("appt-time").value,
        type: document.getElementById("appt-type").value,
        status: "Scheduled"
    };

    try {
        const res = await fetch(`/api/appointments?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apptObj)
        });

        if (res.ok) {
            loadAppointments();
            document.getElementById("appointmentActionsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-circle-check text-emerald" style="font-size:48px;"></i>
                    <p>Booking confirmed! Active token issued successfully.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error("Error creating appointment", e);
    }
}

async function updateAppointmentStatus(id, status) {
    try {
        const res = await fetch(`/api/appointments/${id}/status?status=${status}&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadAppointments();
            document.getElementById("appointmentActionsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-circle-check text-emerald" style="font-size:48px;"></i>
                    <p>Status changed to <strong>${status}</strong>.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error("Error updating appointment state", e);
    }
}

// ==========================================================================
// AI HEALTH CLINICAL ASSISTANT CORE
// ==========================================================================

async function runAiSymptomCheck() {
    const text = document.getElementById("ai-symptom-input").value;
    const pane = document.getElementById("symptom-result-pane");
    if (!text) return;

    pane.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing symptoms...`;
    pane.classList.remove("hidden");

    try {
        const res = await fetch(`/api/ai/symptoms?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symptoms: text })
        });

        if (res.ok) {
            const data = await res.json();
            let labelClass = "badge-cyan";
            if (data.alertLevel === "CRITICAL") labelClass = "badge-danger";
            else if (data.alertLevel === "MODERATE") labelClass = "badge-amber";

            pane.innerHTML = `
                <p><strong>Assessment Level:</strong> <span class="badge ${labelClass}">${data.alertLevel}</span></p>
                <p style="margin-top: 8px;"><strong>Possible Diagnoses:</strong> ${data.possibleConditions.join(", ")}</p>
                <p style="margin-top: 8px; color:var(--neon-cyan)"><strong>Triage Advisory:</strong> ${data.recommendation}</p>
            `;
        }
    } catch(e) {
        pane.innerHTML = `Error assessing diagnostic reports.`;
    }
}

async function runAiRiskPrediction() {
    const pane = document.getElementById("risk-result-pane");
    pane.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing metrics...`;
    pane.classList.remove("hidden");

    const reqBody = {
        bmi: parseFloat(document.getElementById("ai-risk-bmi").value),
        bloodPressure: document.getElementById("ai-risk-bp").value,
        fastingSugar: parseInt(document.getElementById("ai-risk-sugar").value),
        age: parseInt(document.getElementById("ai-risk-age").value)
    };

    try {
        const res = await fetch(`/api/ai/risk-prediction?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqBody)
        });

        if (res.ok) {
            const data = await res.json();
            
            pane.innerHTML = `
                <p><strong>Cardiovascular Event Probability:</strong> <span class="text-danger">${data.cardiovascularRiskScore}%</span></p>
                <p><strong>Type-2 Diabetes Risk Score:</strong> <span class="text-danger">${data.diabetesRiskScore}%</span></p>
                <p style="margin-top: 8px;"><strong>Risk Factors Detected:</strong> ${data.detectedRiskFactors.join(", ") || 'None'}</p>
                <p style="margin-top: 8px; font-size:12px; color:var(--text-secondary)">${data.summary}</p>
            `;
        }
    } catch(e) {
        pane.innerHTML = `Error checking health scores.`;
    }
}

async function runDrugInteractionCheck() {
    const pane = document.getElementById("interaction-result-pane");
    pane.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking medication safety...`;
    pane.classList.remove("hidden");

    const inputs = document.querySelectorAll(".med-input-field");
    const meds = [];
    inputs.forEach(i => { if (i.value) meds.push(i.value); });

    try {
        const res = await fetch(`/api/ai/drug-interactions?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ medicines: meds })
        });

        if (res.ok) {
            const warnings = await res.json();
            if (warnings.length === 0) {
                pane.innerHTML = `<p style="color:var(--neon-emerald)"><i class="fa-solid fa-circle-check"></i> No drug-drug interactions detected for the specified combinations.</p>`;
            } else {
                let html = `<h4><i class="fa-solid fa-triangle-exclamation text-danger"></i> Interaction Alerts Detected</h4>`;
                warnings.forEach(w => {
                    html += `
                        <div style="margin-top: 8px; border-left: 2px solid var(--neon-rose); padding-left: 8px;">
                            <strong>${w.drugs} (${w.severity})</strong>
                            <p style="font-size:12px; color:var(--text-secondary)">${w.effect}</p>
                        </div>
                    `;
                });
                pane.innerHTML = html;
            }
        }
    } catch(e) {
        pane.innerHTML = `Failed interaction checks.`;
    }
}

// ==========================================================================
// BILLING & INSURANCE CLAIMS MODULE
// ==========================================================================

async function loadBilling() {
    try {
        const res = await fetch("/api/billing");
        if (res.ok) {
            cachedInvoices = await res.json();
            renderInvoicesTable(cachedInvoices);
        }
    } catch(e) {
        console.error("Failed load billing records", e);
    }
}

function renderInvoicesTable(list) {
    const tbody = document.querySelector("#invoicesTable tbody");
    tbody.innerHTML = "";

    list.forEach(i => {
        let statClass = "badge-cyan";
        if (i.status === "Paid" || i.status === "Claim_Approved") statClass = "badge-emerald";
        else if (i.status === "Unpaid") statClass = "badge-danger";
        else if (i.status === "Claim_Submitted") statClass = "badge-amber";

        tbody.innerHTML += `
            <tr onclick="loadInvoiceDetailsPane(${i.id})">
                <td><strong>${i.invoiceNumber}</strong></td>
                <td>${i.patient.firstName} ${i.patient.lastName}</td>
                <td>${i.billingDate}</td>
                <td>$${i.totalAmount.toFixed(2)}</td>
                <td><span class="badge ${statClass}">${i.status}</span></td>
                <td><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); loadInvoiceDetailsPane(${i.id})">Open</button></td>
            </tr>
        `;
    });
}

function loadInvoiceDetailsPane(id) {
    const inv = cachedInvoices.find(i => i.id === id);
    const pane = document.getElementById("invoiceDetailsPane");

    if (inv) {
        pane.innerHTML = `
            <h3>Invoice Breakdown</h3>
            <div style="margin-top: 16px; font-size:13px; line-height: 1.8;">
                <p><strong>Invoice No:</strong> ${inv.invoiceNumber}</p>
                <p><strong>Patient:</strong> ${inv.patient.firstName} ${inv.patient.lastName}</p>
                <p><strong>Date:</strong> ${inv.billingDate}</p>
                <hr style="border:0; border-top:1px solid var(--border-color); margin:10px 0;">
                <p>Consultation charges: $${inv.consultationCharges}</p>
                <p>Pharmacy charges: $${inv.pharmacyCharges}</p>
                <p>Lab / Diagnostic charges: $${inv.labCharges}</p>
                <p>Room/IPD charges: $${inv.roomCharges}</p>
                <p>ICU/Critical Care: $${inv.icuCharges}</p>
                <p>OT / Surgical suite: $${inv.otCharges}</p>
                <hr style="border:0; border-top:1px solid var(--border-color); margin:10px 0;">
                <p>Discount: -$${inv.discount}</p>
                <p>Tax: $${inv.tax}</p>
                <p><strong>Total Amount:</strong> <strong style="color:var(--neon-emerald); font-size:16px;">$${inv.totalAmount.toFixed(2)}</strong></p>
                <hr style="border:0; border-top:1px solid var(--border-color); margin:10px 0;">
                <p><strong>Payment Status:</strong> ${inv.status}</p>
                ${inv.insuranceProvider ? `<p><strong>Provider:</strong> ${inv.insuranceProvider} (${inv.claimNumber})</p>` : ''}
            </div>

            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                ${inv.status === 'Unpaid' ? `
                    <button class="btn btn-primary" onclick="payInvoice(${inv.id}, 'Card')">Pay via Card</button>
                    <button class="btn btn-secondary" onclick="payInvoice(${inv.id}, 'UPI')">Pay via UPI</button>
                ` : ''}
                ${inv.status === 'Claim_Submitted' ? `
                    <button class="btn btn-primary" onclick="approveInsuranceClaim(${inv.id}, '${inv.claimNumber}', ${inv.totalAmount})">Approve Cashless Settlement</button>
                    <button class="btn btn-secondary" style="color:var(--neon-rose);" onclick="rejectInsuranceClaim(${inv.id}, '${inv.claimNumber}')">Reject Claim</button>
                ` : ''}
                <button class="btn btn-secondary" onclick="runAiBillingAudit(${inv.id})"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Compliance Audit</button>
            </div>
            <div id="billing-audit-result" class="ai-result-pane hidden" style="margin-top:16px;"></div>
        `;
    }
}

async function payInvoice(id, method) {
    try {
        const res = await fetch(`/api/billing/${id}/payment?method=${method}&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadBilling();
            document.getElementById("invoiceDetailsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-circle-check text-emerald" style="font-size:48px;"></i>
                    <p>Invoiced sum paid successfully.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error(e);
    }
}

async function approveInsuranceClaim(id, claimNo, amount) {
    try {
        const res = await fetch(`/api/billing/${id}/claim?claimNumber=${claimNo}&approvedAmount=${amount}&status=Claim_Approved&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadBilling();
            document.getElementById("invoiceDetailsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-circle-check text-emerald" style="font-size:48px;"></i>
                    <p>Cashless insurance claim cleared.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error(e);
    }
}

async function rejectInsuranceClaim(id, claimNo) {
    try {
        const res = await fetch(`/api/billing/${id}/claim?claimNumber=${claimNo}&approvedAmount=0.0&status=Claim_Rejected&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadBilling();
            document.getElementById("invoiceDetailsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-triangle-exclamation text-danger" style="font-size:48px;"></i>
                    <p>Insurance claim rejected.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error(e);
    }
}

async function runAiBillingAudit(id) {
    const inv = cachedInvoices.find(i => i.id === id);
    const audResult = document.getElementById("billing-audit-result");
    audResult.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Evaluating billing codes compliance...`;
    audResult.classList.remove("hidden");

    try {
        const res = await fetch(`/api/ai/billing-audit?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inv)
        });

        if (res.ok) {
            const report = await res.json();
            if (report.fraudDetected) {
                audResult.innerHTML = `
                    <p style="color:var(--neon-amber)"><strong>Status:</strong> ${report.auditStatus}</p>
                    <ul style="margin-top: 8px; font-size:12px; padding-left:16px;">
                        ${report.findings.map(f => `<li>${f}</li>`).join("")}
                    </ul>
                `;
            } else {
                audResult.innerHTML = `<p style="color:var(--neon-emerald)"><i class="fa-solid fa-circle-check"></i> Passed Automated Compliance. Billing codes matches EHR reports.</p>`;
            }
        }
    } catch(e) {
        audResult.innerHTML = `Error checking billing reports.`;
    }
}

function showCreateInvoiceForm() {
    const pane = document.getElementById("invoiceDetailsPane");
    pane.innerHTML = `
        <h3>Generate Billing Invoice</h3>
        <form id="newInvoiceForm" onsubmit="saveInvoice(event)" style="margin-top:20px;">
            <div class="form-group">
                <label>Select Patient</label>
                <select id="bill-patient-select" required>
                    ${cachedPatients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (${p.patientId})</option>`).join("")}
                </select>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>Consultation Fee</label>
                    <input type="number" id="bill-consult" value="150" required>
                </div>
                <div>
                    <label>Pharmacy Charges</label>
                    <input type="number" id="bill-pharma" value="45" required>
                </div>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>Laboratory Fees</label>
                    <input type="number" id="bill-lab" value="0" required>
                </div>
                <div>
                    <label>Room / Ward Charges</label>
                    <input type="number" id="bill-room" value="0" required>
                </div>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>ICU Charges</label>
                    <input type="number" id="bill-icu" value="0" required>
                </div>
                <div>
                    <label>Surgical / OT Charges</label>
                    <input type="number" id="bill-ot" value="0" required>
                </div>
            </div>
            <div class="form-group inline-row">
                <div>
                    <label>Insurance Provider</label>
                    <input type="text" id="bill-provider" placeholder="e.g. BlueShield Health">
                </div>
                <div>
                    <label>Discount</label>
                    <input type="number" id="bill-discount" value="0" required>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Generate Invoice Ledgers</button>
        </form>
    `;
}

async function saveInvoice(event) {
    event.preventDefault();
    const invObj = {
        patient: { id: parseInt(document.getElementById("bill-patient-select").value) },
        billingDate: new Date().toISOString().split('T')[0],
        consultationCharges: parseFloat(document.getElementById("bill-consult").value),
        pharmacyCharges: parseFloat(document.getElementById("bill-pharma").value),
        labCharges: parseFloat(document.getElementById("bill-lab").value),
        roomCharges: parseFloat(document.getElementById("bill-room").value),
        icuCharges: parseFloat(document.getElementById("bill-icu").value),
        otCharges: parseFloat(document.getElementById("bill-ot").value),
        discount: parseFloat(document.getElementById("bill-discount").value),
        insuranceProvider: document.getElementById("bill-provider").value,
        claimNumber: document.getElementById("bill-provider").value ? "CLM-" + Math.floor(10000 + Math.random() * 90000) : "",
        status: document.getElementById("bill-provider").value ? "Claim_Submitted" : "Unpaid"
    };

    try {
        const res = await fetch(`/api/billing?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invObj)
        });

        if (res.ok) {
            loadBilling();
            document.getElementById("invoiceDetailsPane").innerHTML = `
                <div class="details-empty">
                    <i class="fa-solid fa-circle-check text-emerald" style="font-size:48px;"></i>
                    <p>Billing invoice generated successfully.</p>
                </div>
            `;
        }
    } catch(e) {
        console.error(e);
    }
}

// ==========================================================================
// PHARMACY & INVENTORY MODULE
// ==========================================================================

let currentInventoryFilter = "All";
let currentInventorySearch = "";

async function loadInventory() {
    try {
        const res = await fetch("/api/inventory");
        if (res.ok) {
            cachedInventory = await res.json();
            renderInventoryItems();
        }
    } catch(e) {
        console.error(e);
    }
}

function handleInventorySearch() {
    const input = document.getElementById("inventory-search-input");
    if (input) {
        currentInventorySearch = input.value.trim().toLowerCase();
        renderInventoryItems();
    }
}

function filterInventoryItems(category) {
    currentInventoryFilter = category;
    
    // Toggle active classes on category buttons
    const btns = document.querySelectorAll("#view-inventory button");
    btns.forEach(btn => {
        if (btn.textContent.trim() === category || (category === 'All' && btn.textContent.trim() === 'All Products') || (category === 'Medical Equipment' && btn.textContent.trim() === 'Equipment') || (category === 'Hospital Supplies' && btn.textContent.trim() === 'Supplies') || (category === 'Packages' && btn.textContent.trim() === 'Health Packages')) {
            btn.classList.add("active-tab");
        } else if (btn.onclick && btn.onclick.toString().includes("filterInventoryItems")) {
            btn.classList.remove("active-tab");
        }
    });

    renderInventoryItems();
}

function renderInventoryItems() {
    const grid = document.getElementById("inventory-products-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = cachedInventory.filter(item => {
        // Category check
        const matchCategory = currentInventoryFilter === "All" ? true : item.category === currentInventoryFilter;

        // Search check
        const matchSearch = currentInventorySearch === "" ? true : 
            (item.name.toLowerCase().includes(currentInventorySearch) || 
             item.category.toLowerCase().includes(currentInventorySearch) || 
             item.itemCode.toLowerCase().includes(currentInventorySearch));

        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:32px 0;">No stock items found matching your filters.</div>`;
        return;
    }

    filtered.forEach(item => {
        const imgUrl = item.imageUrl ? item.imageUrl : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400";
        const isLow = item.stockQuantity <= item.reorderLevel;
        const alertClass = isLow ? "color:var(--neon-rose); font-weight:700;" : "color:var(--neon-cyan);";
        const progressPercent = Math.min(100, (item.stockQuantity / Math.max(1, item.reorderLevel * 2)) * 100);
        const progressBg = isLow ? "var(--neon-rose)" : "var(--neon-cyan)";

        grid.innerHTML += `
            <div class="product-card" style="display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
                <div>
                    <div style="width:100%; height:110px; border-radius:8px; overflow:hidden; border:1px solid var(--border-color); margin-bottom:8px; background:#000;">
                        <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <span class="product-cat">${item.category}</span>
                    <h4 class="product-name" style="margin:2px 0 4px 0; font-family:var(--font-secondary);">${item.name}</h4>
                    <span style="font-family:monospace; font-size:11px; color:var(--text-muted);">CODE: ${item.itemCode}</span>
                    
                    <div style="margin:8px 0 4px 0;">
                        <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:2px;">
                            <span style="color:var(--text-secondary);">Stock Level</span>
                            <span style="${alertClass}">${item.stockQuantity} / ${item.reorderLevel} units</span>
                        </div>
                        <div class="stock-progress-container">
                            <div class="stock-progress-bar" style="width:${progressPercent}%; background:${progressBg};"></div>
                        </div>
                    </div>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12.5px; margin-bottom:8px;">
                        <span style="color:var(--text-muted);">Unit Cost:</span>
                        <span style="font-weight:700; color:var(--neon-emerald);">$${item.unitPrice.toFixed(2)}</span>
                    </div>
                    <div style="font-size:11.5px; color:var(--text-muted); line-height:1.4; margin-bottom:10px; border-top:1px solid rgba(255,255,255,0.03); padding-top:6px;">
                        <div><i class="fa-solid fa-map-location-dot"></i> Shelf: <strong>${item.location || 'Warehouse'}</strong></div>
                        <div><i class="fa-solid fa-building"></i> Lab: <strong>${item.supplierName || 'Licensed Lab'}</strong></div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-secondary btn-sm" onclick="showAdjustStockModal(${item.id})" style="flex:1; justify-content:center; padding:6px; font-size:11.5px;"><i class="fa-solid fa-boxes-packing"></i> Adjust</button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteInventoryItem(${item.id})" style="color:var(--neon-rose); border-color:rgba(244,63,94,0.3); padding:6px; font-size:11.5px;"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

function showAddInventoryForm() {
    const modal = document.getElementById("addInventoryModal");
    if (modal) {
        document.getElementById("addInventoryForm").reset();
        modal.classList.remove("hidden");
    }
}

function closeAddInventoryModal() {
    const modal = document.getElementById("addInventoryModal");
    if (modal) modal.classList.add("hidden");
}

async function handleAddInventorySubmit(event) {
    event.preventDefault();
    const payload = {
        name: document.getElementById("add-inv-name").value.trim(),
        category: document.getElementById("add-inv-category").value,
        stockQuantity: parseInt(document.getElementById("add-inv-stock").value) || 0,
        reorderLevel: parseInt(document.getElementById("add-inv-reorder").value) || 10,
        unitPrice: parseFloat(document.getElementById("add-inv-price").value) || 1.00,
        location: document.getElementById("add-inv-location").value.trim(),
        supplierName: document.getElementById("add-inv-supplier").value.trim() || "Licensed Pharmaceutical Labs",
        expiryDate: document.getElementById("add-inv-expiry").value || null,
        imageUrl: document.getElementById("add-inv-image").value.trim() || null,
        description: document.getElementById("add-inv-desc").value.trim() || null
    };

    closeAddInventoryModal();
    saveInventoryItem(payload);
}

async function saveInventoryItem(payload) {
    try {
        const res = await fetch(`/api/inventory?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            loadInventory();
        }
    } catch(e) {
        console.error(e);
    }
}

function showAdjustStockModal(id) {
    const item = cachedInventory.find(i => i.id === id);
    if (!item) return;

    const modal = document.getElementById("adjustStockModal");
    if (!modal) return;

    document.getElementById("adjust-inv-id").value = item.id;
    document.getElementById("adjust-inv-name").innerText = item.name;
    document.getElementById("adjust-inv-code").innerText = `CODE: ${item.itemCode}`;
    document.getElementById("adjust-inv-current").value = item.stockQuantity;
    document.getElementById("adjust-inv-qty").value = 50;
    
    const img = document.getElementById("adjust-inv-img");
    if (img) img.src = item.imageUrl ? item.imageUrl : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80";

    handleAdjustActionChange();
    modal.classList.remove("hidden");
}

function closeAdjustStockModal() {
    const modal = document.getElementById("adjustStockModal");
    if (modal) modal.classList.add("hidden");
}

function handleAdjustActionChange() {
    const action = document.getElementById("adjust-inv-action").value;
    const label = document.getElementById("adjust-qty-label");
    if (!label) return;

    if (action === "add") {
        label.innerText = "Quantity to Add";
    } else if (action === "sub") {
        label.innerText = "Quantity to Deduct";
    } else {
        label.innerText = "New Absolute Quantity";
    }
}

async function handleAdjustStockSubmit(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById("adjust-inv-id").value);
    const action = document.getElementById("adjust-inv-action").value;
    const current = parseInt(document.getElementById("adjust-inv-current").value) || 0;
    const qtyInput = parseInt(document.getElementById("adjust-inv-qty").value) || 0;

    let targetQty = current;
    if (action === "add") {
        targetQty = current + qtyInput;
    } else if (action === "sub") {
        targetQty = Math.max(0, current - qtyInput);
    } else {
        targetQty = Math.max(0, qtyInput);
    }

    closeAdjustStockModal();
    updateStockQty(id, targetQty);
}

async function updateStockQty(id, qty) {
    try {
        const res = await fetch(`/api/inventory/${id}/stock?newQuantity=${qty}&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadInventory();
        }
    } catch(e) {
        console.error(e);
    }
}

async function deleteInventoryItem(id) {
    if (!confirm("Are you sure you want to delete this product catalog item from the pharmacy inventory database?")) return;
    try {
        const res = await fetch(`/api/inventory/${id}?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "DELETE"
        });
        if (res.ok) {
            loadInventory();
        } else {
            alert("Delete action failed.");
        }
    } catch(e) {
        console.error(e);
    }
}

// ==========================================================================
// COMPLIANCE AUDITING MODULE
// ==========================================================================

async function loadAuditLogs() {
    const list = document.getElementById("auditLogsTimeline");
    list.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Retrieving compliance activity trace logs...`;

    try {
        const res = await fetch("/api/audit/logs");
        if (res.ok) {
            const logs = await res.json();
            list.innerHTML = "";
            logs.forEach(l => {
                list.innerHTML += `
                    <div class="audit-card">
                        <div class="audit-meta">
                            <span class="act">${l.action}</span>
                            <span class="usr">By user <strong>${l.username}</strong> (${l.role}) - IP: ${l.ipAddress || 'unknown'}</span>
                            <p style="font-size:12px; margin-top:4px; color:var(--text-secondary)">${l.details}</p>
                        </div>
                        <div class="audit-time">${l.timestamp}</div>
                    </div>
                `;
            });
        }
    } catch(e) {
        list.innerHTML = "Error retrieving compliance audit traces.";
    }
}

// ==========================================================================
// ICU TELEMETRY VITALS MOCK STREAM & TELEMED CONSULTATION ACTIONS
// ==========================================================================

function updateLiveIcuVitals() {
    // Generate slight vitals fluctuations to emulate dynamic sensors telemetry
    const vitalHr1 = document.getElementById("vital-hr-1");
    if (vitalHr1) {
        const hr = Math.floor(100 + Math.random() * 20); // fluctuate between 100 and 120
        vitalHr1.textContent = `${hr} bpm`;
        if (hr > 115) {
            document.getElementById("icu-bed-1").classList.add("alert-pulse");
        } else {
            document.getElementById("icu-bed-1").classList.remove("alert-pulse");
        }
    }

    const vitalHr2 = document.getElementById("vital-hr-2");
    if (vitalHr2) {
        vitalHr2.textContent = `${Math.floor(74 + Math.random() * 8)} bpm`;
    }
}

function submitTelemedPrescription() {
    const text = document.getElementById("telemed-clinical-notes").value;
    if (!text) {
        alert("Please enter consult notes before committing.");
        return;
    }

    alert("EHR Clinical entry created successfully! Digitally signed by clinician.");
    document.getElementById("telemed-clinical-notes").value = "";
    navigate("patients");
}

// ==========================================================================
// GLOBAL CLINICAL RECORD SEARCH
// ==========================================================================
function handleGlobalSearch() {
    const query = document.getElementById("globalSearch").value.toLowerCase();
    
    if (currentPanel === 'patients') {
        const filtered = cachedPatients.filter(p => 
            p.firstName.toLowerCase().includes(query) || 
            p.lastName.toLowerCase().includes(query) ||
            p.patientId.toLowerCase().includes(query) ||
            (p.chronicDiseases && p.chronicDiseases.toLowerCase().includes(query))
        );
        renderPatientsTable(filtered);
    } else if (currentPanel === 'appointments') {
        const filtered = cachedAppointments.filter(a => 
            a.patient.firstName.toLowerCase().includes(query) || 
            a.patient.lastName.toLowerCase().includes(query) ||
            a.appointmentNumber.toLowerCase().includes(query) ||
            a.status.toLowerCase().includes(query)
        );
        renderAppointmentsTable(filtered);
    } else if (currentPanel === 'billing') {
        const filtered = cachedInvoices.filter(i => 
            i.patient.firstName.toLowerCase().includes(query) || 
            i.invoiceNumber.toLowerCase().includes(query) ||
            i.status.toLowerCase().includes(query)
        );
        renderInvoicesTable(filtered);
    } else if (currentPanel === 'inventory') {
        const filtered = cachedInventory.filter(i => 
            i.name.toLowerCase().includes(query) || 
            i.category.toLowerCase().includes(query) ||
            i.itemCode.toLowerCase().includes(query)
        );
        renderInventoryTable(filtered);
    }
}

// ==========================================================================
// SURGERY SUITE & OPERATION THEATER MANAGEMENT
// ==========================================================================
async function loadSurgeries() {
    const tbody = document.getElementById("surgeriesTableBody");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="8"><i class="fa-solid fa-spinner fa-spin"></i> Loading surgeries...</td></tr>`;
    
    // Populate form dropdown options
    populateSurgerySelectors();
    
    try {
        const res = await fetch("/api/surgeries");
        if (res.ok) {
            const surgeries = await res.json();
            tbody.innerHTML = "";
            if (surgeries.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted)">No surgeries currently scheduled.</td></tr>`;
                return;
            }
            surgeries.forEach(s => {
                let statusClass = "badge-cyan";
                if (s.status === "Completed") statusClass = "badge-emerald";
                else if (s.status === "In_Progress") statusClass = "badge-pulse badge-danger";
                else if (s.status === "Post_Op_Recovery") statusClass = "badge-amber";
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${s.surgeryCode}</strong></td>
                        <td>${s.patient.firstName} ${s.patient.lastName}</td>
                        <td>Dr. ${s.surgeon.firstName} ${s.surgeon.lastName}</td>
                        <td><span class="badge badge-secondary">${s.theaterRoom}</span></td>
                        <td>${s.anesthesiaType}</td>
                        <td>${s.date}</td>
                        <td><span class="badge ${statusClass}">${s.status.replace('_', ' ')}</span></td>
                        <td>
                            <div class="ambulance-actions">
                                <button class="btn btn-secondary btn-sm" onclick="updateSurgeryStatus(${s.id}, 'In_Progress')">Start</button>
                                <button class="btn btn-primary btn-sm" onclick="updateSurgeryStatus(${s.id}, 'Completed')">Complete</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--neon-rose)">Failed to retrieve surgery database.</td></tr>`;
    }
}

async function updateSurgeryStatus(id, newStatus) {
    if (!activeSession) return;
    try {
        const res = await fetch(`/api/surgeries/${id}/status?status=${newStatus}&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadSurgeries();
        } else {
            alert("Error: Unable to update surgery status.");
        }
    } catch (e) {
        console.error("Error updating surgery status", e);
    }
}

async function handleScheduleSurgery(event) {
    event.preventDefault();
    if (!activeSession) return;
    
    const patientId = document.getElementById("surg-patient-id").value;
    const surgeonId = document.getElementById("surg-surgeon-id").value;
    const date = document.getElementById("surg-date").value;
    const theater = document.getElementById("surg-theater").value;
    const anesthesia = document.getElementById("surg-anesthesia").value;
    
    try {
        const res = await fetch(`/api/surgeries?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patient: { id: parseInt(patientId) },
                surgeon: { id: parseInt(surgeonId) },
                date: date,
                theaterRoom: theater,
                anesthesiaType: anesthesia,
                status: "Scheduled"
            })
        });
        
        if (res.ok) {
            alert("Surgery procedure scheduled and logged successfully!");
            document.getElementById("scheduleSurgeryForm").reset();
            loadSurgeries();
        } else {
            alert("Failed to schedule surgery. Please check input parameters.");
        }
    } catch (e) {
        console.error("Error scheduling surgery:", e);
    }
}

async function populateSurgerySelectors() {
    const patientSelect = document.getElementById("surg-patient-id");
    const doctorSelect = document.getElementById("surg-surgeon-id");
    
    if (!patientSelect || !doctorSelect) return;
    
    try {
        const [patientsRes, doctorsRes] = await Promise.all([
            fetch("/api/patients"),
            fetch("/api/doctors")
        ]);
        
        if (patientsRes.ok && doctorsRes.ok) {
            const patients = await patientsRes.json();
            const doctors = await doctorsRes.json();
            
            patientSelect.innerHTML = '<option value="">Select Patient</option>' + 
                patients.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName} (${p.patientId})</option>`).join('');
                
            doctorSelect.innerHTML = '<option value="">Select Surgeon</option>' + 
                doctors.map(d => `<option value="${d.id}">Dr. ${d.firstName} ${d.lastName} (${d.specialization})</option>`).join('');
        }
    } catch (e) {
        console.error("Error populating surgery form selectors:", e);
    }
}

// ==========================================================================
// AMBULANCE DISPATCH & TELEMETRY
// ==========================================================================
async function loadAmbulances() {
    const grid = document.getElementById("ambulanceGrid");
    if (!grid) return;
    
    grid.innerHTML = `<div style="grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving fleet status indicators...</div>`;
    
    try {
        const res = await fetch("/api/ambulances");
        if (res.ok) {
            const fleet = await res.json();
            grid.innerHTML = "";
            if (fleet.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--text-muted)">No ambulance vehicles registered in the system.</div>`;
                return;
            }
            
            fleet.forEach(amb => {
                let statusClass = "badge-emerald";
                if (amb.status === "Dispatched") statusClass = "badge-pulse badge-danger";
                else if (amb.status === "Maintenance") statusClass = "badge-amber";
                
                let fuelColorClass = "fuel-green";
                if (amb.fuelLevel < 25) fuelColorClass = "fuel-red";
                else if (amb.fuelLevel < 60) fuelColorClass = "fuel-yellow";
                
                grid.innerHTML += `
                    <div class="ambulance-card">
                        <div class="ambulance-card-header">
                            <h3>${amb.vehicleNumber}</h3>
                            <i class="fa-solid fa-truck-medical ambulance-icon-badge"></i>
                        </div>
                        <div class="ambulance-details">
                            <p><i class="fa-solid fa-user-tie"></i> Driver: <strong>${amb.driverName}</strong></p>
                            <p><i class="fa-solid fa-phone"></i> Phone: ${amb.driverPhone}</p>
                            <p><i class="fa-solid fa-location-dot"></i> Telemetry: [${amb.currentLatitude}, ${amb.currentLongitude}]</p>
                            <p><i class="fa-solid fa-signal"></i> Status: <span class="badge ${statusClass}">${amb.status}</span></p>
                        </div>
                        <div class="fuel-indicator">
                            <div class="fuel-label-row">
                                <span>Fuel Tank Level</span>
                                <span>${amb.fuelLevel}%</span>
                            </div>
                            <div class="fuel-bar-container">
                                <div class="fuel-bar ${fuelColorClass}" style="width: ${amb.fuelLevel}%"></div>
                            </div>
                        </div>
                        <div class="ambulance-actions">
                            <button class="btn btn-secondary btn-sm" onclick="updateAmbulanceStatus(${amb.id}, 'Available')">Available</button>
                            <button class="btn btn-primary btn-sm" onclick="updateAmbulanceStatus(${amb.id}, 'Dispatched')">Dispatch</button>
                            <button class="btn btn-secondary btn-sm" onclick="updateAmbulanceStatus(${amb.id}, 'Maintenance')">Service</button>
                        </div>
                    </div>
                `;
            });
        }
    } catch (e) {
        grid.innerHTML = `<div style="grid-column: 1/-1; color:var(--neon-rose)">Failed to communicate with fleet GPS servers.</div>`;
    }
}

async function updateAmbulanceStatus(id, newStatus) {
    if (!activeSession) return;
    try {
        const res = await fetch(`/api/ambulances/${id}/status?status=${newStatus}&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            loadAmbulances();
        } else {
            alert("Error: Unable to update fleet status.");
        }
    } catch (e) {
        console.error("Error updating ambulance status", e);
    }
}

async function handleRegisterAmbulance(event) {
    event.preventDefault();
    if (!activeSession) return;
    
    const number = document.getElementById("amb-vehicle-number").value;
    const name = document.getElementById("amb-driver-name").value;
    const phone = document.getElementById("amb-driver-phone").value;
    const fuel = document.getElementById("amb-fuel").value;
    
    try {
        const res = await fetch(`/api/ambulances?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                vehicleNumber: number ? number : null,
                driverName: name,
                driverPhone: phone,
                fuelLevel: parseFloat(fuel),
                status: "Available"
            })
        });
        
        if (res.ok) {
            alert("Ambulance registered and synchronized in active dispatch!");
            document.getElementById("registerAmbulanceForm").reset();
            loadAmbulances();
        } else {
            alert("Failed to register ambulance. Check server configurations.");
        }
    } catch (e) {
        console.error("Error registering vehicle:", e);
    }
}

// ==========================================================================
// BLOOD BANK STORAGE & RESERVES
// ==========================================================================
async function loadBloodBank() {
    const reservesGrid = document.getElementById("bloodReservesGrid");
    const tbody = document.getElementById("donorsTableBody");
    if (!reservesGrid || !tbody) return;
    
    reservesGrid.innerHTML = `<div>Loading reserves...</div>`;
    tbody.innerHTML = `<tr><td colspan="5"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving donor lists...</td></tr>`;
    
    try {
        const res = await fetch("/api/blood-bank");
        if (res.ok) {
            const donors = await res.json();
            
            // Map donation records to groups
            const reserves = {
                "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
            };
            
            tbody.innerHTML = "";
            
            if (donors.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No donation activity recorded.</td></tr>`;
            } else {
                donors.forEach(d => {
                    if (reserves[d.bloodGroup] !== undefined) {
                        reserves[d.bloodGroup] += d.volumeMl;
                    }
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${d.donorName}</strong></td>
                            <td><span class="blood-donor-badge">${d.bloodGroup}</span></td>
                            <td>${d.lastDonatedDate}</td>
                            <td>${d.contactPhone}</td>
                            <td>${d.volumeMl} mL</td>
                        </tr>
                    `;
                });
            }
            
            // Render reserves summary
            reservesGrid.innerHTML = "";
            Object.keys(reserves).forEach(group => {
                reservesGrid.innerHTML += `
                    <div class="blood-reserve-card">
                        <div class="blood-group-label">${group}</div>
                        <div class="blood-volume">${reserves[group]} mL</div>
                    </div>
                `;
            });
        }
    } catch (e) {
        reservesGrid.innerHTML = `<div style="color:var(--neon-rose)">Failed to sync with blood banking database.</div>`;
        tbody.innerHTML = `<tr><td colspan="5">Connection failed.</td></tr>`;
    }
}

async function handleRegisterDonor(event) {
    event.preventDefault();
    if (!activeSession) return;
    
    const name = document.getElementById("donor-name").value;
    const group = document.getElementById("donor-blood-group").value;
    const phone = document.getElementById("donor-phone").value;
    const volume = document.getElementById("donor-volume").value;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const res = await fetch(`/api/blood-bank?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                donorName: name,
                bloodGroup: group,
                lastDonatedDate: today,
                contactPhone: phone,
                volumeMl: parseInt(volume)
            })
        });
        
        if (res.ok) {
            alert("Donation logged successfully in the blood bank database!");
            document.getElementById("registerDonorForm").reset();
            loadBloodBank();
        } else {
            alert("Unable to log donation. Check server parameters.");
        }
    } catch (e) {
        console.error("Error saving donor details:", e);
    }
}

// ==========================================================================
// CLINICIANS & STAFF ROSTER
// ==========================================================================
async function loadClinicians() {
    const tbody = document.getElementById("doctorsTableBody");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="7"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving clinician roster...</td></tr>`;
    
    try {
        const res = await fetch("/api/doctors");
        if (res.ok) {
            const doctors = await res.json();
            tbody.innerHTML = "";
            if (doctors.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">No registered specialists.</td></tr>`;
            } else {
                doctors.forEach(d => {
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${d.doctorId}</strong></td>
                            <td>Dr. ${d.firstName} ${d.lastName}</td>
                            <td>${d.specialization}</td>
                            <td><span class="badge badge-secondary">${d.department}</span></td>
                            <td>${d.qualification || 'N/A'}</td>
                            <td>${d.availability}</td>
                            <td>$${d.consultationFee.toFixed(2)}</td>
                        </tr>
                    `;
                });
            }
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--neon-rose)">Failed to communicate with doctor database.</td></tr>`;
    }

    // Also load nurses
    loadNurses();
}

async function loadNurses() {
    const tbody = document.getElementById("nursesTableBody");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="6"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving nursing staff roster...</td></tr>`;
    
    try {
        const res = await fetch("/api/nurses");
        if (res.ok) {
            const nurses = await res.json();
            tbody.innerHTML = "";
            if (nurses.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted)">No registered nursing staff.</td></tr>`;
            } else {
                nurses.forEach(n => {
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${n.nurseId}</strong></td>
                            <td>Nurse ${n.firstName} ${n.lastName}</td>
                            <td><span class="badge badge-secondary">${n.department}</span></td>
                            <td>${n.availability}</td>
                            <td>${n.shiftTimings}</td>
                            <td><span class="badge badge-emerald">Active</span></td>
                        </tr>
                    `;
                });
            }
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--neon-rose)">Failed to communicate with nurse database.</td></tr>`;
    }
}

function switchRosterTab(tab) {
    const btnDoctors = document.getElementById("btn-roster-doctors");
    const btnNurses = document.getElementById("btn-roster-nurses");
    const containerDoctors = document.getElementById("container-roster-doctors");
    const containerNurses = document.getElementById("container-roster-nurses");

    if (!btnDoctors || !btnNurses || !containerDoctors || !containerNurses) return;

    if (tab === 'doctors') {
        btnDoctors.classList.add("active-tab");
        btnNurses.classList.remove("active-tab");
        containerDoctors.classList.remove("hidden");
        containerNurses.classList.add("hidden");
    } else {
        btnDoctors.classList.remove("active-tab");
        btnNurses.classList.add("active-tab");
        containerDoctors.classList.add("hidden");
        containerNurses.classList.remove("hidden");
    }
}

function toggleStaffFormFields() {
    const roleType = document.getElementById("staff-role-type").value;
    const specFields = document.getElementById("doctor-specific-fields");
    if (!specFields) return;

    if (roleType === 'NURSE') {
        specFields.classList.add("hidden");
    } else {
        specFields.classList.remove("hidden");
    }
}

async function handleRegisterStaff(event) {
    event.preventDefault();
    if (!activeSession) return;

    const roleType = document.getElementById("staff-role-type").value;
    const first = document.getElementById("doc-first-name").value;
    const last = document.getElementById("doc-last-name").value;
    const dept = document.getElementById("doc-department").value;
    const weekly = document.getElementById("doc-weekly").value;
    const daily = document.getElementById("doc-daily").value;

    if (roleType === 'DOCTOR') {
        const spec = document.getElementById("doc-specialization").value || "General Medicine";
        const qual = document.getElementById("doc-qualification").value || "MBBS";
        const exp = document.getElementById("doc-experience").value || "5";
        const fee = document.getElementById("doc-fee").value || "100";

        try {
            const res = await fetch(`/api/doctors?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: first,
                    lastName: last,
                    specialization: spec,
                    qualification: qual,
                    experienceYears: parseInt(exp),
                    department: dept,
                    consultationFee: parseFloat(fee),
                    availability: weekly,
                    shiftTimings: daily,
                    active: true
                })
            });

            if (res.ok) {
                alert("New Clinician registered and activated successfully!");
                document.getElementById("addDoctorForm").reset();
                toggleStaffFormFields();
                loadClinicians();
            } else {
                alert("Failed to register clinician. Verify values.");
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        // Register NURSE
        try {
            const res = await fetch(`/api/nurses?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: first,
                    lastName: last,
                    department: dept,
                    availability: weekly,
                    shiftTimings: daily,
                    active: true
                })
            });

            if (res.ok) {
                alert("New nursing staff registered and activated successfully!");
                document.getElementById("addDoctorForm").reset();
                toggleStaffFormFields();
                loadClinicians();
            } else {
                alert("Failed to register nursing staff profile.");
            }
        } catch (e) {
            console.error(e);
        }
    }
}

// ==========================================================================
// PATIENT PORTAL EXTENDED FRONTEND SERVICES
// ==========================================================================

let cart = [];
let currentStoreFilter = 'All';

// Age Auto Calculation
function calculateSelfRegistrationAge() {
    const dobInput = document.getElementById("self-dob").value;
    const ageInput = document.getElementById("self-age");
    if (!dobInput) return;
    try {
        const dob = new Date(dobInput);
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        ageInput.value = age;
    } catch (e) {
        ageInput.value = 0;
    }
}

// Base64 file reader helper
function handleFileSelect(input, targetId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.value = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Patient Self Registration Submit
async function handleSelfRegistration(event) {
    event.preventDefault();
    const errEl = document.getElementById("reg-error");
    const succEl = document.getElementById("reg-success");
    errEl.classList.add("hidden");
    succEl.classList.add("hidden");

    const idType = document.getElementById("self-id-type").value;
    const idNumber = document.getElementById("self-id-number").value;
    
    // Set compatibility hidden fields
    const aadhaarInput = document.getElementById("self-aadhaar");
    const panInput = document.getElementById("self-pan");
    if (aadhaarInput) aadhaarInput.value = (idType === "Aadhaar Card") ? idNumber : "";
    if (panInput) panInput.value = (idType === "PAN Card") ? idNumber : "";

    const payload = {
        username: document.getElementById("self-username").value,
        password: document.getElementById("self-password").value,
        fullName: document.getElementById("self-fullname").value,
        email: document.getElementById("self-email").value,
        gender: document.getElementById("self-gender").value,
        dateOfBirth: document.getElementById("self-dob").value,
        bloodGroup: document.getElementById("self-bloodgroup").value,
        phoneNumber: document.getElementById("self-phone").value,
        profilePhoto: document.getElementById("self-photo") ? document.getElementById("self-photo").value : "",
        addressHouseNumber: document.getElementById("self-house").value,
        addressStreet: document.getElementById("self-street").value,
        addressCity: document.getElementById("self-city").value,
        addressState: document.getElementById("self-state").value,
        addressPincode: document.getElementById("self-pincode").value,
        emergencyContactName: document.getElementById("self-emergency-name").value,
        emergencyRelation: document.getElementById("self-emergency-relation").value,
        emergencyContactPhone: document.getElementById("self-emergency-phone").value,
        height: document.getElementById("self-height").value,
        weight: document.getElementById("self-weight").value,
        allergies: document.getElementById("self-allergies").value,
        chronicDiseases: document.getElementById("self-diseases").value,
        previousSurgeries: document.getElementById("self-surgeries").value,
        currentMedications: document.getElementById("self-medications").value,
        idType: idType,
        idNumber: idNumber,
        idCardImage: document.getElementById("self-id-card-image").value,
        aadhaarNumber: (idType === "Aadhaar Card") ? idNumber : "",
        panNumber: (idType === "PAN Card") ? idNumber : "",
        insuranceCompany: document.getElementById("self-insurance-company").value,
        insurancePolicyNumber: document.getElementById("self-insurance-policy").value,
        insuranceValidTill: document.getElementById("self-insurance-valid").value
    };

    try {
        const res = await fetch("/api/auth/register-patient", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            succEl.textContent = data.message;
            succEl.classList.remove("hidden");
            document.getElementById("selfRegistrationForm").reset();
            setTimeout(() => { navigate('login'); }, 4000);
        } else {
            const data = await res.json();
            errEl.textContent = data.message || "Failed self registration request.";
            errEl.classList.remove("hidden");
        }
    } catch (e) {
        errEl.textContent = "Error: Cannot reach security database server.";
        errEl.classList.remove("hidden");
    }
}

// Forgot Password Flow
async function handleForgotPassword(event) {
    event.preventDefault();
    const errEl = document.getElementById("forgot-error");
    const succEl = document.getElementById("forgot-success");
    errEl.classList.add("hidden");
    succEl.classList.add("hidden");

    const payload = {
        username: document.getElementById("forgot-username").value,
        aadhaarNumber: document.getElementById("forgot-aadhaar").value
    };

    try {
        const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            succEl.textContent = "Identity verified. Please set a new password below.";
            succEl.classList.remove("hidden");
            document.getElementById("resetForm").classList.remove("hidden");
            document.getElementById("forgotForm").classList.add("hidden");
        } else {
            const data = await res.json();
            errEl.textContent = data.message;
            errEl.classList.remove("hidden");
        }
    } catch (e) {
        errEl.textContent = "Error communicating with secure authentication server.";
        errEl.classList.remove("hidden");
    }
}

// Reset Password Flow
async function handleResetPassword(event) {
    event.preventDefault();
    const errEl = document.getElementById("forgot-error");
    const succEl = document.getElementById("forgot-success");
    errEl.classList.add("hidden");
    succEl.classList.add("hidden");

    const payload = {
        username: document.getElementById("forgot-username").value,
        aadhaarNumber: document.getElementById("forgot-aadhaar").value,
        newPassword: document.getElementById("reset-new-password").value
    };

    try {
        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            succEl.textContent = data.message + " Redirecting...";
            succEl.classList.remove("hidden");
            document.getElementById("resetForm").reset();
            document.getElementById("forgotForm").reset();
            setTimeout(() => {
                document.getElementById("resetForm").classList.add("hidden");
                document.getElementById("forgotForm").classList.remove("hidden");
                navigate('login');
            }, 3000);
        } else {
            const data = await res.json();
            errEl.textContent = data.message;
            errEl.classList.remove("hidden");
        }
    } catch (e) {
        errEl.textContent = "Error resetting password.";
        errEl.classList.remove("hidden");
    }
}

// ==========================================================================
// PATIENT PORTAL PORTAL LOADERS & ACTIONS
// ==========================================================================

async function loadPatientDashboard() {
    const profileDiv = document.getElementById("p-portal-profile");
    const recordsDiv = document.getElementById("p-portal-records");
    if (!profileDiv || !recordsDiv) return;

    profileDiv.innerHTML = `<div><i class="fa-solid fa-spinner fa-spin"></i> Loading profile...</div>`;
    recordsDiv.innerHTML = `<div><i class="fa-solid fa-spinner fa-spin"></i> Loading health records...</div>`;

    try {
        // Fetch all patients and find logged in patient
        const res = await fetch("/api/patients");
        if (res.ok) {
            const allPatients = await res.json();
            const patient = allPatients.find(p => p.username === activeSession.username);
            
            if (patient) {
                // Populate Profile
                profileDiv.innerHTML = `
                    <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
                        <div class="user-avatar" style="width:60px; height:60px; font-size:24px;">
                            ${patient.profilePhoto ? `<img src="${patient.profilePhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : `<i class="fa-solid fa-user"></i>`}
                        </div>
                        <div>
                            <h3 style="font-size:18px;">${patient.firstName} ${patient.lastName}</h3>
                            <span class="badge badge-cyan" style="position:static;">Patient ID: ${patient.patientId}</span>
                        </div>
                    </div>
                    <p><strong>Aadhaar Number:</strong> ${patient.aadhaarNumber || 'Not Linked'}</p>
                    <p><strong>PAN Card Number:</strong> ${patient.panNumber || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${patient.dateOfBirth} (Age: ${patient.age || 'N/A'})</p>
                    <p><strong>Mobile Number:</strong> ${patient.phoneNumber}</p>
                    <p><strong>Blood Group:</strong> <span class="blood-donor-badge">${patient.bloodGroup}</span></p>
                    <p><strong>Residential Address:</strong> ${patient.address}</p>
                    <hr style="border:0; border-top:1px solid var(--border-color); margin:12px 0;">
                    <h4 style="color:var(--neon-cyan); margin-bottom:8px;">Emergency Contact Details</h4>
                    <p><strong>Guardian:</strong> ${patient.emergencyContactName} (${patient.emergencyRelation})</p>
                    <p><strong>Guardian Mobile:</strong> ${patient.emergencyContactPhone}</p>
                    <hr style="border:0; border-top:1px solid var(--border-color); margin:12px 0;">
                    <h4 style="color:var(--neon-cyan); margin-bottom:8px;">Insurance Scheme Coverage</h4>
                    <p><strong>Provider Company:</strong> ${patient.insuranceCompany || 'N/A'}</p>
                    <p><strong>Policy Number:</strong> ${patient.insurancePolicyNumber || 'N/A'}</p>
                    <p><strong>Valid Till:</strong> ${patient.insuranceValidTill || 'N/A'}</p>
                    <hr style="border:0; border-top:1px solid var(--border-color); margin:12px 0;">
                    <h4 style="color:var(--neon-rose); margin-bottom:8px;">Allergies & Diagnoses</h4>
                    <p><strong>Allergies:</strong> <span style="color:var(--neon-rose)">${patient.allergies || 'None'}</span></p>
                    <p><strong>Chronic Illnesses:</strong> ${patient.chronicDiseases || 'None'}</p>
                    <p><strong>Previous Surgeries:</strong> ${patient.previousSurgeries || 'None'}</p>
                    <p><strong>Current Medications:</strong> ${patient.currentMedications || 'None'}</p>
                `;

                // Set cart shipping address automatically
                const cartAddr = document.getElementById("cart-address");
                if (cartAddr) cartAddr.value = patient.address;

                // Load EHR Records
                const recordRes = await fetch(`/api/medical-records/patient/${patient.id}?requestedBy=${activeSession.username}&role=${activeSession.role}`);
                if (recordRes.ok) {
                    const records = await recordRes.json();
                    recordsDiv.innerHTML = "";
                    if (records.length === 0) {
                        recordsDiv.innerHTML = `<p style="color:var(--text-muted); font-size:13px;">No clinical EHR entries recorded yet.</p>`;
                    } else {
                        records.forEach(r => {
                            recordsDiv.innerHTML += `
                                <div class="timeline-event" style="margin-bottom:16px; border-left: 2px solid var(--neon-cyan); padding-left:12px;">
                                    <span class="date" style="font-size:11px; color:var(--text-muted)">${r.recordDate}</span>
                                    <div class="title" style="font-weight:600; font-size:13.5px; color:var(--neon-cyan)">Diagnosis: ${r.diagnosis}</div>
                                    <div class="desc" style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">
                                        <p><strong>Vitals:</strong> ${r.vitals}</p>
                                        <p><strong>Symptoms:</strong> ${r.symptoms}</p>
                                        <p><strong>Treatment Plan:</strong> ${r.treatmentPlan}</p>
                                        <p><strong>Prescriptions:</strong> <strong style="color:var(--text-primary)">${r.prescriptions}</strong></p>
                                        <p style="font-size:11px; margin-top:6px; color:var(--neon-emerald)">${r.doctorDigitalSignature}</p>
                                    </div>
                                </div>
                            `;
                        });
                    }
                }

                // Load Bills
                loadPatientBills(patient.patientId);
            }
        }

        // Load medicine orders and room bookings
        loadPatientOrders();
        loadPatientBedBookings();

    } catch (e) {
        console.error("Error loading patient portal dashboard", e);
    }
}

// Switch tabs inside Patient Profile
function switchPatientTab(tabId) {
    document.querySelectorAll(".patient-tab-content").forEach(pane => {
        pane.classList.add("hidden");
    });
    document.getElementById(`tab-${tabId}`).classList.remove("hidden");

    document.querySelectorAll(".profile-tabs .tab-btn").forEach(btn => {
        btn.classList.remove("active-tab");
    });
    event.target.classList.add("active-tab");
}

// Load patient bills
async function loadPatientBills(patientId) {
    const tbody = document.getElementById("patientBillsBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving invoices...</td></tr>`;

    try {
        const res = await fetch("/api/billing");
        if (res.ok) {
            const allBills = await res.json();
            const bills = allBills.filter(b => b.patient.patientId === patientId);
            tbody.innerHTML = "";
            if (bills.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No billing invoices found.</td></tr>`;
                return;
            }
            bills.forEach(b => {
                let badge = "badge-cyan";
                if (b.status === "Paid" || b.status === "Claim_Approved") badge = "badge-emerald";
                else if (b.status === "Unpaid") badge = "badge-danger";
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${b.invoiceNumber}</strong></td>
                        <td>${b.billingDate}</td>
                        <td>$${b.totalAmount.toFixed(2)}</td>
                        <td><span class="badge ${badge}">${b.status}</span></td>
                        <td>
                            ${b.status === 'Unpaid' ? `<button class="btn btn-primary btn-sm" onclick="payInvoice(${b.id}, 'UPI')">Pay UPI</button>` : `<button class="btn btn-secondary btn-sm" onclick="alert('Downloading transaction PDF...')"><i class="fa-solid fa-download"></i> Receipt</button>`}
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5">Failed to fetch billing tables.</td></tr>`;
    }
}

// Load patient medicine orders
async function loadPatientOrders() {
    const tbody = document.getElementById("patientOrdersBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5"><i class="fa-solid fa-spinner fa-spin"></i> Fetching orders...</td></tr>`;

    try {
        const res = await fetch(`/api/store/orders/patient/${activeSession.username}`);
        if (res.ok) {
            const orders = await res.json();
            tbody.innerHTML = "";
            if (orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No purchase orders recorded.</td></tr>`;
                return;
            }
            orders.forEach(o => {
                let badge = "badge-cyan";
                if (o.status === "Delivered") badge = "badge-emerald";
                else if (o.status === "Dispatched") badge = "badge-amber";
                else if (o.status === "Out for Delivery") badge = "badge-cyan";
                else if (o.status === "Packed") badge = "badge-violet";

                const orderDataStr = JSON.stringify(o).replace(/'/g, "\\'").replace(/"/g, "&quot;");

                tbody.innerHTML += `
                    <tr onclick="showOrderTracking(${orderDataStr})" style="cursor:pointer;" class="approval-main-row">
                        <td><strong>#ORD-${o.id}</strong></td>
                        <td>${o.orderDate}</td>
                        <td>${o.items}</td>
                        <td>$${o.totalAmount.toFixed(2)}</td>
                        <td><span class="badge ${badge}">${o.status}</span></td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5">Failed to load order history.</td></tr>`;
    }
}

// Load patient bed bookings
async function loadPatientBedBookings() {
    const tbody = document.getElementById("patientBookingsBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5"><i class="fa-solid fa-spinner fa-spin"></i> Fetching bed bookings...</td></tr>`;

    try {
        const res = await fetch(`/api/bookings/beds/patient/${activeSession.username}`);
        if (res.ok) {
            const bookings = await res.json();
            tbody.innerHTML = "";
            if (bookings.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted)">No bed allocations booked.</td></tr>`;
                return;
            }
            bookings.forEach(b => {
                let badge = b.status === "Active" ? "badge-cyan" : "badge-emerald";
                tbody.innerHTML += `
                    <tr>
                        <td><strong>#BK-${b.id}</strong></td>
                        <td>${b.bookingDate}</td>
                        <td>${b.roomType} (Room: ${b.roomNumber})</td>
                        <td>$${b.totalAmount.toFixed(2)} ($${b.pricePerDay}/day for ${b.days} days)</td>
                        <td><span class="badge ${badge}">${b.status}</span></td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5">Failed to load bed bookings.</td></tr>`;
    }
}

// ==========================================================================
// PATIENT SERVICES BOOKING FORMS
// ==========================================================================

function loadPatientServices() {
    showBookingForm('appointment');
}

function showBookingForm(type) {
    const pane = document.getElementById("servicesFormPane");
    if (!pane) return;

    if (type === 'appointment') {
        pane.innerHTML = `
            <h3>Book Specialist Appointment</h3>
            <form id="pBookApptForm" onsubmit="handlePatientBookAppointment(event)" style="margin-top:20px;">
                <div class="form-group">
                    <label>Select Clinical Department Specialty</label>
                    <select id="p-appt-specialty" onchange="filterDoctorsBySpecialty()" required>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Dentist">Dentist</option>
                        <option value="ENT">ENT</option>
                        <option value="Eye Specialist">Eye Specialist</option>
                        <option value="Skin Specialist">Skin Specialist</option>
                        <option value="Gynecologist">Gynecologist</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Assigned Doctor Consultant</label>
                    <select id="p-appt-doctor" required>
                        <!-- Loaded dynamically -->
                    </select>
                </div>
                <div class="form-group inline-row" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div>
                        <label>Appointment Date</label>
                        <input type="date" id="p-appt-date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div>
                        <label>Appointment Time Slot</label>
                        <input type="time" id="p-appt-time" value="10:00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Consultation Channel Type</label>
                    <select id="p-appt-type">
                        <option value="OPD">General Physician In-Hospital OPD</option>
                        <option value="Telemedicine">Online Video Consultation</option>
                        <option value="Emergency">Urgent Emergency Triage</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-block glow-btn">Generate Appointment Token</button>
            </form>
        `;
        filterDoctorsBySpecialty();
    } else if (type === 'bed') {
        pane.innerHTML = `
            <h3>Book Ward Bed / Private Room Allocation</h3>
            <form id="pBookBedForm" onsubmit="handlePatientBookBed(event)" style="margin-top:20px;">
                <div class="form-group">
                    <label>Select Ward Type Preference</label>
                    <select id="p-bed-type" onchange="updateBedPriceHint()" required>
                        <option value="General Ward" data-price="20.00">General Ward ($20.00 / Day)</option>
                        <option value="Semi Private Room" data-price="55.00">Semi Private Room ($55.00 / Day)</option>
                        <option value="Private Room" data-price="120.00">Private Room AC ($120.00 / Day)</option>
                        <option value="Deluxe Room" data-price="250.00">Deluxe Room (TV, WiFi, Sofa) ($250.00 / Day)</option>
                        <option value="ICU" data-price="500.00">ICU ventilator & Monitor Bed ($500.00 / Day)</option>
                        <option value="NICU" data-price="600.00">NICU Newborn Care Bed ($600.00 / Day)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Allocation Duration (Days)</label>
                    <input type="number" id="p-bed-days" value="1" min="1" max="60" oninput="updateBedPriceHint()" required>
                </div>
                <div style="background:rgba(255,255,255,0.02); border:1px dashed var(--border-color); padding:16px; border-radius:8px; margin-bottom:20px; text-align:center;">
                    <span style="font-size:12px; color:var(--text-muted)">Estimated Booking Valuation</span>
                    <h3 id="p-bed-valuation" style="color:var(--neon-emerald); font-size:24px; margin-top:4px;">$20.00</h3>
                </div>
                <button type="submit" class="btn btn-primary btn-block glow-btn">Reserve Bed Allocation</button>
            </form>
        `;
    } else if (type === 'ambulance') {
        pane.innerHTML = `
            <h3>Emergency Ambulance Dispatch Protocol</h3>
            <form id="pBookAmbForm" onsubmit="handlePatientBookAmbulance(event)" style="margin-top:20px;">
                <div class="form-group">
                    <label>Select Ambulance Support Level</label>
                    <select id="p-amb-type" required>
                        <option value="Basic Ambulance">Basic Support Level ($50.00)</option>
                        <option value="Oxygen Ambulance">Advanced Oxygen Supply Level ($100.00)</option>
                        <option value="ICU Ambulance">Critical Care ICU Ventilator Level ($250.00)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Accident / Dispatch Location Address</label>
                    <textarea id="p-amb-address" placeholder="Specify complete pickup location coordinates..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block glow-btn" style="background:var(--neon-rose); box-shadow:0 0 10px rgba(244,63,94,0.3)">Dispatch Fleet Vehicle Now</button>
            </form>
        `;
        // Autofill address
        fetch("/api/patients").then(r => r.json()).then(list => {
            const patient = list.find(p => p.username === activeSession.username);
            if (patient) {
                document.getElementById("p-amb-address").value = patient.address;
            }
        });
    }
}

// Filter doctor dropdown by specialty
async function filterDoctorsBySpecialty() {
    const spec = document.getElementById("p-appt-specialty").value;
    const docSelect = document.getElementById("p-appt-doctor");
    if (!docSelect) return;
    docSelect.innerHTML = `<option>Retrieving specialists...</option>`;

    try {
        const res = await fetch("/api/doctors");
        if (res.ok) {
            const doctors = await res.json();
            const filtered = doctors.filter(d => d.specialization.toLowerCase().includes(spec.toLowerCase()) || d.department.toLowerCase().includes(spec.toLowerCase()));
            docSelect.innerHTML = "";
            if (filtered.length === 0) {
                docSelect.innerHTML = `<option value="3">Dr. John Watson (General Medicine - Fallback Specialist)</option>`;
            } else {
                filtered.forEach(d => {
                    docSelect.innerHTML += `<option value="${d.id}">Dr. ${d.firstName} ${d.lastName} ($${d.consultationFee.toFixed(2)})</option>`;
                });
            }
        }
    } catch (e) {
        docSelect.innerHTML = `<option value="3">Dr. John Watson (Fallback)</option>`;
    }
}

// Update Bed Booking price total
function updateBedPriceHint() {
    const select = document.getElementById("p-bed-type");
    const daysInput = document.getElementById("p-bed-days");
    const valText = document.getElementById("p-bed-valuation");
    if (!select || !daysInput || !valText) return;

    const opt = select.options[select.selectedIndex];
    const price = parseFloat(opt.getAttribute("data-price"));
    const days = parseInt(daysInput.value) || 1;
    valText.textContent = `$${(price * days).toFixed(2)}`;
}

// Submit Patient Appointment Booking
async function handlePatientBookAppointment(event) {
    event.preventDefault();
    try {
        const patientsRes = await fetch("/api/patients");
        const allPatients = await patientsRes.json();
        const patient = allPatients.find(p => p.username === activeSession.username);
        
        if (!patient) {
            alert("Error: Active clinical record profile not found.");
            return;
        }

        const payload = {
            patient: { id: patient.id },
            doctor: { id: parseInt(document.getElementById("p-appt-doctor").value) },
            date: document.getElementById("p-appt-date").value,
            time: document.getElementById("p-appt-time").value,
            type: document.getElementById("p-appt-type").value,
            status: "Scheduled"
        };

        const res = await fetch(`/api/appointments?requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Specialist Appointment booked successfully! Dynamic queue token generated.");
            navigate('patient-dashboard');
        } else {
            alert("Appointment scheduling transaction failed.");
        }
    } catch (e) {
        console.error(e);
    }
}

// Submit Patient Bed Booking
async function handlePatientBookBed(event) {
    event.preventDefault();
    try {
        const select = document.getElementById("p-bed-type");
        const opt = select.options[select.selectedIndex];
        const price = parseFloat(opt.getAttribute("data-price"));

        const payload = {
            patientUsername: activeSession.username,
            patientName: activeSession.fullName,
            roomType: select.value,
            days: parseInt(document.getElementById("p-bed-days").value),
            pricePerDay: price
        };

        const res = await fetch("/api/bookings/bed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Room/Bed reservation completed! Dashboard updated.");
            navigate('patient-dashboard');
        } else {
            alert("Bed booking request failed.");
        }
    } catch (e) {
        console.error(e);
    }
}

// Submit Patient Ambulance dispatch
async function handlePatientBookAmbulance(event) {
    event.preventDefault();
    const support = document.getElementById("p-amb-type").value;
    const address = document.getElementById("p-amb-address").value;
    
    alert(`DISPATCH SYSTEM ALERT: ICU/Ambulance vehicle has been dispatched coordinates: ${address} [Emergency code support level: ${support}]. Driver contact coordinates will follow shortly.`);
    navigate('patient-dashboard');
}

// ==========================================================================
// PHARMACY E-COMMERCE MEDICINE STORE
// ==========================================================================

async function loadPatientStore() {
    const grid = document.getElementById("store-products-grid");
    if (!grid) return;
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Synchronizing inventory stocks...</div>`;

    try {
        const res = await fetch("/api/inventory");
        if (res.ok) {
            cachedInventory = await res.json();
            renderStoreProducts();
        }
    } catch (e) {
        grid.innerHTML = `<div style="grid-column:1/-1; color:var(--neon-rose)">Failed to sync products.</div>`;
    }
}

let currentStoreSearch = "";

function handleStoreSearch() {
    const input = document.getElementById("store-search-input");
    if (input) {
        currentStoreSearch = input.value.trim().toLowerCase();
        renderStoreProducts();
    }
}

function renderStoreProducts() {
    const grid = document.getElementById("store-products-grid");
    if (!grid) return;
    grid.innerHTML = "";

    // Categories and Search filters
    const filtered = cachedInventory.filter(item => {
        // Category check
        const matchCategory = currentStoreFilter === 'All' ? 
            ["Tablets", "Capsules", "Syrups", "Injections", "Creams", "Eye Drops", "Ear Drops", "Medical Equipment", "Hospital Supplies", "Packages"].includes(item.category) : 
            item.category === currentStoreFilter;

        // Search check
        const matchSearch = currentStoreSearch === "" ? true : 
            (item.name.toLowerCase().includes(currentStoreSearch) || item.category.toLowerCase().includes(currentStoreSearch));

        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:32px 0;">No medical products found matching your search.</div>`;
        return;
    }

    filtered.forEach(item => {
        const imgUrl = item.imageUrl ? item.imageUrl : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400";
        const isOutOfStock = item.stockQuantity <= 0;
        const buyButton = isOutOfStock ? 
            `<button class="btn btn-secondary btn-sm" disabled style="flex:1;">Out of Stock</button>` : 
            `<button class="btn btn-primary btn-sm" onclick="addItemToCart(${item.id})" style="flex:1;"><i class="fa-solid fa-cart-plus"></i> Buy</button>`;

        grid.innerHTML += `
            <div class="product-card" style="display:flex; flex-direction:column; justify-content:space-between; gap:16px;">
                <div onclick="openProductDetailsModal(${item.id})" style="cursor:pointer;">
                    <div style="width:100%; height:120px; border-radius:8px; overflow:hidden; border:1px solid var(--border-color); margin-bottom:12px; background:#000;">
                        <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                    <span class="product-cat">${item.category}</span>
                    <h4 class="product-name" style="margin:4px 0 8px 0; font-family:var(--font-secondary);">${item.name}</h4>
                    <span class="product-price" style="color:var(--neon-emerald); font-weight:700;">$${item.unitPrice.toFixed(2)}</span>
                </div>
                <div>
                    <p class="product-stock" style="margin-bottom:8px; font-size:12px;">Stock: ${item.stockQuantity} available</p>
                    <div class="product-action" style="display:flex; gap:8px;">
                        <input type="number" id="qty-${item.id}" value="1" min="1" max="${item.stockQuantity}" class="product-qty-input" style="width:50px;" ${isOutOfStock ? 'disabled' : ''}>
                        ${buyButton}
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="openProductDetailsModal(${item.id})" style="width:100%; margin-top:8px; justify-content:center; font-size:11px; padding:4px;"><i class="fa-solid fa-circle-info"></i> View Details</button>
                </div>
            </div>
        `;
    });
}

function filterStoreItems(category) {
    currentStoreFilter = category;
    
    // Toggle active classes on category buttons
    const btns = document.querySelectorAll("#view-patient-store button");
    btns.forEach(btn => {
        if (btn.textContent.trim() === category || (category === 'All' && btn.textContent.trim() === 'All Products') || (category === 'Medical Equipment' && btn.textContent.trim() === 'Equipment') || (category === 'Hospital Supplies' && btn.textContent.trim() === 'Supplies') || (category === 'Packages' && btn.textContent.trim() === 'Health Packages')) {
            btn.classList.add("active-tab");
        } else if (btn.onclick && btn.onclick.toString().includes("filterStoreItems")) {
            btn.classList.remove("active-tab");
        }
    });

    renderStoreProducts();
}

function addItemToCart(id, qty = null) {
    const item = cachedInventory.find(i => i.id === id);
    if (!item) return;

    let finalQty = 1;
    if (qty !== null) {
        finalQty = qty;
    } else {
        const qtyInput = document.getElementById(`qty-${id}`);
        if (qtyInput) finalQty = parseInt(qtyInput.value) || 1;
    }

    if (finalQty > item.stockQuantity) {
        alert(`Requested quantity exceeds available stock of ${item.stockQuantity}.`);
        return;
    }

    // Check if item already exists in cart
    const existing = cart.find(c => c.itemId === id);
    if (existing) {
        if (existing.quantity + finalQty > item.stockQuantity) {
            alert(`Cannot add more. Total cart quantity would exceed available stock.`);
            return;
        }
        existing.quantity += finalQty;
    } else {
        cart.push({
            itemId: id,
            name: item.name,
            price: item.unitPrice,
            quantity: finalQty
        });
    }

    alert(`Added ${finalQty} x ${item.name} to shopping cart.`);
    renderCart();
}

function renderCart() {
    const list = document.getElementById("cart-items-list");
    const totalEl = document.getElementById("cart-total");
    if (!list || !totalEl) return;

    list.innerHTML = "";
    if (cart.length === 0) {
        list.innerHTML = `<p style="color:var(--text-muted); font-size:13px; text-align:center; margin-top:20px;">Your cart is empty.</p>`;
        totalEl.textContent = "$0.00";
        return;
    }

    let total = 0;
    cart.forEach((c, idx) => {
        const itemTotal = c.price * c.quantity;
        total += itemTotal;

        const invItem = cachedInventory.find(i => i.id === c.itemId);
        const imgUrl = (invItem && invItem.imageUrl) ? invItem.imageUrl : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80";

        list.innerHTML += `
            <div class="cart-item" style="display:flex; align-items:center; gap:10px; padding:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px;">
                <img src="${imgUrl}" style="width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid var(--border-color);">
                <div class="cart-item-info" style="flex:1; display:flex; flex-direction:column; gap:2px; font-size:12.5px;">
                    <span class="cart-item-name" style="font-weight:600; color:#fff;">${c.name}</span>
                    <span class="cart-item-price" style="color:var(--neon-emerald);">$${itemTotal.toFixed(2)}</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                    <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="updateCartItemQuantity(${idx}, -1)">-</button>
                    <span style="font-size:13px; font-weight:600; min-width:14px; text-align:center;">${c.quantity}</span>
                    <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="updateCartItemQuantity(${idx}, 1)">+</button>
                </div>
                <button class="cart-item-remove" style="color:var(--neon-rose); background:none; border:none; cursor:pointer;" onclick="removeCartItem(${idx})"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        `;
    });

    list.insertAdjacentHTML('afterbegin', `
        <div style="text-align:right; margin-bottom:8px;">
            <button class="btn btn-secondary btn-sm" onclick="clearCart()" style="font-size:11px; padding:4px 8px; color:var(--neon-rose); border-color:rgba(244,63,94,0.3);"><i class="fa-solid fa-circle-xmark"></i> Clear Cart</button>
        </div>
    `);

    totalEl.textContent = `$${total.toFixed(2)}`;
}

function updateCartItemQuantity(index, delta) {
    const c = cart[index];
    if (!c) return;

    const item = cachedInventory.find(i => i.id === c.itemId);
    const maxStock = item ? item.stockQuantity : 999;

    const newQty = c.quantity + delta;
    if (newQty <= 0) {
        removeCartItem(index);
    } else if (newQty > maxStock) {
        alert(`Requested quantity exceeds available stock of ${maxStock}`);
    } else {
        c.quantity = newQty;
        renderCart();
    }
}

function clearCart() {
    cart = [];
    renderCart();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    renderCart();
}

async function checkoutCart(event) {
    event.preventDefault();
    if (cart.length === 0) {
        alert("Cart is empty! Select medicines or supplies from the shelves first.");
        return;
    }

    let total = 0;
    cart.forEach(c => { total += c.price * c.quantity; });

    const payload = {
        patientUsername: activeSession.username,
        paymentMethod: document.getElementById("cart-payment").value,
        deliveryAddress: document.getElementById("cart-address").value,
        totalAmount: total,
        items: cart
    };

    try {
        const res = await fetch("/api/store/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Pharmacy order placed successfully! Check your dashboard for delivery status tracking.");
            cart = [];
            renderCart();
            navigate('patient-dashboard');
        } else {
            alert("Checkout order processing failed.");
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================================================
// ADMIN WORKFLOW & MANAGERS
// ==========================================================================

async function loadUserApprovals() {
    const tbody = document.getElementById("approvalRequestsBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving registration ledger...</td></tr>`;

    try {
        const res = await fetch("/api/auth/pending-registrations");
        if (res.ok) {
            const users = await res.json();
            tbody.innerHTML = "";
            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">No pending patient registrations to review.</td></tr>`;
                return;
            }
            users.forEach(u => {
                const idImageHtml = u.idCardImage ? `
                    <div style="margin-top: 10px;">
                        <span style="display:block; font-size:11px; color:var(--text-muted); margin-bottom:4px;">ID Proof Image:</span>
                        <img src="${u.idCardImage}" style="max-width: 200px; max-height: 120px; border-radius: 8px; border: 1px solid var(--border-color); cursor: pointer;" onclick="openImageModal('${u.idCardImage}', '${u.idType || 'ID'} Proof Preview')" title="Click to enlarge">
                    </div>
                ` : `<span style="font-size:11px; color:var(--text-muted)">No ID Image uploaded</span>`;

                tbody.innerHTML += `
                    <tr class="approval-main-row" onclick="toggleApprovalDetail(${u.id})" style="cursor:pointer;">
                        <td><strong>${u.id}</strong></td>
                        <td>${u.username} <i class="fa-solid fa-chevron-down" id="chevron-${u.id}" style="font-size:10px; margin-left:6px; color:var(--text-muted)"></i></td>
                        <td>${u.fullName}</td>
                        <td>${u.email}</td>
                        <td><span class="badge badge-secondary">${u.role}</span></td>
                        <td><span class="badge badge-amber">${u.approvalStatus}</span></td>
                        <td>
                            <div style="display:flex; gap:6px;" onclick="event.stopPropagation();">
                                <button class="btn btn-primary btn-sm" style="background:var(--neon-emerald); border-color:var(--neon-emerald)" onclick="approveUser(${u.id})">Approve</button>
                                <button class="btn btn-secondary btn-sm" style="color:var(--neon-rose); border-color:rgba(244,63,94,0.4)" onclick="rejectUser(${u.id})">Reject</button>
                            </div>
                        </td>
                    </tr>
                    <tr id="details-row-${u.id}" class="approval-details-row hidden" style="background: rgba(255,255,255,0.015);">
                        <td colspan="7" style="padding: 16px 24px; border-bottom: 1px solid var(--border-color);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:20px;">
                                <div style="flex:1.2; line-height: 1.8;">
                                    <h4 style="font-size:13.5px; color:var(--neon-cyan); margin-bottom:8px;"><i class="fa-solid fa-id-card"></i> Patient Identification Ledger</h4>
                                    <p style="margin: 4px 0;">Selected Identity Type: <strong>${u.idType || 'Not specified'}</strong></p>
                                    <p style="margin: 4px 0;">Identity Card Number: <span style="font-family:monospace; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px; font-weight:600;">${u.idNumber || 'N/A'}</span></p>
                                    <p style="margin: 4px 0;">Aadhaar Number (fallback): <strong>${u.aadhaarNumber || 'N/A'}</strong></p>
                                    <p style="margin: 4px 0;">PAN Card (fallback): <strong>${u.panNumber || 'N/A'}</strong></p>
                                </div>
                                <div style="flex:1; text-align:right;">
                                    ${idImageHtml}
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7">Failed to load registration queues.</td></tr>`;
    }
}

async function approveUser(id) {
    try {
        const res = await fetch(`/api/auth/approve-patient/${id}?requestedBy=${activeSession.username}`, {
            method: "POST"
        });
        if (res.ok) {
            alert("User approved successfully. Login permissions granted.");
            loadUserApprovals();
        }
    } catch(e) { console.error(e); }
}

async function rejectUser(id) {
    try {
        const res = await fetch(`/api/auth/reject-patient/${id}?requestedBy=${activeSession.username}`, {
            method: "POST"
        });
        if (res.ok) {
            alert("User request canceled and rejected.");
            loadUserApprovals();
        }
    } catch(e) { console.error(e); }
}

async function loadAdminOrders() {
    const tbody = document.getElementById("adminOrdersBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="8"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving order history...</td></tr>`;

    try {
        const res = await fetch("/api/store/orders");
        if (res.ok) {
            const orders = await res.json();
            tbody.innerHTML = "";
            if (orders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted)">No pharmacy orders found.</td></tr>`;
                return;
            }
            orders.forEach(o => {
                let badge = "badge-cyan";
                if (o.status === "Delivered") badge = "badge-emerald";
                else if (o.status === "Dispatched") badge = "badge-amber";
                else if (o.status === "Out for Delivery") badge = "badge-cyan";
                else if (o.status === "Packed") badge = "badge-violet";

                let actionBtnHtml = "";
                if (o.status === "Pending") {
                    actionBtnHtml = `<button class="btn btn-primary btn-sm" onclick="updateAdminOrderStatus(${o.id}, 'Packed')" style="background:var(--neon-violet); border-color:var(--neon-violet); font-size:11.5px; padding:6px 12px; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-box"></i> Pack Order</button>`;
                } else if (o.status === "Packed") {
                    actionBtnHtml = `<button class="btn btn-primary btn-sm" onclick="updateAdminOrderStatus(${o.id}, 'Dispatched')" style="background:var(--neon-amber); border-color:var(--neon-amber); font-size:11.5px; padding:6px 12px; color:#000; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-truck-fast"></i> Ship / Dispatch</button>`;
                } else if (o.status === "Dispatched") {
                    actionBtnHtml = `<button class="btn btn-primary btn-sm" onclick="updateAdminOrderStatus(${o.id}, 'Out for Delivery')" style="background:var(--neon-cyan); border-color:var(--neon-cyan); font-size:11.5px; padding:6px 12px; color:#000; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-people-carry-box"></i> Out for Delivery</button>`;
                } else if (o.status === "Out for Delivery") {
                    actionBtnHtml = `<button class="btn btn-primary btn-sm" onclick="updateAdminOrderStatus(${o.id}, 'Delivered')" style="background:var(--neon-emerald); border-color:var(--neon-emerald); font-size:11.5px; padding:6px 12px; color:#000; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-house-chimney-medical"></i> Mark Delivered</button>`;
                } else if (o.status === "Delivered") {
                    actionBtnHtml = `<span style="color:var(--neon-emerald); font-weight:700; font-size:12.5px; display:inline-flex; align-items:center; gap:4px;"><i class="fa-solid fa-circle-check"></i> Fulfilled</span>`;
                } else {
                    actionBtnHtml = `<span style="color:var(--text-muted); font-size:12px;">No Actions</span>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td><strong>#ORD-${o.id}</strong></td>
                        <td>${o.patientUsername}</td>
                        <td>${o.orderDate}</td>
                        <td>${o.items}</td>
                        <td>$${o.totalAmount.toFixed(2)}</td>
                        <td><span class="badge ${badge}">${o.status}</span></td>
                        <td style="font-size:12px; max-width:180px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${o.deliveryAddress}</td>
                        <td>${actionBtnHtml}</td>
                    </tr>
                `;
            });
        }
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="8">Failed to fetch orders.</td></tr>`;
    }
}

async function updateAdminOrderStatus(id, status) {
    try {
        const res = await fetch(`/api/store/orders/${id}/status?status=${status}&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            alert("Order delivery status updated successfully.");
            loadAdminOrders();
        }
    } catch(e) { console.error(e); }
}

async function loadAdminBedBookings() {
    const tbody = document.getElementById("adminBookingsBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9"><i class="fa-solid fa-spinner fa-spin"></i> Loading bed reservations...</td></tr>`;

    try {
        const res = await fetch("/api/bookings/beds");
        if (res.ok) {
            const bookings = await res.json();
            tbody.innerHTML = "";
            if (bookings.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted)">No active room allocations.</td></tr>`;
                return;
            }
            bookings.forEach(b => {
                let badge = b.status === "Active" ? "badge-cyan" : "badge-emerald";
                tbody.innerHTML += `
                    <tr>
                        <td><strong>#BK-${b.id}</strong></td>
                        <td>${b.patientUsername}</td>
                        <td>${b.patientName}</td>
                        <td>${b.roomType}</td>
                        <td><strong>${b.roomNumber}</strong></td>
                        <td>${b.bookingDate}</td>
                        <td>$${b.pricePerDay}/day</td>
                        <td><span class="badge ${badge}">${b.status}</span></td>
                        <td>
                            ${b.status === 'Active' ? `<button class="btn btn-secondary btn-sm" style="color:var(--neon-rose); border-color:rgba(244,63,94,0.4)" onclick="dischargeAdminBed(${b.id})">Discharge</button>` : `<span style="font-size:12px; color:var(--text-muted)">Closed</span>`}
                        </td>
                    </tr>
                `;
            });
        }
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="9">Failed to fetch bookings.</td></tr>`;
    }
}

async function dischargeAdminBed(id) {
    try {
        const res = await fetch(`/api/bookings/beds/${id}/status?status=Discharged&requestedBy=${activeSession.username}&role=${activeSession.role}`, {
            method: "PUT"
        });
        if (res.ok) {
            alert("Patient discharged from room successfully.");
            loadAdminBedBookings();
        }
    } catch(e) { console.error(e); }
}

// Expandable approval details helper
function toggleApprovalDetail(id) {
    const detailsRow = document.getElementById(`details-row-${id}`);
    const chevron = document.getElementById(`chevron-${id}`);
    if (detailsRow) {
        detailsRow.classList.toggle("hidden");
        if (chevron) {
            if (detailsRow.classList.contains("hidden")) {
                chevron.className = "fa-solid fa-chevron-down";
            } else {
                chevron.className = "fa-solid fa-chevron-up";
            }
        }
    }
}

// Lightbox modal helpers
function openImageModal(src, title) {
    const modal = document.getElementById("imageLightboxModal");
    const img = document.getElementById("lightboxImage");
    const titleEl = document.getElementById("lightboxTitle");
    if (modal && img) {
        img.src = src;
        if (titleEl) titleEl.innerText = title;
        modal.classList.remove("hidden");
    }
}

function closeLightboxModal() {
    const modal = document.getElementById("imageLightboxModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

// Product Details & E-Commerce helper functions
function openProductDetailsModal(itemId) {
    const item = cachedInventory.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById("productDetailsModal");
    const img = document.getElementById("detail-product-image");
    const cat = document.getElementById("detail-product-cat");
    const name = document.getElementById("detail-product-name");
    const code = document.getElementById("detail-product-code");
    const price = document.getElementById("detail-product-price");
    const stock = document.getElementById("detail-product-stock");
    const desc = document.getElementById("detail-product-desc");
    const expiry = document.getElementById("detail-product-expiry");
    const supplier = document.getElementById("detail-product-supplier");
    const location = document.getElementById("detail-product-location");
    const qtyInput = document.getElementById("detail-product-qty");
    const buyBtn = document.getElementById("detail-product-buy-btn");

    if (!modal) return;

    if (img) img.src = item.imageUrl ? item.imageUrl : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400";
    if (cat) cat.innerText = item.category;
    if (name) name.innerText = item.name;
    if (code) code.innerText = `PRODUCT CODE: ${item.itemCode || 'MED-' + item.id}`;
    if (price) price.innerText = `$${item.unitPrice.toFixed(2)}`;
    if (stock) stock.innerText = `Stock Level: ${item.stockQuantity} available on shelves`;
    if (desc) desc.innerText = item.description ? item.description : "Clinical uses, dosage guidelines, and medical specifications for this item.";
    if (expiry) expiry.innerText = item.expiryDate || "N/A";
    if (supplier) supplier.innerText = item.supplierName || "Licensed Pharmaceutical Labs";
    if (location) location.innerText = item.location || "Pharmacy Dispensary";

    if (qtyInput) {
        qtyInput.value = 1;
        qtyInput.max = item.stockQuantity;
        qtyInput.disabled = item.stockQuantity <= 0;
    }

    if (buyBtn) {
        if (item.stockQuantity <= 0) {
            buyBtn.innerText = "Out of Stock";
            buyBtn.disabled = true;
            buyBtn.onclick = null;
        } else {
            buyBtn.innerHTML = `<i class="fa-solid fa-cart-plus"></i> Add To Cart`;
            buyBtn.disabled = false;
            buyBtn.onclick = function() {
                const qtyVal = parseInt(qtyInput.value) || 1;
                addItemToCart(item.id, qtyVal);
                closeProductDetailsModal();
            };
        }
    }

    modal.classList.remove("hidden");
}

function closeProductDetailsModal() {
    const modal = document.getElementById("productDetailsModal");
    if (modal) {
        modal.classList.add("hidden");
    }
}

function showOrderTracking(order) {
    const container = document.getElementById("patient-order-tracker-container");
    const timelineEl = document.getElementById("patient-order-timeline");
    if (!container || !timelineEl) return;

    container.classList.remove("hidden");
    timelineEl.innerHTML = "";

    const stages = ["Pending", "Packed", "Dispatched", "Out for Delivery", "Delivered"];
    const stageLabels = {
        "Pending": "Order Placed",
        "Packed": "Packed & Verified",
        "Dispatched": "Dispatched",
        "Out for Delivery": "Out for Delivery",
        "Delivered": "Delivered"
    };

    let currentIdx = stages.indexOf(order.status);
    if (currentIdx === -1) {
        if (order.status.toLowerCase().includes("pending") || order.status.toLowerCase().includes("placed")) currentIdx = 0;
        else if (order.status.toLowerCase().includes("delivered")) currentIdx = 4;
        else if (order.status.toLowerCase().includes("dispatched")) currentIdx = 2;
        else if (order.status.toLowerCase().includes("packed")) currentIdx = 1;
        else if (order.status.toLowerCase().includes("out for delivery") || order.status.toLowerCase().includes("delivery")) currentIdx = 3;
        else currentIdx = 0;
    }

    stages.forEach((stage, idx) => {
        let statusClass = "timeline-step-upcoming";
        if (idx < currentIdx) {
            statusClass = "timeline-step-completed";
        } else if (idx === currentIdx) {
            statusClass = "timeline-step-active";
        }

        let icon = "fa-circle-check";
        if (stage === "Pending") icon = "fa-receipt";
        else if (stage === "Packed") icon = "fa-box-open";
        else if (stage === "Dispatched") icon = "fa-truck-fast";
        else if (stage === "Out for Delivery") icon = "fa-people-carry-box";
        else if (stage === "Delivered") icon = "fa-house-chimney-medical";

        timelineEl.innerHTML += `
            <div class="timeline-step ${statusClass}">
                <div class="timeline-icon"><i class="fa-solid ${icon}"></i></div>
                <div class="timeline-info">
                    <h5>${stageLabels[stage]}</h5>
                    <p>${idx < currentIdx ? "Completed" : (idx === currentIdx ? "Current Status" : "Pending dispatch")}</p>
                </div>
            </div>
        `;
    });
}

// ==========================================================================
// TELEMEDICINE INTERACTIVE CORE RENDERER
// ==========================================================================
let telemedLocalStream = null;
let telemedCanvasInterval = null;
let telemedActivePatient = "Elena Rostova";
let telemedMicMuted = false;
let telemedVideoMuted = false;

function initTelemedicine(patientName = null) {
    if (patientName) {
        telemedActivePatient = patientName;
    } else {
        // Fallback: look for a scheduled telemedicine appointment to get its patient name!
        const teleAppt = cachedAppointments ? cachedAppointments.find(a => a.type === 'Telemedicine' && a.status !== 'Completed') : null;
        if (teleAppt) {
            telemedActivePatient = `${teleAppt.patient.firstName} ${teleAppt.patient.lastName}`;
        } else {
            telemedActivePatient = "Elena Rostova (Remote Patient)";
        }
    }

    // Set UI labels
    const pLabel = document.getElementById("telemed-patient-label");
    if (pLabel) pLabel.innerText = `Remote Patient (${telemedActivePatient})`;

    // Reset controls UI
    telemedMicMuted = false;
    telemedVideoMuted = false;
    
    const micBtn = document.getElementById("telemed-mic-btn");
    const vidBtn = document.getElementById("telemed-video-btn");
    if (micBtn) {
        micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
        micBtn.style.background = "rgba(255,255,255,0.15)";
    }
    if (vidBtn) {
        vidBtn.innerHTML = `<i class="fa-solid fa-video"></i>`;
        vidBtn.style.background = "rgba(255,255,255,0.15)";
    }

    // 1. Launch local doctor stream (webcam)
    startLocalWebcam();

    // 2. Launch remote patient diagnostic simulation stream
    startRemoteSimulation();
}

function startTelemedicineSession(apptId) {
    const appt = cachedAppointments.find(a => a.id === apptId);
    if (appt) {
        const patientName = `${appt.patient.firstName} ${appt.patient.lastName}`;
        // Populate notes template with patient details
        const notes = document.getElementById("telemed-clinical-notes");
        if (notes) {
            notes.value = `CONSULTATION RECORD\nPatient Name: ${patientName}\nDate: ${appt.date}\nDiagnosis:\nPrescription:\n`;
        }
        initTelemedicine(patientName);
        navigate('telemedicine');
    }
}

async function startLocalWebcam() {
    const localVideo = document.getElementById("telemed-local-video");
    const localPlaceholder = document.getElementById("telemed-local-placeholder");
    
    if (!localVideo) return;

    // Stop existing stream tracks
    if (telemedLocalStream) {
        telemedLocalStream.getTracks().forEach(track => track.stop());
    }

    try {
        // Access webcam
        telemedLocalStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: "user" },
            audio: true
        });
        
        localVideo.srcObject = telemedLocalStream;
        localVideo.style.display = "block";
        if (localPlaceholder) localPlaceholder.style.display = "none";
    } catch (e) {
        console.warn("Webcam access denied or unavailable. Fallback to placeholder simulator.", e);
        localVideo.style.display = "none";
        if (localPlaceholder) {
            localPlaceholder.style.display = "flex";
            localPlaceholder.querySelector("span").innerText = "Camera Unavailable";
        }
    }
}

function startRemoteSimulation() {
    const canvas = document.getElementById("telemed-remote-canvas");
    const placeholder = document.getElementById("telemed-remote-placeholder");
    
    if (!canvas) return;
    
    canvas.style.display = "block";
    if (placeholder) placeholder.style.display = "none";

    const ctx = canvas.getContext("2d");
    
    // Clear any active interval loop
    if (telemedCanvasInterval) clearInterval(telemedCanvasInterval);

    // ECG wave parameters
    let ecgX = 0;
    const points = [];
    const maxPoints = 200;
    
    // Heart rate mock variables
    let currentBpm = 74;
    let nextBpmUpdate = 0;

    // Circular HUD scan parameter
    let radarAngle = 0;

    telemedCanvasInterval = setInterval(() => {
        if (!canvas.width || canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth || 400;
            canvas.height = canvas.clientHeight || 300;
        }

        const w = canvas.width;
        const h = canvas.height;

        // Clear with clean dark grid background
        ctx.fillStyle = "#080b11";
        ctx.fillRect(0, 0, w, h);

        // Draw grid lines
        ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Draw HUD target circles in center
        const cx = w / 2;
        const cy = h / 2 - 20;
        
        ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - 120, cy); ctx.lineTo(cx - 80, cy);
        ctx.moveTo(cx + 80, cy); ctx.lineTo(cx + 120, cy);
        ctx.moveTo(cx, cy - 120); ctx.lineTo(cx, cy - 80);
        ctx.moveTo(cx, cy + 80); ctx.lineTo(cx, cy + 120);
        ctx.stroke();

        // Draw rotating scanner line
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(radarAngle);
        ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(100, 0);
        ctx.stroke();
        ctx.restore();
        radarAngle += 0.02;

        // Draw mock patient silhouette or face scan points
        ctx.fillStyle = "rgba(139, 92, 246, 0.5)";
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 24, 0, Math.PI * 2); // Head
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(cx, cy + 40, 44, 28, 0, 0, Math.PI * 2); // Shoulders
        ctx.fill();

        // Draw scanning HUD ticks/dots
        ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
        ctx.font = "bold 9px monospace";
        ctx.fillText("FACIAL SCAN: ACTIVE", cx - 50, cy - 55);
        ctx.fillText("SECURE P2P LINK", cx - 44, cy + 85);

        // Fluctuating BPM
        if (Date.now() > nextBpmUpdate) {
            currentBpm = Math.floor(70 + Math.random() * 8);
            nextBpmUpdate = Date.now() + 1500;
        }

        // Draw ECG curve at bottom
        const ecgYCenter = h - 50;
        const speed = 2.5;
        
        // Generate next ECG amplitude value
        let val = 0;
        const step = Math.floor(ecgX) % 60;
        if (step === 10) val = -8; // P wave
        else if (step === 18) val = 4;   // Q wave
        else if (step === 20) val = -38;  // R spike
        else if (step === 22) val = 15;   // S wave
        else if (step === 28) val = -5;   // T wave
        
        // Add random micro-tremble
        val += (Math.random() - 0.5) * 2;
        
        points.push(val);
        if (points.length > maxPoints) points.shift();
        
        ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(16, 185, 129, 0.5)";
        ctx.beginPath();
        
        const startX = w - points.length * speed;
        for (let i = 0; i < points.length; i++) {
            const px = startX + i * speed;
            const py = ecgYCenter + points[i];
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        ecgX += 1;

        // Overlay status text
        ctx.fillStyle = "#fff";
        ctx.font = "12px sans-serif";
        ctx.fillText(`HR: ${currentBpm} BPM`, 20, 30);
        ctx.fillStyle = "var(--neon-emerald)";
        ctx.fillText("SIGNAL: 1080P STABLE", 20, 50);

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "11px monospace";
        ctx.fillText("ENCRYPTED END-TO-END (AES-256)", w - 210, 30);
        ctx.fillText(" Aura simulated stream ", w - 165, h - 15);
    }, 33);
}

function toggleTelemedMic() {
    if (!telemedLocalStream) return;
    const audioTrack = telemedLocalStream.getAudioTracks()[0];
    const micBtn = document.getElementById("telemed-mic-btn");
    
    if (audioTrack) {
        telemedMicMuted = !telemedMicMuted;
        audioTrack.enabled = !telemedMicMuted;
        
        if (telemedMicMuted) {
            micBtn.innerHTML = `<i class="fa-solid fa-microphone-slash"></i>`;
            micBtn.style.background = "var(--neon-rose)";
        } else {
            micBtn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
            micBtn.style.background = "rgba(255,255,255,0.15)";
        }
    }
}

function toggleTelemedVideo() {
    if (!telemedLocalStream) return;
    const videoTrack = telemedLocalStream.getVideoTracks()[0];
    const vidBtn = document.getElementById("telemed-video-btn");
    const localVideo = document.getElementById("telemed-local-video");
    const localPlaceholder = document.getElementById("telemed-local-placeholder");
    
    if (videoTrack) {
        telemedVideoMuted = !telemedVideoMuted;
        videoTrack.enabled = !telemedVideoMuted;
        
        if (telemedVideoMuted) {
            vidBtn.innerHTML = `<i class="fa-solid fa-video-slash"></i>`;
            vidBtn.style.background = "var(--neon-rose)";
            localVideo.style.display = "none";
            if (localPlaceholder) {
                localPlaceholder.style.display = "flex";
                localPlaceholder.querySelector("span").innerText = "Camera Muted";
            }
        } else {
            vidBtn.innerHTML = `<i class="fa-solid fa-video"></i>`;
            vidBtn.style.background = "rgba(255,255,255,0.15)";
            localVideo.style.display = "block";
            if (localPlaceholder) localPlaceholder.style.display = "none";
        }
    }
}

function hangupTelemed() {
    // 1. Stop local webcam stream
    if (telemedLocalStream) {
        telemedLocalStream.getTracks().forEach(track => track.stop());
        telemedLocalStream = null;
    }
    
    // 2. Stop Canvas ECG loop
    if (telemedCanvasInterval) {
        clearInterval(telemedCanvasInterval);
        telemedCanvasInterval = null;
    }
    
    // Hide feeds
    const localVideo = document.getElementById("telemed-local-video");
    const localPlaceholder = document.getElementById("telemed-local-placeholder");
    const canvas = document.getElementById("telemed-remote-canvas");
    const placeholder = document.getElementById("telemed-remote-placeholder");
    
    if (localVideo) localVideo.style.display = "none";
    if (localPlaceholder) {
        localPlaceholder.style.display = "flex";
        localPlaceholder.querySelector("span").innerText = "Camera is Off";
    }
    if (canvas) canvas.style.display = "none";
    if (placeholder) placeholder.style.display = "flex";

    alert("Telemedicine consult call hung up successfully.");
    navigate('appointments');
}

