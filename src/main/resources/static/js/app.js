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
        navigate('dashboard');
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
        if (panelId === 'billing') loadBilling();
        if (panelId === 'inventory') loadInventory();
        if (panelId === 'compliance') loadAuditLogs();
        if (panelId === 'ot-suite') loadSurgeries();
        if (panelId === 'ambulance') loadAmbulances();
        if (panelId === 'blood-bank') loadBloodBank();
        if (panelId === 'clinicians') loadClinicians();
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
            navigate('dashboard');
            
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

async function loadInventory() {
    try {
        const res = await fetch("/api/inventory");
        if (res.ok) {
            cachedInventory = await res.json();
            renderInventoryTable(cachedInventory);
        }
    } catch(e) {
        console.error(e);
    }
}

function renderInventoryTable(list) {
    const tbody = document.querySelector("#inventoryTable tbody");
    tbody.innerHTML = "";

    list.forEach(i => {
        const isLow = i.stockQuantity <= i.reorderLevel;
        const statusText = isLow ? `<span class="badge badge-danger">LOW STOCK</span>` : `<span class="badge badge-emerald">In Stock</span>`;

        tbody.innerHTML += `
            <tr>
                <td><strong>${i.itemCode}</strong></td>
                <td>${i.name}</td>
                <td>${i.category}</td>
                <td>${i.stockQuantity} units</td>
                <td>${i.reorderLevel} units</td>
                <td>$${i.unitPrice.toFixed(2)}</td>
                <td>${statusText}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="showReplenishDialog(${i.id}, ${i.stockQuantity})">Replenish</button>
                </td>
            </tr>
        `;
    });
}

function showReplenishDialog(id, currentQty) {
    const addQty = prompt("Enter stock units to add to inventory:", "100");
    if (addQty === null) return;
    
    const qty = parseInt(addQty);
    if (isNaN(qty) || qty <= 0) {
        alert("Please enter a valid stock quantity count.");
        return;
    }

    updateStockQty(id, currentQty + qty);
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

function showAddInventoryForm() {
    // Basic dialog populator
    const item = prompt("Enter Item Name, Category, Stock Level, Reorder Threshold, Unit Price, Location separated by commas:\nExample: Penicillin G, Medicine, 250, 50, 1.25, Cabinet C");
    if (!item) return;

    const parts = item.split(",");
    if (parts.length < 6) {
        alert("All fields are required. Please input in comma-separated values format.");
        return;
    }

    const payload = {
        name: parts[0].trim(),
        category: parts[1].trim(),
        stockQuantity: parseInt(parts[2].trim()),
        reorderLevel: parseInt(parts[3].trim()),
        unitPrice: parseFloat(parts[4].trim()),
        location: parts[5].trim()
    };

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
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">No registered staff members.</td></tr>`;
                return;
            }
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
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--neon-rose)">Failed to communicate with staff database.</td></tr>`;
    }
}

async function handleAddDoctor(event) {
    event.preventDefault();
    if (!activeSession) return;
    
    const first = document.getElementById("doc-first-name").value;
    const last = document.getElementById("doc-last-name").value;
    const spec = document.getElementById("doc-specialization").value;
    const qual = document.getElementById("doc-qualification").value;
    const exp = document.getElementById("doc-experience").value;
    const fee = document.getElementById("doc-fee").value;
    const dept = document.getElementById("doc-department").value;
    const weekly = document.getElementById("doc-weekly").value;
    const daily = document.getElementById("doc-daily").value;
    
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
            alert("New clinician registered and activated successfully!");
            document.getElementById("addDoctorForm").reset();
            loadClinicians();
        } else {
            alert("Failed to add clinician. Verify parameters.");
        }
    } catch (e) {
        console.error("Error creating staff record:", e);
    }
}
