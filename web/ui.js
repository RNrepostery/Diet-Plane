/**
 * Clinical Dietetics UI Renderer & Router
 */

let currentView = 'dashboard';
let currentIntakeTab = 1;
let activePatientForm = null;
let activeDietPlan = null;
let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    initDesktopAuth();
});

function initDesktopAuth() {
    const isAuthed = window.AdminAuth ? window.AdminAuth.isAuthenticated() : false;
    const loginScreen = document.getElementById('desktopLoginScreen');
    const appContainer = document.getElementById('appContainer');

    if (isAuthed) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';
        const dateEl = document.getElementById('headerCurrentDate');
        if (dateEl) {
            dateEl.innerText = new Date().toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        }
        updateDesktopAuthHeader();
        navigateTo('dashboard');
    } else {
        if (appContainer) appContainer.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        const alertEl = document.getElementById('desktopLoginAlert');
        if (alertEl) alertEl.style.display = 'none';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
}

function updateDesktopAuthHeader() {
    const statusContainer = document.getElementById('desktopAuthStatus');
    const footerBadge = document.querySelector('.user-profile-badge');
    const isAuthed = window.AdminAuth ? window.AdminAuth.isAuthenticated() : false;
    const admin = window.AdminAuth ? window.AdminAuth.getCurrentAdmin() : null;

    if (statusContainer) {
        if (isAuthed) {
            statusContainer.innerHTML = `
                <span class="badge" style="background: rgba(13,148,136,0.12); color: #0d9488; font-weight: 700; font-size: 0.76rem; padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(13,148,136,0.3);">
                    <i class="bi bi-shield-check text-success"></i> ${admin?.username || 'Ashish'} (Admin)
                </span>
                <button class="btn-outline-teal" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; color: #dc2626; border-color: #fca5a5;" onclick="desktopLogout()">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </button>
            `;
        } else {
            statusContainer.innerHTML = `
                <button class="btn-emerald" style="font-size: 0.78rem; padding: 0.35rem 0.85rem;" onclick="desktopLogout()">
                    <i class="bi bi-shield-lock-fill"></i> Admin Login
                </button>
            `;
        }
    }

    if (footerBadge) {
        if (isAuthed) {
            footerBadge.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                        <div class="user-avatar" style="background: #0d9488;">${(admin?.username || 'A')[0]}</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.8rem; color: #fff;">${admin?.username || 'Ashish'}</div>
                            <div style="font-size: 0.65rem; color: #2dd4bf; font-weight: 600;">Registered Dietitian</div>
                        </div>
                    </div>
                    <button onclick="desktopLogout()" style="background: none; border: none; color: #f87171; cursor: pointer; font-size: 0.95rem;" title="Logout Admin">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            `;
        } else {
            footerBadge.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                        <div class="user-avatar" style="background: #64748b;">?</div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.8rem; color: #fff;">Guest Session</div>
                            <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 600;">Login required</div>
                        </div>
                    </div>
                    <button onclick="desktopLogout()" style="background: none; border: none; color: #2dd4bf; cursor: pointer; font-size: 0.95rem;" title="Login">
                        <i class="bi bi-box-arrow-in-right"></i>
                    </button>
                </div>
            `;
        }
    }
}

function navigateTo(view, param = null) {
    // Check Admin Authentication - strict gate
    const isAuthed = window.AdminAuth ? window.AdminAuth.isAuthenticated() : false;
    const loginScreen = document.getElementById('desktopLoginScreen');
    const appContainer = document.getElementById('appContainer');

    if (!isAuthed) {
        if (appContainer) appContainer.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        return;
    }

    if (loginScreen) loginScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';

    currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });

    const main = document.getElementById('mainContent');
    updateDesktopAuthHeader();

    switch (view) {
        case 'dashboard':
            renderDashboard(main);
            break;
        case 'patient-intake':
            renderPatientIntake(main, param);
            break;
        case 'disease-master':
            renderDiseaseMaster(main);
            break;
        case 'master-items':
            renderMasterItems(main);
            break;
        case 'diet-generator':
            renderDietGenerator(main, param);
            break;
        case 'diet-plans':
            renderDietPlans(main);
            break;
        case 'diet-plan-view':
            renderDietPlanView(main, param);
            break;
        default:
            renderDashboard(main);
    }
}

function handleDesktopLogin(e, returnView = 'dashboard', returnParam = null) {
    if (e && e.preventDefault) e.preventDefault();
    const uInput = document.getElementById('desktopLoginUser');
    const pInput = document.getElementById('desktopLoginPass');
    const u = uInput ? uInput.value : '';
    const p = pInput ? pInput.value : '';

    const res = window.AdminAuth ? window.AdminAuth.login(u, p) : { success: true, user: { username: u } };

    if (res.success) {
        const loginScreen = document.getElementById('desktopLoginScreen');
        const appContainer = document.getElementById('appContainer');
        if (loginScreen) loginScreen.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';

        const dateEl = document.getElementById('headerCurrentDate');
        if (dateEl) {
            dateEl.innerText = new Date().toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        }

        updateDesktopAuthHeader();
        showToast('✅ Logged in successfully as ' + (res.user?.username || 'Admin'));
        navigateTo(returnView || 'dashboard', returnParam);
    } else {
        const alertEl = document.getElementById('desktopLoginAlert');
        if (alertEl) {
            alertEl.style.display = 'flex';
            alertEl.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> <span>${res.message}</span>`;
        }
    }
}

function toggleDesktopLoginPassword() {
    const input = document.getElementById('desktopLoginPass');
    const eye = document.getElementById('desktopLoginEye');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (eye) eye.className = 'bi bi-eye-slash-fill';
    } else {
        input.type = 'password';
        if (eye) eye.className = 'bi bi-eye-fill';
    }
}

function autofillAndSubmitDesktopLogin(u, p) {
    const userInput = document.getElementById('desktopLoginUser');
    const passInput = document.getElementById('desktopLoginPass');
    if (userInput) userInput.value = u;
    if (passInput) passInput.value = p;
    handleDesktopLogin(null, 'dashboard');
}

function desktopLogout() {
    if (window.AdminAuth) {
        window.AdminAuth.logout();
    }
    const appContainer = document.getElementById('appContainer');
    const loginScreen = document.getElementById('desktopLoginScreen');
    if (appContainer) appContainer.style.display = 'none';
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        const alertEl = document.getElementById('desktopLoginAlert');
        if (alertEl) alertEl.style.display = 'none';
    }
    showToast('Logged out of Admin Portal');
}

// ==========================================
// VIEW: CLINICAL DASHBOARD
// ==========================================
function renderDashboard(container) {
    const patients = db.patients;
    const diseases = db.diseases;
    const foods = db.foods;
    const plans = db.plans;

    const filteredPatients = patients.filter(p => {
        if (!currentSearchTerm) return true;
        const q = currentSearchTerm.toLowerCase();
        return p.name.toLowerCase().includes(q) ||
               (p.contactNumber && p.contactNumber.toLowerCase().includes(q)) ||
               (p.clinicalDiagnoses && p.clinicalDiagnoses.some(d => d.toLowerCase().includes(q))) ||
               (p.primaryComplaint && p.primaryComplaint.toLowerCase().includes(q));
    });

    container.innerHTML = `
        <!-- Clinical Banner -->
        <div class="clinical-banner">
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 52px; height: 52px; border-radius: var(--radius-full); background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #2dd4bf;">
                        <i class="bi bi-heart-pulse-fill"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 1.65rem; font-weight: 800; letter-spacing: -0.02em;">Clinical Dietetics & Nutrition Management</h2>
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-top: 0.15rem;">
                            Local-First Offline Clinical System • Registered Dietitians / Healthcare Admins
                        </p>
                    </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem;">
                    <button class="btn-emerald" onclick="navigateTo('patient-intake')">
                        <i class="bi bi-person-plus-fill"></i> New Patient Intake
                    </button>
                    <button class="btn-outline-teal" style="color: #ffffff; border-color: rgba(255,255,255,0.4);" onclick="navigateTo('diet-generator')">
                        <i class="bi bi-magic"></i> Auto-Generate Diet Plan
                    </button>
                    <button class="btn-outline-teal" style="color: #ffffff; border-color: rgba(255,255,255,0.4);" onclick="navigateTo('disease-master')">
                        <i class="bi bi-shield-shaded"></i> Disease Master (${diseases.length})
                    </button>
                </div>
            </div>
        </div>

        <!-- Metric Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="metric-card" style="border-left: 4px solid var(--primary);">
                <div>
                    <div class="metric-label">Registered Patients</div>
                    <div class="metric-value" style="color: var(--primary);">${patients.length}</div>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Active Clinical Profiles</small>
                </div>
                <div style="width: 44px; height: 44px; border-radius: var(--radius-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">
                    <i class="bi bi-people-fill"></i>
                </div>
            </div>

            <div class="metric-card" style="border-left: 4px solid #0284c7;">
                <div>
                    <div class="metric-label">Disease Master</div>
                    <div class="metric-value" style="color: #0284c7;">${diseases.length}</div>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Pathological Diagnoses</small>
                </div>
                <div style="width: 44px; height: 44px; border-radius: var(--radius-full); background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">
                    <i class="bi bi-shield-shaded"></i>
                </div>
            </div>

            <div class="metric-card" style="border-left: 4px solid #2563eb;">
                <div>
                    <div class="metric-label">Food Item Master</div>
                    <div class="metric-value" style="color: #2563eb;">${foods.length}</div>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">1g Macros & Contraindications</small>
                </div>
                <div style="width: 44px; height: 44px; border-radius: var(--radius-full); background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">
                    <i class="bi bi-database-fill-gear"></i>
                </div>
            </div>

            <div class="metric-card" style="border-left: 4px solid var(--success);">
                <div>
                    <div class="metric-label">Issued Diet Plans</div>
                    <div class="metric-value" style="color: var(--success);">${plans.length}</div>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Clinical Prescriptions</small>
                </div>
                <div style="width: 44px; height: 44px; border-radius: var(--radius-full); background: #dcfce7; color: var(--success); display: flex; align-items: center; justify-content: center; font-size: 1.35rem;">
                    <i class="bi bi-file-earmark-check-fill"></i>
                </div>
            </div>
        </div>

        <!-- Patients Registry -->
        <div class="card-custom">
            <div style="display: flex; flex-direction: column; md:flex-row; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <h3 style="font-weight: 800; font-size: 1.25rem;">Patient Clinical Registry</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Global search by patient name, clinical diagnosis, or WhatsApp phone number</p>
                </div>
                <div style="width: 100%; max-width: 340px;">
                    <div style="position: relative;">
                        <i class="bi bi-search" style="position: absolute; left: 12px; top: 11px; color: var(--text-muted);"></i>
                        <input type="text" class="form-control" style="padding-left: 36px;" placeholder="Search patient, diagnosis, phone..." value="${currentSearchTerm}" oninput="handleGlobalSearch(this.value)" />
                    </div>
                </div>
            </div>

            ${filteredPatients.length === 0 ? `
                <div style="text-align: center; padding: 4rem 1rem; background: var(--bg-light); border-radius: var(--radius-md);">
                    <i class="bi bi-person-exclamation" style="font-size: 3rem; color: var(--text-muted);"></i>
                    <h4 style="font-weight: 700; margin-top: 0.75rem;">No Clinical Records Found</h4>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">Add your first clinical intake to start automated diet planning.</p>
                    <button class="btn-emerald" onclick="navigateTo('patient-intake')">
                        <i class="bi bi-plus-lg"></i> Add Patient Intake
                    </button>
                </div>
            ` : `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--bg-light); border-bottom: 2px solid var(--border-color); text-align: left;">
                                <th style="padding: 0.85rem 1rem;">Patient Profile</th>
                                <th style="padding: 0.85rem 1rem;">Clinical Diagnoses</th>
                                <th style="padding: 0.85rem 1rem;">Anthropometrics & IBW</th>
                                <th style="padding: 0.85rem 1rem;">Metabolic Energy</th>
                                <th style="padding: 0.85rem 1rem;">WhatsApp Contact</th>
                                <th style="padding: 0.85rem 1rem; text-align: right;">Clinical Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredPatients.map(p => {
                                const bmi = ClinicalCalculator.calculateBMI(p.weightKg, p.heightCm);
                                const bmiCat = ClinicalCalculator.getBMICategory(bmi);
                                const bmiBadge = ClinicalCalculator.getBMIBadgeClass(bmiCat);
                                const ibw = ClinicalCalculator.calculateBrocaIBW(p.heightCm, p.gender);
                                const bmr = ClinicalCalculator.calculateBMR(p.weightKg, p.heightCm, p.age || 30, p.gender);
                                const tdee = ClinicalCalculator.calculateTDEE(bmr, p.activityLevel);
                                const targetKcal = ClinicalCalculator.getRecommendedTargetCalories(p);

                                return `
                                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-light)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 1rem;">
                                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                                <div style="width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem;">
                                                    ${p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style="font-weight: 800; color: var(--text-primary);">${p.name}</div>
                                                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                                                        ${p.age || 30} yrs | ${p.gender} | <strong style="color: var(--success);">${p.primaryDietType}</strong>
                                                    </div>
                                                    ${p.primaryComplaint ? `<div style="color: var(--text-muted); font-size: 0.75rem; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.primaryComplaint}</div>` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            ${p.clinicalDiagnoses && p.clinicalDiagnoses.length > 0 ? `
                                                <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 200px;">
                                                    ${p.clinicalDiagnoses.map(d => `<span style="font-size: 0.72rem; padding: 2px 7px; background: #fee2e2; color: #991b1b; border-radius: 4px; font-weight: 600;">${d}</span>`).join('')}
                                                </div>
                                            ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">General Wellness</span>`}
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 800;">${bmi} <small style="color: var(--text-muted);">kg/m²</small></div>
                                            <span class="badge ${bmiBadge}" style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 2px;">${bmiCat}</span>
                                            <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">
                                                Broca IBW: <strong style="color: var(--primary);">${ibw} kg</strong>
                                            </div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <span style="font-size: 0.72rem; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${p.calorieGoalType}</span>
                                            <div style="font-weight: 800; color: var(--primary); margin-top: 2px;">${targetKcal} kcal/day</div>
                                            <div style="color: var(--text-muted); font-size: 0.72rem;">BMR: ${bmr} | TDEE: ${tdee}</div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            ${p.contactNumber ? `
                                                <button class="btn-outline-teal" style="font-size: 0.75rem; padding: 3px 8px; border-color: #22c55e; color: #15803d;" onclick="directWhatsApp('${p.contactNumber}')">
                                                    <i class="bi bi-whatsapp"></i> ${p.contactNumber}
                                                </button>
                                            ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">No contact</span>`}
                                        </td>
                                        <td style="padding: 1rem; text-align: right;">
                                            <div style="display: inline-flex; gap: 4px;">
                                                <button class="btn-emerald" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" title="Plan Diet" onclick="navigateTo('diet-generator', '${p.id}')">
                                                    <i class="bi bi-magic"></i> Plan
                                                </button>
                                                <button class="btn-outline-teal" style="padding: 0.4rem 0.65rem; font-size: 0.8rem;" title="Edit" onclick="navigateTo('patient-intake', '${p.id}')">
                                                    <i class="bi bi-pencil-square"></i>
                                                </button>
                                                <button style="background: none; border: 1px solid var(--border-color); color: var(--danger); border-radius: var(--radius-sm); padding: 0.4rem 0.6rem; cursor: pointer;" title="Delete" onclick="deletePatient('${p.id}')">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

function handleGlobalSearch(term) {
    currentSearchTerm = term;
    const main = document.getElementById('mainContent');
    renderDashboard(main);
}

function deletePatient(id) {
    if (!window.AdminAuth || !window.AdminAuth.isAuthenticated()) {
        showToast('⚠️ Admin authentication required to delete patient profile.');
        return;
    }
    if (confirm('Are you sure you want to delete this patient profile and associated diet plans?')) {
        db.deletePatient(id);
        navigateTo('dashboard');
    }
}

// ==========================================
// VIEW: PATIENT INTAKE FORM (4-STEP WIZARD)
// ==========================================
function renderPatientIntake(container, patientId = null) {
    const existing = patientId ? db.patients.find(p => p.id === patientId) : null;
    currentIntakeTab = 1;

    activePatientForm = existing ? JSON.parse(JSON.stringify(existing)) : {
        id: 'p-' + Date.now(),
        name: '',
        contactNumber: '',
        dateOfBirth: '1995-01-01',
        age: 30,
        gender: 'Male',
        primaryDietType: 'Vegetarian',
        primaryComplaint: '',
        clinicalDiagnoses: [],
        describeMedicalConditions: '',
        prescribedMedications: '',
        otcSupplements: '',
        occupation: '',
        workingHours: 'Day',
        dailySleepDurationHours: 7.0,
        sleepQuality: 'Restful',
        stressLevel: 5,
        primaryStressFactor: '',
        dailyStepCount: 5000,
        exerciseRoutine: '',
        activityLevel: 'Lightly Active',
        waterConsumptionLiters: 2.5,
        alcoholSmokingFrequency: 'Non-smoker',
        emotionalEatingTriggers: ['Stress'],
        mealFrequency: '3 Meals',
        recallBreakfast: '',
        recallBreakfastTime: '08:30 AM',
        recallMidMorning: '',
        recallMidMorningTime: '11:00 AM',
        recallLunch: '',
        recallLunchTime: '01:30 PM',
        recallEvening: '',
        recallEveningTime: '05:30 PM',
        recallDinner: '',
        recallDinnerTime: '08:30 PM',
        recallBedtime: '',
        recallBedtimeTime: '10:00 PM',
        heightCm: 170.0,
        weightKg: 70.0,
        waistCm: 80.0,
        hipsCm: 95.0,
        calorieGoalType: 'Maintenance',
        macroDistributionPreset: 'Standard Balanced',
        targetCaloriesOverride: 0,
        createdAt: new Date().toISOString()
    };

    updateIntakeView(container);
}

function updateIntakeView(container = document.getElementById('mainContent')) {
    const p = activePatientForm;
    const bmi = ClinicalCalculator.calculateBMI(p.weightKg, p.heightCm);
    const bmiCategory = ClinicalCalculator.getBMICategory(bmi);
    const ibw = ClinicalCalculator.calculateBrocaIBW(p.heightCm, p.gender);
    const whr = ClinicalCalculator.calculateWHR(p.waistCm, p.hipsCm);
    const isHighRisk = ClinicalCalculator.isAbdominalObesityHighRisk(p.waistCm, p.hipsCm, p.gender);
    const bmr = ClinicalCalculator.calculateBMR(p.weightKg, p.heightCm, p.age || 30, p.gender);
    const tdee = ClinicalCalculator.calculateTDEE(bmr, p.activityLevel);
    const thumb = ClinicalCalculator.calculateRuleOfThumb(p.weightKg);
    const targetKcal = ClinicalCalculator.getRecommendedTargetCalories(p);
    const macros = ClinicalCalculator.calculateTargetMacros(targetKcal, p.macroDistributionPreset);

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="font-weight: 800; font-size: 1.5rem; color: var(--text-primary);">
                    <i class="bi bi-clipboard-pulse" style="color: var(--primary); margin-right: 0.5rem;"></i>
                    ${p.name ? 'Edit Patient Profile: ' + p.name : 'Clinical Dietetics Patient Intake Form'}
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Anthropometrics, Broca's IBW, Harris-Benedict BMR, TDEE, Disease Master diagnosis, and 24-hr dietary recall.
                </p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn-outline-teal" onclick="navigateTo('dashboard')">
                    <i class="bi bi-arrow-left"></i> Dashboard
                </button>
                <button class="btn-emerald" onclick="savePatientProfile()">
                    <i class="bi bi-check-lg"></i> Save Profile
                </button>
            </div>
        </div>

        <div class="card-custom">
            <!-- Tabs Header -->
            <div class="clinical-tabs">
                <button class="tab-btn ${currentIntakeTab === 1 ? 'active' : ''}" onclick="switchIntakeTab(1)">
                    <i class="bi bi-person-lines-fill"></i> 1. Demographics & Diagnoses
                </button>
                <button class="tab-btn ${currentIntakeTab === 2 ? 'active' : ''}" onclick="switchIntakeTab(2)">
                    <i class="bi bi-calculator-fill"></i> 2. Anthropometrics & Calculators
                </button>
                <button class="tab-btn ${currentIntakeTab === 3 ? 'active' : ''}" onclick="switchIntakeTab(3)">
                    <i class="bi bi-pie-chart-fill"></i> 3. Macronutrient Engine
                </button>
                <button class="tab-btn ${currentIntakeTab === 4 ? 'active' : ''}" onclick="switchIntakeTab(4)">
                    <i class="bi bi-clock-history"></i> 4. 24h Dietary Recall
                </button>
            </div>

            <!-- Tab 1: Demographics & Medical Profile -->
            <div id="intakeTab1" style="display: ${currentIntakeTab === 1 ? 'block' : 'none'};">
                <h4 style="font-weight: 700; color: var(--primary); margin-bottom: 1.25rem;">Patient Demographics & Clinical Information</h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                    <div>
                        <label class="form-label required">Patient Full Name</label>
                        <input type="text" class="form-control" placeholder="e.g. Rajesh Sharma" value="${p.name}" oninput="activePatientForm.name = this.value" required />
                    </div>
                    <div>
                        <label class="form-label required">WhatsApp Contact Phone</label>
                        <input type="tel" class="form-control" placeholder="+91 98765 43210" value="${p.contactNumber}" oninput="activePatientForm.contactNumber = this.value" required />
                        <small style="color: var(--text-muted); font-size: 0.72rem;">Required for 1-click clinical WhatsApp prescription sharing.</small>
                    </div>
                    <div>
                        <label class="form-label">Gender</label>
                        <select class="form-select" onchange="activePatientForm.gender = this.value; updateIntakeView();">
                            <option value="Male" ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${p.gender === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Date of Birth</label>
                        <input type="date" class="form-control" value="${p.dateOfBirth}" onchange="activePatientForm.dateOfBirth = this.value; calculateAgeFromDOB(); updateIntakeView();" />
                        <small style="color: var(--text-secondary); font-size: 0.75rem;">Calculated Age: <strong>${p.age} years</strong></small>
                    </div>
                    <div>
                        <label class="form-label">Primary Diet Preference</label>
                        <select class="form-select" onchange="activePatientForm.primaryDietType = this.value;">
                            <option value="Vegetarian" ${p.primaryDietType === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
                            <option value="Vegan" ${p.primaryDietType === 'Vegan' ? 'selected' : ''}>Vegan</option>
                            <option value="Non-Veg" ${p.primaryDietType === 'Non-Veg' ? 'selected' : ''}>Non-Veg</option>
                            <option value="Ovo-Vegetarian" ${p.primaryDietType === 'Ovo-Vegetarian' ? 'selected' : ''}>Ovo-Vegetarian</option>
                            <option value="Jain" ${p.primaryDietType === 'Jain' ? 'selected' : ''}>Jain (No Root Veg / Onion / Garlic)</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Occupation</label>
                        <input type="text" class="form-control" placeholder="e.g. Software Engineer, Homemaker" value="${p.occupation}" oninput="activePatientForm.occupation = this.value" />
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Primary Complaint / Therapeutic Goal</label>
                    <textarea class="form-control" rows="2" placeholder="e.g. Weight reduction, HbA1c reduction, NAFLD management, hypertension control..." oninput="activePatientForm.primaryComplaint = this.value">${p.primaryComplaint}</textarea>
                </div>

                <!-- CLINICAL DIAGNOSIS MULTI-SELECT -->
                <div style="background: var(--bg-light); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h5 style="font-weight: 700; color: var(--primary); margin: 0;">
                            <i class="bi bi-shield-exclamation me-1"></i> Clinical Diagnoses (Disease Master Multi-Select)
                        </h5>
                        <button class="btn-outline-teal" style="font-size: 0.75rem; padding: 2px 8px;" onclick="navigateTo('disease-master')">
                            + Manage Diseases
                        </button>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 1rem;">
                        Select all diagnosed clinical conditions. The automated diet generator will strictly filter out contraindicated foods linked to these conditions:
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
                        ${db.diseases.map(d => {
                            const isChecked = p.clinicalDiagnoses.includes(d.name);
                            return `
                                <label style="display: flex; align-items: flex-start; gap: 0.6rem; padding: 0.6rem 0.8rem; background: #ffffff; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
                                    <input type="checkbox" style="margin-top: 3px;" ${isChecked ? 'checked' : ''} onchange="togglePatientDiagnosis('${d.name}', this.checked)" />
                                    <div>
                                        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${d.name}</div>
                                        <small style="color: var(--text-muted); font-size: 0.72rem;">${d.category}</small>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
                    <div>
                        <label class="form-label">Medical History & Pathology Notes</label>
                        <textarea class="form-control" rows="2" placeholder="e.g. Ultrasound showed Grade 1 Hepatic Steatosis, Fasting Sugar 142..." oninput="activePatientForm.describeMedicalConditions = this.value">${p.describeMedicalConditions}</textarea>
                    </div>
                    <div>
                        <label class="form-label">Prescribed Medications</label>
                        <textarea class="form-control" rows="2" placeholder="e.g. Metformin 500mg (1-0-1), Telmisartan 40mg (1-0-0)..." oninput="activePatientForm.prescribedMedications = this.value">${p.prescribedMedications}</textarea>
                    </div>
                </div>
            </div>

            <!-- Tab 2: Anthropometrics & Clinical Calculators -->
            <div id="intakeTab2" style="display: ${currentIntakeTab === 2 ? 'block' : 'none'};">
                <h4 style="font-weight: 700; color: var(--primary); margin-bottom: 1.25rem;">Core Anthropometric Measurements</h4>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                    <div>
                        <label class="form-label fw-bold">Height (cm)</label>
                        <input type="number" step="0.5" class="form-control" style="font-size: 1.2rem; font-weight: 700; text-align: center;" value="${p.heightCm}" oninput="activePatientForm.heightCm = parseFloat(this.value) || 0; updateIntakeView();" />
                    </div>
                    <div>
                        <label class="form-label fw-bold">Weight (kg)</label>
                        <input type="number" step="0.5" class="form-control" style="font-size: 1.2rem; font-weight: 700; text-align: center;" value="${p.weightKg}" oninput="activePatientForm.weightKg = parseFloat(this.value) || 0; updateIntakeView();" />
                    </div>
                    <div>
                        <label class="form-label fw-bold">Waist Circumference (cm)</label>
                        <input type="number" step="0.5" class="form-control" style="font-size: 1.2rem; font-weight: 700; text-align: center;" value="${p.waistCm}" oninput="activePatientForm.waistCm = parseFloat(this.value) || 0; updateIntakeView();" />
                    </div>
                    <div>
                        <label class="form-label fw-bold">Hip Circumference (cm)</label>
                        <input type="number" step="0.5" class="form-control" style="font-size: 1.2rem; font-weight: 700; text-align: center;" value="${p.hipsCm}" oninput="activePatientForm.hipsCm = parseFloat(this.value) || 0; updateIntakeView();" />
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
                    <div>
                        <label class="form-label fw-bold">Physical Activity Level (PAL Factor)</label>
                        <select class="form-select" onchange="activePatientForm.activityLevel = this.value; updateIntakeView();">
                            <option value="Sedentary" ${p.activityLevel === 'Sedentary' ? 'selected' : ''}>Sedentary (Factor 1.2) - Desk job, little/no exercise</option>
                            <option value="Lightly Active" ${p.activityLevel === 'Lightly Active' ? 'selected' : ''}>Lightly Active (Factor 1.375) - Light exercise 1-3 days/week</option>
                            <option value="Moderately Active" ${p.activityLevel === 'Moderately Active' ? 'selected' : ''}>Moderately Active (Factor 1.55) - Moderate workout 3-5 days/week</option>
                            <option value="Very Active" ${p.activityLevel === 'Very Active' ? 'selected' : ''}>Very Active (Factor 1.725) - Heavy exercise 6-7 days/week</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label fw-bold">Average Daily Step Count</label>
                        <input type="number" step="500" class="form-control" value="${p.dailyStepCount}" oninput="activePatientForm.dailyStepCount = parseInt(this.value) || 0;" />
                    </div>
                </div>

                <!-- CLINICAL CALCULATOR ENGINE RESULTS -->
                <div style="background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%); border: 1.5px solid #99f6e4; border-radius: var(--radius-lg); padding: 1.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                        <h4 style="font-weight: 800; color: var(--primary); margin: 0;">
                            <i class="bi bi-cpu-fill me-2"></i> Automated Clinical Calculation Engine
                        </h4>
                        <span class="badge" style="background: var(--primary); color: #fff; font-size: 0.75rem; padding: 4px 10px; border-radius: 4px;">Live Medical Vitals</span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <!-- 1. BMI -->
                        <div class="metric-card" style="flex-direction: column; align-items: flex-start; background: #ffffff;">
                            <div class="metric-label">BODY MASS INDEX (BMI)</div>
                            <div class="metric-value" style="color: var(--primary);">${bmi} <span style="font-size: 0.75rem; color: var(--text-muted);">kg/m²</span></div>
                            <span class="badge ${ClinicalCalculator.getBMIBadgeClass(bmiCategory)}" style="margin-top: 6px; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px;">${bmiCategory}</span>
                            <small style="color: var(--text-muted); font-size: 0.7rem; margin-top: 6px;">Weight / Height(m)²</small>
                        </div>

                        <!-- 2. Broca IBW -->
                        <div class="metric-card" style="flex-direction: column; align-items: flex-start; background: #ffffff;">
                            <div class="metric-label">BROCA'S IDEAL BODY WEIGHT (IBW)</div>
                            <div class="metric-value" style="color: var(--secondary);">${ibw} <span style="font-size: 0.75rem; color: var(--text-muted);">kg</span></div>
                            <span style="font-size: 0.72rem; padding: 2px 8px; background: #dbeafe; color: #1e40af; border-radius: 4px; font-weight: 700; margin-top: 6px;">
                                ${p.weightKg > ibw ? `+${(p.weightKg - ibw).toFixed(1)}kg Excess` : 'Normal / Deficit'}
                            </span>
                            <small style="color: var(--text-muted); font-size: 0.7rem; margin-top: 6px;">
                                ${p.gender === 'Female' ? 'Height(cm) - 105' : 'Height(cm) - 100'}
                            </small>
                        </div>

                        <!-- 3. WHR & Abdominal Risk -->
                        <div class="metric-card" style="flex-direction: column; align-items: flex-start; background: #ffffff;">
                            <div class="metric-label">WAIST-TO-HIP RATIO (WHR)</div>
                            <div class="metric-value" style="color: ${isHighRisk ? 'var(--danger)' : 'var(--success)'};">${whr}</div>
                            <span class="badge ${isHighRisk ? 'badge-bmi-obese' : 'badge-bmi-normal'}" style="margin-top: 6px; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px;">
                                ${isHighRisk ? 'High Abdominal Risk' : 'Normal Risk'}
                            </span>
                            <small style="color: var(--text-muted); font-size: 0.7rem; margin-top: 6px;">
                                Asian cut-off: ${p.gender === 'Female' ? 'W>80cm / WHR>0.85' : 'W>90cm / WHR>0.90'}
                            </small>
                        </div>

                        <!-- 4. Harris-Benedict BMR / TDEE -->
                        <div class="metric-card" style="flex-direction: column; align-items: flex-start; background: #ffffff;">
                            <div class="metric-label">HARRIS-BENEDICT BMR / TDEE</div>
                            <div class="metric-value" style="color: var(--text-primary);">${tdee} <span style="font-size: 0.75rem; color: var(--text-muted);">kcal/day</span></div>
                            <span style="font-size: 0.72rem; padding: 2px 8px; background: #e2e8f0; color: #334155; border-radius: 4px; font-weight: 700; margin-top: 6px;">
                                BMR: ${bmr} kcal
                            </span>
                            <small style="color: var(--text-muted); font-size: 0.7rem; margin-top: 6px;">BMR × PAL (${ClinicalCalculator.getActivityFactor(p.activityLevel)})</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 3: Macronutrient Engine & Goals -->
            <div id="intakeTab3" style="display: ${currentIntakeTab === 3 ? 'block' : 'none'};">
                <h4 style="font-weight: 700; color: var(--primary); margin-bottom: 1.25rem;">Caloric Goals & Macronutrient Distribution Engine</h4>
                
                <!-- Rapid Rule of Thumb -->
                <div style="background: var(--bg-light); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
                    <h5 style="font-weight: 700; margin-bottom: 0.75rem;">Rapid "Rule of Thumb" Caloric Estimations (Asian Clinical Guidelines)</h5>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; text-align: center;">
                        <div style="background: #ffffff; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #fecaca;">
                            <small style="color: var(--danger); font-weight: 700; display: block;">WEIGHT LOSS (20-22 kcal/kg)</small>
                            <strong style="font-size: 1.2rem; color: var(--danger);">${thumb.deficitMin} - ${thumb.deficitMax} kcal</strong>
                        </div>
                        <div style="background: #ffffff; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #bfdbfe;">
                            <small style="color: var(--secondary); font-weight: 700; display: block;">MAINTENANCE (25-30 kcal/kg)</small>
                            <strong style="font-size: 1.2rem; color: var(--secondary);">${thumb.maintMin} - ${thumb.maintMax} kcal</strong>
                        </div>
                        <div style="background: #ffffff; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #bbf7d0;">
                            <small style="color: var(--success); font-weight: 700; display: block;">SURPLUS / GAIN (30-35 kcal/kg)</small>
                            <strong style="font-size: 1.2rem; color: var(--success);">${thumb.surplusMin} - ${thumb.surplusMax} kcal</strong>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                    <div>
                        <label class="form-label fw-bold">Select Target Calorie Strategy</label>
                        <select class="form-select form-select-lg" onchange="activePatientForm.calorieGoalType = this.value; updateIntakeView();">
                            <option value="Weight Loss" ${p.calorieGoalType === 'Weight Loss' ? 'selected' : ''}>Weight Loss / Deficit (~${Math.round((thumb.deficitMin + thumb.deficitMax)/2)} kcal)</option>
                            <option value="Maintenance" ${p.calorieGoalType === 'Maintenance' ? 'selected' : ''}>Maintenance Intake (~${Math.round((thumb.maintMin + thumb.maintMax)/2)} kcal)</option>
                            <option value="Weight Gain" ${p.calorieGoalType === 'Weight Gain' ? 'selected' : ''}>Weight Gain / Surplus (~${Math.round((thumb.surplusMin + thumb.surplusMax)/2)} kcal)</option>
                            <option value="Custom" ${p.calorieGoalType === 'Custom' ? 'selected' : ''}>Custom Energy Target</option>
                        </select>
                    </div>

                    <div>
                        <label class="form-label fw-bold">Clinical Macronutrient Preset</label>
                        <select class="form-select form-select-lg" onchange="activePatientForm.macroDistributionPreset = this.value; updateIntakeView();">
                            <option value="Standard Balanced" ${p.macroDistributionPreset === 'Standard Balanced' ? 'selected' : ''}>Standard Indian Balanced (55% C, 20% P, 25% F)</option>
                            <option value="Diabetic" ${p.macroDistributionPreset === 'Diabetic' ? 'selected' : ''}>Diabetic / Low Glycemic (45% C, 25% P, 30% F)</option>
                            <option value="High Protein" ${p.macroDistributionPreset === 'High Protein' ? 'selected' : ''}>High Protein / Fat Loss (40% C, 30% P, 30% F)</option>
                            <option value="Renal Protective" ${p.macroDistributionPreset === 'Renal Protective' ? 'selected' : ''}>Renal Protective / CKD (60% C, 15% P, 25% F)</option>
                            <option value="Cardiac Low-Fat" ${p.macroDistributionPreset === 'Cardiac Low-Fat' ? 'selected' : ''}>Cardiac / Low-Fat (60% C, 20% P, 20% F)</option>
                        </select>
                    </div>
                </div>

                ${p.calorieGoalType === 'Custom' ? `
                    <div style="margin-bottom: 1.5rem;">
                        <label class="form-label fw-bold">Custom Energy Target (kcal/day)</label>
                        <input type="number" class="form-control" value="${p.targetCaloriesOverride}" oninput="activePatientForm.targetCaloriesOverride = parseFloat(this.value) || 0; updateIntakeView();" />
                    </div>
                ` : ''}

                <!-- Macro Target Grams Output Card -->
                <div style="background: #ffffff; border: 2px solid var(--primary); border-radius: var(--radius-md); padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                        <div>
                            <span class="badge" style="background: var(--primary); color: #fff; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px;">Energy Conversion Formula</span>
                            <h4 style="font-weight: 800; color: var(--text-primary); margin-top: 0.25rem;">Prescribed Daily Target: ${targetKcal} kcal/day</h4>
                        </div>
                        <small style="color: var(--text-muted); font-size: 0.75rem;">1g Carb/Protein = 4 kcal • 1g Fat = 9 kcal</small>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; text-align: center;">
                        <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #fde68a;">
                            <small style="color: #b45309; font-weight: 700; display: block;">CARBOHYDRATES (${macros.carbPct}%)</small>
                            <strong style="font-size: 1.6rem; color: #b45309;">${macros.targetCarbsGrams} <span style="font-size: 0.85rem;">grams</span></strong>
                            <small style="color: var(--text-muted); display: block; font-size: 0.75rem;">${Math.round(macros.targetCarbsGrams * 4)} kcal</small>
                        </div>
                        <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #bfdbfe;">
                            <small style="color: var(--secondary); font-weight: 700; display: block;">PROTEIN (${macros.protPct}%)</small>
                            <strong style="font-size: 1.6rem; color: var(--secondary);">${macros.targetProteinGrams} <span style="font-size: 0.85rem;">grams</span></strong>
                            <small style="color: var(--text-muted); display: block; font-size: 0.75rem;">${Math.round(macros.targetProteinGrams * 4)} kcal (~${(macros.targetProteinGrams / (p.weightKg || 70)).toFixed(1)}g/kg)</small>
                        </div>
                        <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid #cbd5e1;">
                            <small style="color: #475569; font-weight: 700; display: block;">HEALTHY FATS (${macros.fatPct}%)</small>
                            <strong style="font-size: 1.6rem; color: #475569;">${macros.targetFatGrams} <span style="font-size: 0.85rem;">grams</span></strong>
                            <small style="color: var(--text-muted); display: block; font-size: 0.75rem;">${Math.round(macros.targetFatGrams * 9)} kcal</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 4: Lifestyle & 24h Recall -->
            <div id="intakeTab4" style="display: ${currentIntakeTab === 4 ? 'block' : 'none'};">
                <h4 style="font-weight: 700; color: var(--primary); margin-bottom: 1.25rem;">Lifestyle Assessment & 24-Hour Recall</h4>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                    <div>
                        <label class="form-label">Water Consumption (Liters/day)</label>
                        <input type="number" step="0.5" class="form-control" value="${p.waterConsumptionLiters}" oninput="activePatientForm.waterConsumptionLiters = parseFloat(this.value) || 0;" />
                    </div>
                    <div>
                        <label class="form-label">Sleep Duration (Hours)</label>
                        <input type="number" step="0.5" class="form-control" value="${p.dailySleepDurationHours}" oninput="activePatientForm.dailySleepDurationHours = parseFloat(this.value) || 0;" />
                    </div>
                    <div>
                        <label class="form-label">Sleep Quality</label>
                        <select class="form-select" onchange="activePatientForm.sleepQuality = this.value;">
                            <option value="Restful" ${p.sleepQuality === 'Restful' ? 'selected' : ''}>Restful</option>
                            <option value="Broken" ${p.sleepQuality === 'Broken' ? 'selected' : ''}>Broken</option>
                            <option value="Insomnia" ${p.sleepQuality === 'Insomnia' ? 'selected' : ''}>Insomnia</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Meal Pattern / Frequency</label>
                        <select class="form-select" onchange="activePatientForm.mealFrequency = this.value; activePatientForm.eatingFrequency = this.value.toLowerCase() + ' a day';">
                            <option value="2 Meals" ${(p.mealFrequency === '2 Meals' || p.mealFrequency === '2 meals a day') ? 'selected' : ''}>2 Meals per day</option>
                            <option value="3 Meals" ${(p.mealFrequency === '3 Meals' || p.mealFrequency === '3 meals a day') ? 'selected' : ''}>3 Meals per day</option>
                            <option value="4 Meals" ${(p.mealFrequency === '4 Meals' || p.mealFrequency === '4 meals a day') ? 'selected' : ''}>4 Meals per day</option>
                            <option value="5 Meals" ${(p.mealFrequency === '5 Meals' || p.mealFrequency === '5 meals a day' || p.mealFrequency === 'Small Frequent Meals') ? 'selected' : ''}>5 Meals per day</option>
                            <option value="6 Meals" ${(p.mealFrequency === '6 Meals' || p.mealFrequency === '6 meals a day') ? 'selected' : ''}>6 Meals per day</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label">Emotional Eating Triggers</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 0.75rem; background: var(--bg-light); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        ${['Stress', 'Boredom', 'Anxiety', 'Sadness', 'Late Night Craving', 'None'].map(tr => `
                            <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; cursor: pointer;">
                                <input type="checkbox" ${p.emotionalEatingTriggers.includes(tr) ? 'checked' : ''} onchange="toggleTrigger('${tr}', this.checked)" />
                                <span>${tr}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- 24h Recall Slots -->
                <h5 style="font-weight: 700; margin-bottom: 1rem;">24-Hour Recall Slots</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Breakfast</strong>
                            <input type="text" style="width: 100px; padding: 2px 6px; font-size: 0.8rem;" value="${p.recallBreakfastTime}" oninput="activePatientForm.recallBreakfastTime = this.value" />
                        </div>
                        <textarea class="form-control" rows="2" placeholder="e.g. 2 parathas with curd and tea" oninput="activePatientForm.recallBreakfast = this.value">${p.recallBreakfast}</textarea>
                    </div>

                    <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Mid-Morning Snack</strong>
                            <input type="text" style="width: 100px; padding: 2px 6px; font-size: 0.8rem;" value="${p.recallMidMorningTime}" oninput="activePatientForm.recallMidMorningTime = this.value" />
                        </div>
                        <textarea class="form-control" rows="2" placeholder="e.g. Tea and biscuits or fruit" oninput="activePatientForm.recallMidMorning = this.value">${p.recallMidMorning}</textarea>
                    </div>

                    <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Lunch</strong>
                            <input type="text" style="width: 100px; padding: 2px 6px; font-size: 0.8rem;" value="${p.recallLunchTime}" oninput="activePatientForm.recallLunchTime = this.value" />
                        </div>
                        <textarea class="form-control" rows="2" placeholder="e.g. 2 rotis, rice, dal, sabzi, salad" oninput="activePatientForm.recallLunch = this.value">${p.recallLunch}</textarea>
                    </div>

                    <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Evening Snack</strong>
                            <input type="text" style="width: 100px; padding: 2px 6px; font-size: 0.8rem;" value="${p.recallEveningTime}" oninput="activePatientForm.recallEveningTime = this.value" />
                        </div>
                        <textarea class="form-control" rows="2" placeholder="e.g. Chai with fried snack or nuts" oninput="activePatientForm.recallEvening = this.value">${p.recallEvening}</textarea>
                    </div>

                    <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Dinner</strong>
                            <input type="text" style="width: 100px; padding: 2px 6px; font-size: 0.8rem;" value="${p.recallDinnerTime}" oninput="activePatientForm.recallDinnerTime = this.value" />
                        </div>
                        <textarea class="form-control" rows="2" placeholder="e.g. 2 rotis, dal, sabzi" oninput="activePatientForm.recallDinner = this.value">${p.recallDinner}</textarea>
                    </div>

                    <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong>Bedtime</strong>
                            <input type="text" style="width: 100px; padding: 2px 6px; font-size: 0.8rem;" value="${p.recallBedtimeTime}" oninput="activePatientForm.recallBedtimeTime = this.value" />
                        </div>
                        <textarea class="form-control" rows="2" placeholder="e.g. 1 glass warm milk" oninput="activePatientForm.recallBedtime = this.value">${p.recallBedtime}</textarea>
                    </div>
                </div>
            </div>

            <!-- Footer navigation -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color);">
                <div>
                    ${currentIntakeTab > 1 ? `
                        <button class="btn-outline-teal" onclick="switchIntakeTab(${currentIntakeTab - 1})">
                            <i class="bi bi-chevron-left"></i> Previous
                        </button>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    ${currentIntakeTab < 4 ? `
                        <button class="btn-emerald" onclick="switchIntakeTab(${currentIntakeTab + 1})">
                            Next Step <i class="bi bi-chevron-right"></i>
                        </button>
                    ` : `
                        <button class="btn-emerald" onclick="savePatientProfile()">
                            <i class="bi bi-check-lg"></i> Save Profile
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

function switchIntakeTab(tabIndex) {
    currentIntakeTab = tabIndex;
    updateIntakeView();
}

function togglePatientDiagnosis(diseaseName, isChecked) {
    if (!activePatientForm.clinicalDiagnoses) activePatientForm.clinicalDiagnoses = [];
    if (isChecked && !activePatientForm.clinicalDiagnoses.includes(diseaseName)) {
        activePatientForm.clinicalDiagnoses.push(diseaseName);
    } else if (!isChecked) {
        activePatientForm.clinicalDiagnoses = activePatientForm.clinicalDiagnoses.filter(d => d !== diseaseName);
    }
}

function toggleTrigger(trigger, isChecked) {
    if (!activePatientForm.emotionalEatingTriggers) activePatientForm.emotionalEatingTriggers = [];
    if (isChecked && !activePatientForm.emotionalEatingTriggers.includes(trigger)) {
        activePatientForm.emotionalEatingTriggers.push(trigger);
    } else if (!isChecked) {
        activePatientForm.emotionalEatingTriggers = activePatientForm.emotionalEatingTriggers.filter(t => t !== trigger);
    }
}

function calculateAgeFromDOB() {
    if (!activePatientForm.dateOfBirth) return;
    const diff = new Date() - new Date(activePatientForm.dateOfBirth);
    activePatientForm.age = Math.max(0, Math.floor(diff / (365.25 * 24 * 3600 * 1000)));
}

function savePatientProfile() {
    if (!activePatientForm.name.trim()) {
        alert('Please enter Patient Name.');
        switchIntakeTab(1);
        return;
    }

    const index = db.patients.findIndex(p => p.id === activePatientForm.id);
    if (index >= 0) {
        db.patients[index] = activePatientForm;
    } else {
        db.patients.unshift(activePatientForm);
    }
    db.save();
    alert('Patient clinical intake saved successfully!');
    navigateTo('dashboard');
}

// ==========================================
// VIEW: DISEASE MASTER
// ==========================================
let diseaseSearchTerm = '';
let diseaseCategoryFilter = 'All';

function renderDiseaseMaster(container) {
    const categories = ['All', 'Metabolic', 'Cardiovascular', 'Renal', 'Hepatic', 'Endocrine', 'Gastrointestinal', 'Autoimmune'];
    
    const filtered = db.diseases.filter(d => {
        const matchesCat = diseaseCategoryFilter === 'All' || d.category === diseaseCategoryFilter;
        const matchesSearch = !diseaseSearchTerm ||
            d.name.toLowerCase().includes(diseaseSearchTerm.toLowerCase()) ||
            d.dietaryGuidelines.toLowerCase().includes(diseaseSearchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="font-weight: 800; font-size: 1.5rem; color: var(--text-primary);">
                    <i class="bi bi-shield-shaded" style="color: var(--primary); margin-right: 0.5rem;"></i>
                    Disease Master Database
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Manage clinical diagnoses, pathophysiological categories, and clinical dietary guidelines.
                </p>
            </div>
            <button class="btn-emerald" onclick="openDiseaseModal()">
                <i class="bi bi-plus-lg"></i> Add Clinical Disease
            </button>
        </div>

        <div class="card-custom" style="padding: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                <div style="flex: 1; min-width: 250px;">
                    <input type="text" class="form-control" placeholder="Search disease by name or guidelines..." value="${diseaseSearchTerm}" oninput="diseaseSearchTerm = this.value; renderDiseaseMaster(document.getElementById('mainContent'));" />
                </div>
                <div style="width: 220px;">
                    <select class="form-select" onchange="diseaseCategoryFilter = this.value; renderDiseaseMaster(document.getElementById('mainContent'));">
                        ${categories.map(c => `<option value="${c}" ${diseaseCategoryFilter === c ? 'selected' : ''}>${c} Category</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem;">
            ${filtered.map(d => {
                const restrictedFoods = db.getRestrictedFoodsForDisease(d.id);
                const restrictedCount = restrictedFoods.length;
                return `
                    <div class="card-custom" style="display: flex; flex-direction: column; border-left: 4px solid var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.72rem; padding: 2px 8px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: 700;">
                                ${d.category}
                            </span>
                            <div style="display: flex; gap: 6px;">
                                <button style="background: #f0fdfa; border: 1px solid #ccfbf1; color: var(--primary); border-radius: 6px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Edit Disease" onclick="openDiseaseModal('${d.id}')">
                                    <i class="bi bi-pencil-fill"></i>
                                </button>
                                <button style="background: #fef2f2; border: 1px solid #fee2e2; color: var(--danger); border-radius: 6px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Delete Disease" onclick="deleteDisease('${d.id}')">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </div>
                        </div>

                        <h4 style="font-weight: 800; font-size: 1.2rem; color: var(--text-primary); margin-bottom: 0.35rem;">${d.name}</h4>
                        <p style="color: var(--text-secondary); font-size: 0.82rem; margin-bottom: 0.75rem;">${d.description || 'Clinical diagnostic entity.'}</p>

                        <div style="background: var(--bg-light); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
                            <strong style="color: var(--primary); font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">
                                <i class="bi bi-journal-medical me-1"></i> Clinical Guidelines:
                            </strong>
                            <small style="color: var(--text-primary); font-size: 0.8rem; display: block; line-height: 1.35;">${d.dietaryGuidelines || 'Therapeutic dietary protocol.'}</small>
                        </div>

                        <!-- Assigned Restricted Foods (Disease -> Multiple Restricted Foods) -->
                        <div style="background: #fff8f8; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px dashed #fecaca; margin-bottom: 1rem; flex-grow: 1;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <strong style="color: #991b1b; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.03em;">
                                    <i class="bi bi-slash-circle me-1"></i> Restricted Foods / Meals (${restrictedCount}):
                                </strong>
                                <span style="font-size: 0.7rem; background: #fee2e2; color: #991b1b; padding: 1px 7px; border-radius: 9999px; font-weight: 800;">
                                    ${restrictedCount} Assigned
                                </span>
                            </div>

                            ${restrictedCount === 0 ? `
                                <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No restricted foods assigned. Click edit to assign foods from Item Master.</div>
                            ` : `
                                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                    ${restrictedFoods.map(rf => `
                                        <span style="font-size: 0.73rem; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 9999px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                            🚫 ${rf.name}
                                        </span>
                                    `).join('')}
                                </div>
                            `}
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.65rem; border-top: 1px solid var(--border-color);">
                            <span style="font-size: 0.75rem; color: var(--text-muted);">
                                ID: <code>${d.id}</code>
                            </span>
                            <button class="btn-outline-teal" style="font-size: 0.75rem; padding: 3px 10px;" onclick="openDiseaseModal('${d.id}')">
                                <i class="bi bi-gear-fill me-1"></i> Manage Restricted Foods
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Global modal state for restricted foods
window._activeModalRestrictedFoodIds = [];

function openDiseaseModal(diseaseId = null) {
    const d = diseaseId ? db.getDisease(diseaseId) : {
        id: 'd-' + Date.now(),
        name: '',
        category: 'Metabolic',
        description: '',
        dietaryGuidelines: '',
        restrictedFoodIds: [],
        restrictedFoodNames: []
    };

    window._activeModalRestrictedFoodIds = [...(d.restrictedFoodIds || [])];

    const container = document.getElementById('modalContainer');
    container.innerHTML = `
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
            <div class="modal-dialog" style="max-width: 680px; max-height: 90vh; display: flex; flex-direction: column;">
                <div class="modal-header">
                    <h5 style="font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
                        <i class="bi bi-shield-plus"></i> ${diseaseId ? 'Edit Clinical Disease & Restricted Foods' : 'Add New Clinical Disease'}
                    </h5>
                    <button style="background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer;" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body" style="overflow-y: auto; padding: 1.25rem;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label class="form-label required fw-bold">Disease / Condition Name</label>
                            <input type="text" class="form-control" id="modalDiseaseName" placeholder="e.g. Diabetes / Sugar" value="${d.name}" required />
                        </div>
                        <div>
                            <label class="form-label fw-bold">Pathology Category</label>
                            <select class="form-select" id="modalDiseaseCategory">
                                ${['Metabolic', 'Cardiovascular', 'Renal', 'Hepatic', 'Endocrine', 'Gastrointestinal', 'Autoimmune'].map(c => `
                                    <option value="${c}" ${d.category === c ? 'selected' : ''}>${c}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <label class="form-label fw-bold">Pathophysiological Description</label>
                        <textarea class="form-control" id="modalDiseaseDesc" rows="2" placeholder="e.g. Impaired insulin secretion and resistance leading to chronic hyperglycemia...">${d.description || ''}</textarea>
                    </div>

                    <div style="margin-bottom: 1.25rem;">
                        <label class="form-label required fw-bold">Clinical Dietary Guidelines</label>
                        <textarea class="form-control" id="modalDiseaseGuide" rows="2" placeholder="e.g. Low glycemic index carbohydrates, high soluble fiber, strict restriction of simple sugars...">${d.dietaryGuidelines || ''}</textarea>
                    </div>

                    <!-- RESTRICTED FOODS MULTI-SELECTION SECTION (Disease -> Multiple Restricted Foods) -->
                    <div style="border-top: 1.5px solid var(--border-color); padding-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <label class="form-label fw-bold" style="color: #991b1b; margin: 0; font-size: 0.95rem;">
                                <i class="bi bi-slash-circle me-1"></i> Select Restricted Foods / Meals from Item Master
                            </label>
                            <span id="modalRestrictedCountBadge" style="background: #fee2e2; color: #991b1b; font-size: 0.75rem; font-weight: 800; padding: 2px 10px; border-radius: 9999px;">
                                ${window._activeModalRestrictedFoodIds.length} Selected
                            </span>
                        </div>
                        <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                            Search and select foods that are contraindicated for this disease. When assigned to a user, these foods will be strictly blocked during diet generation and editing.
                        </p>

                        <!-- Selected Foods Tray -->
                        <div id="modalSelectedFoodsTray" style="background: #fff8f8; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 8px 10px; min-height: 44px; display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; align-items: center;">
                            <!-- Populated dynamically -->
                        </div>

                        <!-- Live Food Search Input -->
                        <div style="position: relative; margin-bottom: 8px;">
                            <input type="text" id="modalFoodSearchInput" class="form-control" placeholder="Type to search foods (e.g. Sugar, Sweets, Cake, Cold Drink, Rice)..." oninput="renderModalFoodPickerList(this.value)" />
                            <i class="bi bi-search" style="position: absolute; right: 12px; top: 10px; color: var(--text-muted);"></i>
                        </div>

                        <!-- Scrollable Food Picker Grid -->
                        <div id="modalFoodPickerGrid" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 6px; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; background: #ffffff;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="border-top: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                    <button class="btn-outline-teal" onclick="closeModal()">Cancel</button>
                    <button class="btn-emerald" onclick="saveDiseaseRecord('${d.id}')">
                        <i class="bi bi-check-lg"></i> Save Disease & Restrictions
                    </button>
                </div>
            </div>
        </div>
    `;

    renderModalSelectedFoodsTray();
    renderModalFoodPickerList('');
}

function renderModalSelectedFoodsTray() {
    const tray = document.getElementById('modalSelectedFoodsTray');
    const badge = document.getElementById('modalRestrictedCountBadge');
    if (!tray) return;

    const ids = window._activeModalRestrictedFoodIds || [];
    if (badge) badge.innerText = `${ids.length} Selected`;

    if (ids.length === 0) {
        tray.innerHTML = `<span style="font-size: 0.78rem; color: #94a3b8; font-style: italic;">No restricted foods selected yet. Click any food below to add restriction.</span>`;
        return;
    }

    tray.innerHTML = ids.map(id => {
        const food = db.getFood(id);
        const name = food ? food.name : id;
        return `
            <span style="display: inline-flex; align-items: center; gap: 6px; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
                🚫 ${name}
                <button type="button" onclick="removeModalRestrictedFood('${id}')" style="border: none; background: transparent; color: #991b1b; font-size: 0.85rem; font-weight: 800; cursor: pointer; padding: 0; line-height: 1;">✕</button>
            </span>
        `;
    }).join('');
}

function renderModalFoodPickerList(searchTerm = '') {
    const grid = document.getElementById('modalFoodPickerGrid');
    if (!grid) return;

    const term = (searchTerm || '').toLowerCase().trim();
    const allFoods = db.getFoods();
    const filtered = allFoods.filter(f => !term || f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term));

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 12px;">No food items match "${searchTerm}".</div>`;
        return;
    }

    const selectedIds = window._activeModalRestrictedFoodIds || [];

    grid.innerHTML = filtered.map(f => {
        const isSelected = selectedIds.includes(f.id);
        return `
            <div onclick="toggleModalRestrictedFood('${f.id}')" style="padding: 6px 10px; border-radius: 6px; border: 1px solid ${isSelected ? '#ef4444' : '#e2e8f0'}; background: ${isSelected ? '#fef2f2' : '#ffffff'}; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease;">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <div style="font-size: 0.8rem; font-weight: ${isSelected ? '800' : '600'}; color: ${isSelected ? '#b91c1c' : 'var(--text-primary)'};">${f.name}</div>
                    <div style="font-size: 0.68rem; color: var(--text-muted);">${f.category} • ${f.dietCategory}</div>
                </div>
                <div style="width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid ${isSelected ? '#ef4444' : '#cbd5e1'}; background: ${isSelected ? '#ef4444' : '#ffffff'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; margin-left: 6px;">
                    ${isSelected ? '✓' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function toggleModalRestrictedFood(foodId) {
    if (!window._activeModalRestrictedFoodIds) window._activeModalRestrictedFoodIds = [];
    const idx = window._activeModalRestrictedFoodIds.indexOf(foodId);
    if (idx >= 0) {
        window._activeModalRestrictedFoodIds.splice(idx, 1);
    } else {
        window._activeModalRestrictedFoodIds.push(foodId);
    }
    renderModalSelectedFoodsTray();
    const searchVal = document.getElementById('modalFoodSearchInput')?.value || '';
    renderModalFoodPickerList(searchVal);
}

function removeModalRestrictedFood(foodId) {
    if (!window._activeModalRestrictedFoodIds) return;
    const idx = window._activeModalRestrictedFoodIds.indexOf(foodId);
    if (idx >= 0) {
        window._activeModalRestrictedFoodIds.splice(idx, 1);
        renderModalSelectedFoodsTray();
        const searchVal = document.getElementById('modalFoodSearchInput')?.value || '';
        renderModalFoodPickerList(searchVal);
    }
}

function saveDiseaseRecord(id) {
    const name = document.getElementById('modalDiseaseName').value.trim();
    const category = document.getElementById('modalDiseaseCategory').value;
    const desc = document.getElementById('modalDiseaseDesc').value.trim();
    const guide = document.getElementById('modalDiseaseGuide').value.trim();

    if (!name) {
        alert('Please enter Disease Name.');
        return;
    }

    const restrictedFoodIds = window._activeModalRestrictedFoodIds || [];

    db.saveDisease({
        id,
        name,
        category,
        description: desc,
        dietaryGuidelines: guide,
        restrictedNutrients: [],
        restrictedFoodIds: restrictedFoodIds
    });

    closeModal();
    renderDiseaseMaster(document.getElementById('mainContent'));
}

function deleteDisease(id) {
    if (!window.AdminAuth || !window.AdminAuth.isAuthenticated()) {
        showToast('⚠️ Admin authentication required to delete disease.');
        return;
    }
    const disease = db.getDisease(id);
    const diseaseName = disease ? disease.name : 'this disease';
    if (confirm(`Are you sure you want to delete "${diseaseName}" from Disease Master?`)) {
        db.deleteDisease(id);
        renderDiseaseMaster(document.getElementById('mainContent'));
    }
}

// ==========================================
// VIEW: ITEM MASTER (FOOD DATABASE)
// ==========================================
let foodSearchTerm = '';
let foodCategoryFilter = 'All';
let foodDietFilter = 'All';

function renderMasterItems(container) {
    const categories = ['All', 'Cereals', 'Proteins', 'Dairy', 'Vegetables', 'Fruits', 'Nuts & Seeds', 'Snacks', 'Beverages', 'Supplements'];

    const filtered = db.foods.filter(f => {
        const matchesCat = foodCategoryFilter === 'All' || f.category === foodCategoryFilter;
        const matchesDiet = foodDietFilter === 'All' || f.dietCategory === foodDietFilter;
        const matchesSearch = !foodSearchTerm ||
            f.name.toLowerCase().includes(foodSearchTerm.toLowerCase()) ||
            (f.notes && f.notes.toLowerCase().includes(foodSearchTerm.toLowerCase()));
        return matchesCat && matchesDiet && matchesSearch;
    });

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="font-weight: 800; font-size: 1.5rem; color: var(--text-primary);">
                    <i class="bi bi-database-fill-gear" style="color: var(--primary); margin-right: 0.5rem;"></i>
                    Food Item Master Database
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Macronutrients per 1g (1g C/P = 4 kcal, 1g Fat = 9 kcal) and Disease Restrictions Mapping.
                </p>
            </div>
            <button class="btn-emerald" onclick="openFoodModal()">
                <i class="bi bi-plus-lg"></i> Add Food Item
            </button>
        </div>

        <div class="card-custom" style="padding: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                <div style="flex: 1; min-width: 250px;">
                    <input type="text" class="form-control" placeholder="Search food by name or notes..." value="${foodSearchTerm}" oninput="foodSearchTerm = this.value; renderMasterItems(document.getElementById('mainContent'));" />
                </div>
                <div style="width: 180px;">
                    <select class="form-select" onchange="foodCategoryFilter = this.value; renderMasterItems(document.getElementById('mainContent'));">
                        ${categories.map(c => `<option value="${c}" ${foodCategoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div style="width: 160px;">
                    <select class="form-select" onchange="foodDietFilter = this.value; renderMasterItems(document.getElementById('mainContent'));">
                        <option value="All" ${foodDietFilter === 'All' ? 'selected' : ''}>All Diets</option>
                        <option value="Vegetarian" ${foodDietFilter === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
                        <option value="Non-Veg" ${foodDietFilter === 'Non-Veg' ? 'selected' : ''}>Non-Veg</option>
                        <option value="Vegan" ${foodDietFilter === 'Vegan' ? 'selected' : ''}>Vegan</option>
                        <option value="Eggitarian" ${foodDietFilter === 'Eggitarian' ? 'selected' : ''}>Eggitarian</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="card-custom">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: var(--bg-light); border-bottom: 2px solid var(--border-color); text-align: left;">
                            <th style="padding: 0.85rem 1rem;">Food Item</th>
                            <th style="padding: 0.85rem 1rem;">Category</th>
                            <th style="padding: 0.85rem 1rem;">Macros per 1 Gram</th>
                            <th style="padding: 0.85rem 1rem;">Standard Serving</th>
                            <th style="padding: 0.85rem 1rem;">Serving Energy</th>
                            <th style="padding: 0.85rem 1rem;">Disease Restrictions</th>
                            <th style="padding: 0.85rem 1rem; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(f => {
                            const calPerG = Number(((f.carbsPerGram * 4) + (f.proteinPerGram * 4) + (f.fatPerGram * 9)).toFixed(2));
                            const servingCalories = Math.round(calPerG * f.servingQuantity);
                            const servingProt = Number((f.proteinPerGram * f.servingQuantity).toFixed(1));
                            const servingCarb = Number((f.carbsPerGram * f.servingQuantity).toFixed(1));
                            const servingFat = Number((f.fatPerGram * f.servingQuantity).toFixed(1));

                            return `
                                <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-light)'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 1rem;">
                                        <div style="font-weight: 800; color: var(--text-primary);">${f.name}</div>
                                        <div style="display: flex; align-items: center; gap: 4px; margin-top: 3px;">
                                            <span style="font-size: 0.72rem; padding: 1px 6px; background: #dcfce7; color: #15803d; border-radius: 4px; font-weight: 700;">
                                                ${f.dietCategory}
                                            </span>
                                            ${f.notes ? `<small style="color: var(--text-muted); font-size: 0.72rem;">${f.notes}</small>` : ''}
                                        </div>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <span style="font-size: 0.75rem; background: var(--bg-light); border: 1px solid var(--border-color); padding: 2px 8px; border-radius: 4px; font-weight: 600;">
                                            ${f.category}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <div style="font-size: 0.8rem;">
                                            <span style="color: #b45309; font-weight: 700;">C: ${f.carbsPerGram}g</span> |
                                            <span style="color: var(--secondary); font-weight: 700;">P: ${f.proteinPerGram}g</span> |
                                            <span style="color: #475569; font-weight: 700;">F: ${f.fatPerGram}g</span>
                                        </div>
                                        <small style="color: var(--text-muted); font-family: monospace;">${calPerG} kcal/g</small>
                                    </td>
                                    <td style="padding: 1rem; font-weight: 700;">
                                        ${f.servingQuantity} ${f.standardUnit}
                                    </td>
                                    <td style="padding: 1rem;">
                                        <strong style="color: var(--danger); font-size: 1rem;">${servingCalories} kcal</strong>
                                        <div style="color: var(--text-muted); font-size: 0.75rem;">
                                            P: ${servingProt}g | C: ${servingCarb}g | F: ${servingFat}g
                                        </div>
                                    </td>
                                    <td style="padding: 1rem;">
                                        ${f.contraindicatedDiseases && f.contraindicatedDiseases.length > 0 ? `
                                            <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 220px;">
                                                ${f.contraindicatedDiseases.map(d => `
                                                    <span style="font-size: 0.72rem; padding: 2px 6px; background: #fee2e2; color: #991b1b; border-radius: 4px; font-weight: 600;">
                                                        <i class="bi bi-x-circle me-1"></i>${d}
                                                    </span>
                                                `).join('')}
                                            </div>
                                        ` : `
                                            <span style="font-size: 0.72rem; padding: 2px 6px; background: #dcfce7; color: #166534; border-radius: 4px; font-weight: 600;">
                                                <i class="bi bi-check-circle me-1"></i>Safe for All
                                            </span>
                                        `}
                                    </td>
                                    <td style="padding: 1rem; text-align: right;">
                                        <div style="display: inline-flex; gap: 4px;">
                                            <button style="background: none; border: 1px solid var(--border-color); color: var(--primary); border-radius: var(--radius-sm); padding: 0.35rem 0.55rem; cursor: pointer;" title="Edit" onclick="openFoodModal('${f.id}')">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button style="background: none; border: 1px solid var(--border-color); color: var(--danger); border-radius: var(--radius-sm); padding: 0.35rem 0.55rem; cursor: pointer;" title="Delete" onclick="deleteFood('${f.id}')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openFoodModal(foodId = null) {
    const f = foodId ? db.foods.find(x => x.id === foodId) : {
        id: 'f-' + Date.now(),
        name: '',
        category: 'Cereals',
        standardUnit: 'g',
        servingQuantity: 100,
        carbsPerGram: 0.20,
        proteinPerGram: 0.05,
        fatPerGram: 0.02,
        fiberPerGram: 0.02,
        dietCategory: 'Vegetarian',
        contraindicatedDiseases: [],
        notes: ''
    };

    const container = document.getElementById('modalContainer');
    container.innerHTML = `
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
            <div class="modal-dialog" style="max-width: 760px;">
                <div class="modal-header">
                    <h5 style="font-weight: 800; margin: 0;">
                        <i class="bi bi-plus-circle me-2"></i> ${foodId ? 'Edit Clinical Food Item' : 'Add New Food Item to Master'}
                    </h5>
                    <button style="background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer;" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label class="form-label required">Food Item Name</label>
                            <input type="text" class="form-control" id="modalFoodName" placeholder="e.g. Cooked Brown Rice" value="${f.name}" required />
                        </div>
                        <div>
                            <label class="form-label">Category</label>
                            <select class="form-select" id="modalFoodCategory">
                                ${['Cereals', 'Proteins', 'Dairy', 'Vegetables', 'Fruits', 'Nuts & Seeds', 'Snacks', 'Beverages', 'Supplements'].map(c => `
                                    <option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Diet Category</label>
                            <select class="form-select" id="modalFoodDiet">
                                ${['Vegetarian', 'Non-Veg', 'Vegan', 'Eggitarian', 'Jain'].map(c => `
                                    <option value="${c}" ${f.dietCategory === c ? 'selected' : ''}>${c}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                        <div>
                            <label class="form-label required">Serving Quantity</label>
                            <input type="number" step="1" class="form-control" id="modalFoodServingQty" value="${f.servingQuantity}" oninput="recalcFoodModalYield()" />
                        </div>
                        <div>
                            <label class="form-label required">Serving Unit</label>
                            <input type="text" class="form-control" id="modalFoodUnit" placeholder="g, ml, piece, roti, bowl" value="${f.standardUnit}" />
                        </div>
                    </div>

                    <!-- MACRONUTRIENTS PER 1 GRAM -->
                    <div style="background: var(--bg-light); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
                        <h6 style="font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                            <i class="bi bi-speedometer2 me-1"></i> Macronutrients per 1 Gram (g/g)
                        </h6>
                        <p style="color: var(--text-muted); font-size: 0.75rem; margin-bottom: 1rem;">
                            1g Carb = 4 kcal • 1g Protein = 4 kcal • 1g Fat = 9 kcal. Energy density calculated automatically.
                        </p>

                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                            <div>
                                <label class="form-label" style="color: #b45309;">Carbs (g/g)</label>
                                <input type="number" step="0.001" min="0" max="1" class="form-control" id="modalFoodCarbs" value="${f.carbsPerGram}" oninput="recalcFoodModalYield()" />
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--secondary);">Protein (g/g)</label>
                                <input type="number" step="0.001" min="0" max="1" class="form-control" id="modalFoodProtein" value="${f.proteinPerGram}" oninput="recalcFoodModalYield()" />
                            </div>
                            <div>
                                <label class="form-label" style="color: #475569;">Fats (g/g)</label>
                                <input type="number" step="0.001" min="0" max="1" class="form-control" id="modalFoodFat" value="${f.fatPerGram}" oninput="recalcFoodModalYield()" />
                            </div>
                            <div>
                                <label class="form-label" style="color: var(--success);">Fiber (g/g)</label>
                                <input type="number" step="0.001" min="0" max="1" class="form-control" id="modalFoodFiber" value="${f.fiberPerGram || 0}" />
                            </div>
                        </div>

                        <div style="background: #ffffff; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" id="modalFoodLiveYield">
                            <!-- Calculated yield is inserted here -->
                        </div>
                    </div>

                    <!-- VITAMINS & MICRONUTRIENTS (Total per Standard Serving) -->
                    <div style="background: #f0fdf4; padding: 1.25rem; border-radius: var(--radius-md); border: 1.5px solid #bbf7d0; margin-bottom: 1.25rem;">
                        <h6 style="font-weight: 700; color: #166534; margin-bottom: 0.5rem;">
                            <i class="bi bi-capsule me-1"></i> Vitamins & Minerals (Total per Standard Serving: ${f.servingQuantity}${f.standardUnit})
                        </h6>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                            <div>
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Vitamin A (mcg)</label>
                                <input type="number" step="0.1" class="form-control" id="modalFoodVitA" value="${Number(((f.vitaminA_mcgPerGram || 0) * f.servingQuantity).toFixed(1))}" />
                            </div>
                            <div>
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Vitamin D (mcg)</label>
                                <input type="number" step="0.01" class="form-control" id="modalFoodVitD" value="${Number(((f.vitaminD_mcgPerGram || 0) * f.servingQuantity).toFixed(2))}" />
                            </div>
                            <div>
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Vitamin B12 (mcg)</label>
                                <input type="number" step="0.01" class="form-control" id="modalFoodVitB12" value="${Number(((f.vitaminB12_mcgPerGram || 0) * f.servingQuantity).toFixed(2))}" />
                            </div>
                            <div>
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Vitamin C (mg)</label>
                                <input type="number" step="0.1" class="form-control" id="modalFoodVitC" value="${Number(((f.vitaminC_mgPerGram || 0) * f.servingQuantity).toFixed(1))}" />
                            </div>
                            <div>
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Calcium (mg)</label>
                                <input type="number" step="0.1" class="form-control" id="modalFoodCalcium" value="${Number(((f.calcium_mgPerGram || 0) * f.servingQuantity).toFixed(1))}" />
                            </div>
                            <div>
                                <label class="form-label" style="font-size: 0.75rem; font-weight: 700;">Iron (mg)</label>
                                <input type="number" step="0.01" class="form-control" id="modalFoodIron" value="${Number(((f.iron_mgPerGram || 0) * f.servingQuantity).toFixed(2))}" />
                            </div>
                        </div>
                    </div>

                    <!-- DISEASE RESTRICTIONS MAPPING -->
                    <div style="margin-bottom: 1rem;">
                        <h6 style="font-weight: 700; color: var(--danger); margin-bottom: 0.35rem;">
                            <i class="bi bi-shield-x me-1"></i> Contraindicated Diseases Mapping
                        </h6>
                        <small style="color: var(--text-muted); display: block; margin-bottom: 0.75rem; font-size: 0.75rem;">
                            Check clinical diagnoses for which this food item is strictly contraindicated (filtered out in auto-planning):
                        </small>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem; max-height: 150px; overflow-y: auto; padding: 0.75rem; background: var(--bg-light); border-radius: var(--radius-sm); border: 1px solid var(--border-color);" id="modalDiseaseCheckboxes">
                            ${db.diseases.map(d => {
                                const isChecked = (f.contraindicatedDiseases || []).includes(d.name);
                                return `
                                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; cursor: pointer;">
                                        <input type="checkbox" value="${d.name}" ${isChecked ? 'checked' : ''} />
                                        <span>${d.name}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div>
                        <label class="form-label">Clinical Notes & Micronutrients</label>
                        <textarea class="form-control" id="modalFoodNotes" rows="2" placeholder="e.g. Rich in Omega-3, low glycemic index, high potassium...">${f.notes || ''}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline-teal" onclick="closeModal()">Cancel</button>
                    <button class="btn-emerald" onclick="saveFoodRecord('${f.id}')">Save Food Item</button>
                </div>
            </div>
        </div>
    `;

    recalcFoodModalYield();
}

function recalcFoodModalYield() {
    const c = parseFloat(document.getElementById('modalFoodCarbs').value) || 0;
    const p = parseFloat(document.getElementById('modalFoodProtein').value) || 0;
    const f = parseFloat(document.getElementById('modalFoodFat').value) || 0;
    const qty = parseFloat(document.getElementById('modalFoodServingQty').value) || 100;
    const unit = document.getElementById('modalFoodUnit').value || 'g';

    const calPerG = (c * 4) + (p * 4) + (f * 9);
    const totalCal = Math.round(calPerG * qty);

    const el = document.getElementById('modalFoodLiveYield');
    if (el) {
        el.innerHTML = `
            <div>
                <small style="color: var(--text-muted); font-size: 0.72rem; display: block;">AUTOMATED ENERGY</small>
                <strong>${calPerG.toFixed(2)} kcal/g</strong>
            </div>
            <div>
                <small style="color: var(--text-muted); font-size: 0.72rem; display: block;">PER SERVING (${qty} ${unit})</small>
                <strong style="color: var(--danger); font-size: 1.1rem;">${totalCal} kcal</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">P: ${(p*qty).toFixed(1)}g | C: ${(c*qty).toFixed(1)}g | F: ${(f*qty).toFixed(1)}g</span>
            </div>
        `;
    }
}

function saveFoodRecord(id) {
    const name = document.getElementById('modalFoodName').value.trim();
    const category = document.getElementById('modalFoodCategory').value;
    const dietCategory = document.getElementById('modalFoodDiet').value;
    const servingQty = parseFloat(document.getElementById('modalFoodServingQty').value) || 100;
    const unit = document.getElementById('modalFoodUnit').value.trim() || 'g';
    const carbs = parseFloat(document.getElementById('modalFoodCarbs').value) || 0;
    const protein = parseFloat(document.getElementById('modalFoodProtein').value) || 0;
    const fat = parseFloat(document.getElementById('modalFoodFat').value) || 0;
    const fiber = parseFloat(document.getElementById('modalFoodFiber').value) || 0;
    const vitA = parseFloat(document.getElementById('modalFoodVitA')?.value) || 0;
    const vitD = parseFloat(document.getElementById('modalFoodVitD')?.value) || 0;
    const vitB12 = parseFloat(document.getElementById('modalFoodVitB12')?.value) || 0;
    const vitC = parseFloat(document.getElementById('modalFoodVitC')?.value) || 0;
    const calcium = parseFloat(document.getElementById('modalFoodCalcium')?.value) || 0;
    const iron = parseFloat(document.getElementById('modalFoodIron')?.value) || 0;
    const notes = document.getElementById('modalFoodNotes').value.trim();

    if (!name) {
        alert('Please enter Food Item Name.');
        return;
    }

    const checkedDiseases = [];
    document.querySelectorAll('#modalDiseaseCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        checkedDiseases.push(cb.value);
    });

    const newFood = {
        id,
        name,
        category,
        dietCategory,
        servingQuantity: servingQty,
        standardUnit: unit,
        carbsPerGram: carbs,
        proteinPerGram: protein,
        fatPerGram: fat,
        fiberPerGram: fiber,
        vitaminA_mcgPerGram: vitA / servingQty,
        vitaminD_mcgPerGram: vitD / servingQty,
        vitaminB12_mcgPerGram: vitB12 / servingQty,
        vitaminC_mgPerGram: vitC / servingQty,
        calcium_mgPerGram: calcium / servingQty,
        iron_mgPerGram: iron / servingQty,
        contraindicatedDiseases: checkedDiseases,
        notes
    };

    db.saveFood(newFood);
    closeModal();
    renderMasterItems(document.getElementById('mainContent'));
}

function deleteFood(id) {
    if (!window.AdminAuth || !window.AdminAuth.isAuthenticated()) {
        showToast('⚠️ Admin authentication required to delete food item.');
        return;
    }
    if (confirm('Are you sure you want to delete this food item from master database?')) {
        db.deleteFood(id);
        renderMasterItems(document.getElementById('mainContent'));
    }
}

// ==========================================
// VIEW: DYNAMIC DIET PLAN GENERATOR
// ==========================================
function renderDietGenerator(container, patientId = null) {
    const patients = db.patients;
    let selectedPatient = patientId ? patients.find(p => p.id === patientId) : (patients.length > 0 ? patients[0] : null);

    if (selectedPatient && (!activeDietPlan || activeDietPlan.patientId !== selectedPatient.id)) {
        activeDietPlan = DietGenerator.generatePlan(selectedPatient);
    }

    updateDietGeneratorView(container, selectedPatient);
}

function updateDietGeneratorView(container, selectedPatient) {
    if (!selectedPatient) {
        container.innerHTML = `
            <div class="card-custom text-center py-5">
                <i class="bi bi-person-exclamation" style="font-size: 3rem; color: var(--text-muted);"></i>
                <h4 style="margin-top: 1rem;">No Patients in Registry</h4>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Add a patient intake profile first to generate custom diet charts.</p>
                <button class="btn-emerald" onclick="navigateTo('patient-intake')">
                    <i class="bi bi-plus-lg"></i> Add Patient Intake
                </button>
            </div>
        `;
        return;
    }

    const { safe, excluded } = DietGenerator.filterFoodsForPatient(selectedPatient, db.foods);
    const plan = activeDietPlan;

    // Totals
    const totalCal = Math.round(plan.mealItems.reduce((acc, i) => acc + (i.calories || 0), 0));
    const totalProt = Number(plan.mealItems.reduce((acc, i) => acc + (i.protein || 0), 0).toFixed(1));
    const totalCarb = Number(plan.mealItems.reduce((acc, i) => acc + (i.carbs || 0), 0).toFixed(1));
    const totalFat = Number(plan.mealItems.reduce((acc, i) => acc + (i.fat || 0), 0).toFixed(1));
    const totalFiber = Number(plan.mealItems.reduce((acc, i) => acc + (i.fiber || 0), 0).toFixed(1));

    const diffCal = totalCal - plan.targetCalories;
    const calPct = Math.min(100, Math.round((totalCal / (plan.targetCalories || 1)) * 100));

    let statusText = 'Optimal (±100 kcal)';
    let statusClass = 'badge-bmi-normal';
    if (diffCal > 100) {
        statusText = `Surplus of +${diffCal} kcal`;
        statusClass = 'badge-bmi-overweight';
    } else if (diffCal < -100) {
        statusText = `Deficit of ${Math.abs(diffCal)} kcal`;
        statusClass = 'badge-bmi-underweight';
    }

    const slots = [
        { name: 'Breakfast', defaultTime: '08:30 AM', icon: 'bi-cup-hot-fill' },
        { name: 'Mid-Morning', defaultTime: '11:00 AM', icon: 'bi-apple' },
        { name: 'Lunch', defaultTime: '01:30 PM', icon: 'bi-sun-fill' },
        { name: 'Evening', defaultTime: '05:30 PM', icon: 'bi-cup-straw' },
        { name: 'Dinner', defaultTime: '08:30 PM', icon: 'bi-moon-stars-fill' },
        { name: 'Bedtime', defaultTime: '10:00 PM', icon: 'bi-cup' }
    ];

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="font-weight: 800; font-size: 1.5rem; color: var(--text-primary);">
                    <i class="bi bi-journal-medical" style="color: var(--primary); margin-right: 0.5rem;"></i>
                    Automated Clinical Diet Plan Generator
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Smart contraindicated disease filtering, target macro matching, and dietitian override customizer.
                </p>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn-outline-teal" onclick="navigateTo('diet-plans')">
                    <i class="bi bi-folder-fill"></i> Saved Charts
                </button>
                <button class="btn-emerald" onclick="finalizeAndSavePlan()">
                    <i class="bi bi-check-circle-fill"></i> Finalize & View Chart
                </button>
            </div>
        </div>

        <!-- Step 1: Patient Selection Card -->
        <div class="card-custom" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="font-weight: 800; color: var(--primary); margin: 0;">
                    <i class="bi bi-person-check-fill me-2"></i> Step 1: Select Registered Patient
                </h4>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-outline-teal" style="font-size: 0.75rem; padding: 2px 8px;" onclick="regeneratePlanForPatient('${selectedPatient.id}')">
                        <i class="bi bi-arrow-clockwise"></i> Re-Calculate Auto Plan
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div>
                    <label class="form-label fw-bold">Select Patient</label>
                    <select class="form-select form-select-lg" onchange="switchGeneratorPatient(this.value)">
                        ${db.patients.map(p => `
                            <option value="${p.id}" ${p.id === selectedPatient.id ? 'selected' : ''}>
                                ${p.name} (${p.age || 30} yrs, ${p.gender} - ${p.primaryDietType})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div>
                    <label class="form-label fw-bold">Prescription Chart Title</label>
                    <input type="text" class="form-control form-control-lg" value="${plan.planTitle}" oninput="activeDietPlan.planTitle = this.value" />
                </div>
            </div>

            <!-- Vitals Banner -->
            <div style="background: var(--bg-light); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: center;">
                <div>
                    <small style="color: var(--text-muted); font-size: 0.72rem; display: block; font-weight: 700;">ANTHROPOMETRICS</small>
                    <strong style="font-size: 1.15rem; color: var(--text-primary);">${selectedPatient.name}</strong>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        Ht: ${selectedPatient.heightCm}cm | Wt: ${selectedPatient.weightKg}kg | BMI: <strong style="color: var(--primary);">${plan.patientBMI}</strong> (${plan.patientBMICategory})
                    </div>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Broca IBW: <strong style="color: var(--secondary);">${plan.patientBrocaIBW} kg</strong></small>
                </div>

                <div>
                    <small style="color: var(--text-muted); font-size: 0.72rem; display: block; font-weight: 700;">METABOLIC EXPENDITURE</small>
                    <div style="font-size: 0.825rem; color: var(--text-primary);">BMR: <strong>${plan.patientBMR} kcal</strong></div>
                    <div style="font-size: 0.825rem; color: var(--text-primary);">TDEE: <strong>${plan.patientTDEE} kcal</strong></div>
                    <span style="font-size: 0.72rem; padding: 2px 6px; background: #dcfce7; color: #15803d; border-radius: 4px; font-weight: 700;">
                        ${plan.calorieGoalType}
                    </span>
                </div>

                <div>
                    <small style="color: var(--text-muted); font-size: 0.72rem; display: block; font-weight: 700;">TARGET MACRONUTRIENTS</small>
                    <strong style="font-size: 1.4rem; color: var(--primary);">${plan.targetCalories} <small style="font-size: 0.8rem; color: var(--text-muted);">kcal/day</small></strong>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                        C: <strong>${plan.targetCarbsGrams}g</strong> | P: <strong>${plan.targetProteinGrams}g</strong> | F: <strong>${plan.targetFatGrams}g</strong>
                    </div>
                </div>

                <div>
                    <small style="color: var(--text-muted); font-size: 0.72rem; display: block; font-weight: 700;">CLINICAL DIAGNOSES</small>
                    ${selectedPatient.clinicalDiagnoses && selectedPatient.clinicalDiagnoses.length > 0 ? `
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px;">
                            ${selectedPatient.clinicalDiagnoses.map(d => `<span style="font-size: 0.7rem; padding: 1px 6px; background: #fee2e2; color: #991b1b; border-radius: 4px; font-weight: 700;">${d}</span>`).join('')}
                        </div>
                    ` : `<span style="color: var(--text-muted); font-size: 0.8rem;">No active conditions</span>`}
                </div>
            </div>

            <!-- SMART FILTERING ALERT -->
            <div style="margin-top: 1rem; padding: 1rem 1.25rem; background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); display: flex; align-items: flex-start; gap: 0.85rem;">
                <i class="bi bi-shield-slash-fill" style="font-size: 1.4rem; color: var(--danger); margin-top: 2px;"></i>
                <div>
                    <strong style="color: var(--danger); font-size: 0.9rem;">Smart Clinical Filtering Active:</strong>
                    <span style="font-size: 0.85rem; color: var(--text-primary);">
                        ${safe.length} safe food items available.
                        ${excluded.length > 0 ? `<strong>${excluded.length} food items have been strictly eliminated</strong> due to patient's clinical diagnoses:` : 'No items restricted.'}
                    </span>
                    ${excluded.length > 0 ? `
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                            ${excluded.map(ex => `
                                <span style="font-size: 0.72rem; padding: 2px 7px; background: #fee2e2; color: #991b1b; border-radius: 4px; font-weight: 600;">
                                    <i class="bi bi-x-circle me-1"></i>${ex.name} (Restricted: ${(ex.contraindicatedDiseases || []).join(', ')})
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Step 2: Live Macro & Calorie Breakdown Panel -->
        <div class="card-custom" style="margin-bottom: 1.5rem; border: 2px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h4 style="font-weight: 800; color: var(--text-primary); margin: 0;">
                        <i class="bi bi-speedometer2 text-teal me-2"></i> Real-Time Calorie & Macronutrient Tracker
                    </h4>
                    <small style="color: var(--text-muted);">Dynamic comparison of planned meals vs target prescription (1g C/P = 4 kcal, 1g F = 9 kcal)</small>
                </div>
                <span class="badge ${statusClass}" style="font-size: 0.85rem; padding: 6px 14px; border-radius: var(--radius-full); font-weight: 700;">
                    ${statusText}
                </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; text-align: center;">
                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: var(--text-muted); font-size: 0.72rem; font-weight: 700; display: block;">TOTAL CALORIES</small>
                    <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin: 2px 0;">
                        ${totalCal} <span style="font-size: 0.9rem; color: var(--text-muted);">/ ${plan.targetCalories}</span>
                    </div>
                    <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 6px 0;">
                        <div style="width: ${calPct}%; height: 100%; background: ${diffCal > 100 ? 'var(--danger)' : 'var(--primary)'};"></div>
                    </div>
                    <small style="color: var(--text-muted); font-size: 0.72rem;">${calPct}% of target energy</small>
                </div>

                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: var(--secondary); font-size: 0.72rem; font-weight: 700; display: block;">PROTEIN (PLANNED / TARGET)</small>
                    <div style="font-size: 1.6rem; font-weight: 800; color: var(--secondary); margin: 2px 0;">
                        ${totalProt}g <span style="font-size: 0.9rem; color: var(--text-muted);">/ ${plan.targetProteinGrams}g</span>
                    </div>
                    <small style="color: var(--text-muted); font-size: 0.72rem;">${Math.round(totalProt * 4)} kcal from Protein</small>
                </div>

                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: #b45309; font-size: 0.72rem; font-weight: 700; display: block;">CARBOHYDRATES (PLANNED / TARGET)</small>
                    <div style="font-size: 1.6rem; font-weight: 800; color: #b45309; margin: 2px 0;">
                        ${totalCarb}g <span style="font-size: 0.9rem; color: var(--text-muted);">/ ${plan.targetCarbsGrams}g</span>
                    </div>
                    <small style="color: var(--text-muted); font-size: 0.72rem;">${Math.round(totalCarb * 4)} kcal from Carbs</small>
                </div>

                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: #475569; font-size: 0.72rem; font-weight: 700; display: block;">FATS / FIBER (PLANNED / TARGET)</small>
                    <div style="font-size: 1.6rem; font-weight: 800; color: #475569; margin: 2px 0;">
                        ${totalFat}g <span style="font-size: 0.9rem; color: var(--text-muted);">/ ${plan.targetFatGrams}g</span>
                    </div>
                    <small style="color: var(--success); font-size: 0.72rem; font-weight: 700;">Fiber: ${totalFiber}g • ${Math.round(totalFat * 9)} kcal Fat</small>
                </div>
            </div>
        </div>

        <!-- Step 3: Meal Slots & Dietitian Override -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            ${slots.map(slot => {
                const itemsInSlot = plan.mealItems.filter(i => i.mealSlot.toLowerCase() === slot.name.toLowerCase());
                const slotCal = Math.round(itemsInSlot.reduce((acc, i) => acc + (i.calories || 0), 0));
                const slotProt = Number(itemsInSlot.reduce((acc, i) => acc + (i.protein || 0), 0).toFixed(1));
                const slotCarb = Number(itemsInSlot.reduce((acc, i) => acc + (i.carbs || 0), 0).toFixed(1));
                const slotFat = Number(itemsInSlot.reduce((acc, i) => acc + (i.fat || 0), 0).toFixed(1));

                return `
                    <div class="card-custom" style="display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); margin-bottom: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="bi ${slot.icon}" style="color: var(--primary); font-size: 1.1rem;"></i>
                                <strong style="font-size: 1rem; color: var(--text-primary);">${slot.name}</strong>
                                <span style="font-size: 0.7rem; background: var(--bg-light); border: 1px solid var(--border-color); padding: 1px 6px; border-radius: 4px; color: var(--text-secondary);">${slot.defaultTime}</span>
                            </div>
                            <div style="text-align: right;">
                                <span style="font-size: 0.85rem; font-weight: 800; color: var(--danger);">${slotCal} kcal</span>
                                <div style="color: var(--text-muted); font-size: 0.7rem;">P: ${slotProt}g | C: ${slotCarb}g | F: ${slotFat}g</div>
                            </div>
                        </div>

                        <div style="flex-grow: 1; margin-bottom: 1rem;">
                            ${itemsInSlot.length === 0 ? `
                                <div style="padding: 1.5rem 1rem; text-align: center; background: var(--bg-light); border-radius: var(--radius-sm); border: 1px dashed var(--border-color); color: var(--text-muted); font-size: 0.825rem;">
                                    No food items planned for ${slot.name}
                                </div>
                            ` : `
                                <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                    ${itemsInSlot.map(item => `
                                        <div style="padding: 0.6rem 0.75rem; background: var(--bg-light); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                            <div style="flex: 1; min-width: 0;">
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <span style="font-weight: 800; font-size: 0.85rem; color: var(--text-primary);">${item.foodItemName}</span>
                                                    <span style="font-size: 0.7rem; padding: 1px 6px; background: var(--primary-light); color: var(--primary); border-radius: 4px; font-weight: 700;">
                                                        ${item.quantity} ${item.unit}
                                                    </span>
                                                </div>
                                                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                                                    <strong style="color: var(--danger);">${item.calories} kcal</strong> | P: ${item.protein}g, C: ${item.carbs}g, F: ${item.fat}g
                                                </div>
                                                ${item.specialInstructions ? `<div style="font-size: 0.7rem; color: var(--primary); font-style: italic;">↳ ${item.specialInstructions}</div>` : ''}
                                            </div>
                                            <div style="display: flex; gap: 4px; margin-left: 0.5rem;">
                                                <button style="background: none; border: 1px solid var(--border-color); color: var(--secondary); border-radius: 4px; padding: 3px 6px; cursor: pointer;" title="Swap Item" onclick="openSwapMealModal('${item.id}')">
                                                    <i class="bi bi-arrow-left-right"></i>
                                                </button>
                                                <button style="background: none; border: 1px solid var(--border-color); color: var(--danger); border-radius: 4px; padding: 3px 6px; cursor: pointer;" title="Remove" onclick="removeMealItem('${item.id}')">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>

                        <button class="btn-outline-teal" style="width: 100%; justify-content: center; font-size: 0.8rem; padding: 0.45rem;" onclick="openAddMealModal('${slot.name}', '${slot.defaultTime}')">
                            <i class="bi bi-plus-lg"></i> Add Safe Food Item
                        </button>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- Step 4: Clinical Advice & Instructions -->
        <div class="card-custom" style="margin-bottom: 2rem;">
            <h4 style="font-weight: 700; color: var(--text-primary); margin-bottom: 1rem;">
                <i class="bi bi-droplet-fill text-info me-2"></i> Clinical Instructions & Guidelines
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label class="form-label fw-bold">Fluid Intake Guidelines</label>
                    <input type="text" class="form-control" value="${plan.fluidIntakeInstructions}" oninput="activeDietPlan.fluidIntakeInstructions = this.value" />
                </div>
                <div>
                    <label class="form-label fw-bold">Foods to Strictly Avoid</label>
                    <input type="text" class="form-control" value="${plan.avoidFoodInstructions}" oninput="activeDietPlan.avoidFoodInstructions = this.value" />
                </div>
            </div>
            <div>
                <label class="form-label fw-bold">Dietitian Lifestyle Instructions & Clinical Advice</label>
                <textarea class="form-control" rows="2" oninput="activeDietPlan.generalNotes = this.value">${plan.generalNotes}</textarea>
            </div>
        </div>
    `;
}

function switchGeneratorPatient(patientId) {
    const p = db.patients.find(x => x.id === patientId);
    if (p) {
        activeDietPlan = DietGenerator.generatePlan(p);
        updateDietGeneratorView(document.getElementById('mainContent'), p);
    }
}

function regeneratePlanForPatient(patientId) {
    const p = db.patients.find(x => x.id === patientId);
    if (p) {
        activeDietPlan = DietGenerator.generatePlan(p);
        updateDietGeneratorView(document.getElementById('mainContent'), p);
    }
}

function removeMealItem(itemId) {
    activeDietPlan.mealItems = activeDietPlan.mealItems.filter(i => i.id !== itemId);
    const p = db.patients.find(x => x.id === activeDietPlan.patientId);
    updateDietGeneratorView(document.getElementById('mainContent'), p);
}

function openSwapMealModal(itemId) {
    const item = activeDietPlan.mealItems.find(i => i.id === itemId);
    if (!item) return;

    const p = db.patients.find(x => x.id === activeDietPlan.patientId);
    const { safe } = DietGenerator.filterFoodsForPatient(p, db.foods);
    const alternatives = safe.filter(f => f.id !== item.foodItemId).slice(0, 10);

    const container = document.getElementById('modalContainer');
    container.innerHTML = `
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
            <div class="modal-dialog">
                <div class="modal-header" style="background: var(--secondary);">
                    <h5 style="font-weight: 800; margin: 0;">
                        <i class="bi bi-arrow-left-right me-2"></i> Swap '${item.foodItemName}'
                    </h5>
                    <button style="background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer;" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1rem;">
                        Select a safe, compatible alternative food item to replace this portion:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 380px; overflow-y: auto;">
                        ${alternatives.map(alt => {
                            const calPerG = (alt.carbsPerGram * 4) + (alt.proteinPerGram * 4) + (alt.fatPerGram * 9);
                            const totalCal = Math.round(calPerG * alt.servingQuantity);
                            return `
                                <div style="padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.15s;" onmouseover="this.style.background='var(--bg-light)'" onmouseout="this.style.background='#ffffff'" onclick="executeSwap('${item.id}', '${alt.id}')">
                                    <div>
                                        <div style="font-weight: 800; color: var(--text-primary); font-size: 0.9rem;">${alt.name}</div>
                                        <small style="color: var(--text-muted); font-size: 0.75rem;">
                                            ${alt.servingQuantity} ${alt.standardUnit} | P: ${(alt.proteinPerGram * alt.servingQuantity).toFixed(1)}g, C: ${(alt.carbsPerGram * alt.servingQuantity).toFixed(1)}g, F: ${(alt.fatPerGram * alt.servingQuantity).toFixed(1)}g
                                        </small>
                                    </div>
                                    <span style="font-weight: 800; color: var(--danger); font-size: 0.9rem;">${totalCal} kcal</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline-teal" onclick="closeModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;
}

function executeSwap(mealItemId, newFoodId) {
    const item = activeDietPlan.mealItems.find(i => i.id === mealItemId);
    const newFood = db.foods.find(f => f.id === newFoodId);
    if (!item || !newFood) return;

    // Check user's diseases and their restricted foods
    const restriction = db.isFoodRestrictedForUser(activeDietPlan.patientId, newFoodId);
    if (restriction && restriction.isRestricted) {
        showRestrictionWarning(restriction.foodName, restriction.diseaseName);
        return; // Do not allow swap to restricted food
    }

    item.foodItemId = newFood.id;
    item.foodItemName = newFood.name;
    item.quantity = newFood.servingQuantity;
    item.unit = newFood.standardUnit;

    const calPerG = (newFood.carbsPerGram * 4) + (newFood.proteinPerGram * 4) + (newFood.fatPerGram * 9);
    item.calories = Number((calPerG * newFood.servingQuantity).toFixed(1));
    item.protein = Number((newFood.proteinPerGram * newFood.servingQuantity).toFixed(1));
    item.carbs = Number((newFood.carbsPerGram * newFood.servingQuantity).toFixed(1));
    item.fat = Number((newFood.fatPerGram * newFood.servingQuantity).toFixed(1));
    item.fiber = Number((newFood.fiberPerGram * newFood.servingQuantity).toFixed(1));

    closeModal();
    const p = db.patients.find(x => x.id === activeDietPlan.patientId);
    updateDietGeneratorView(document.getElementById('mainContent'), p);
}

function showRestrictionWarning(foodName, diseaseName) {
    const container = document.getElementById('modalContainer');
    container.innerHTML = `
        <div class="modal-backdrop" style="background: rgba(15, 23, 42, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div class="modal-dialog" style="max-width: 400px; text-align: center; border-radius: 24px; border: 2.5px solid #ef4444; background: #ffffff; padding: 26px 22px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35); animation: popWarning 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: #fee2e2; border: 2px solid #fecaca; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 16px auto;">
                    ⚠️
                </div>
                <h3 style="font-weight: 800; font-size: 1.35rem; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    Food Not Allowed
                </h3>
                <div style="background: #fef2f2; border: 1.5px solid #fecaca; color: #b91c1c; padding: 12px 14px; border-radius: 12px; font-weight: 700; font-size: 1.05rem; margin-bottom: 12px; line-height: 1.35;">
                    ${foodName} is restricted for ${diseaseName}.
                </div>
                <p style="font-size: 0.8rem; color: #64748b; line-height: 1.45; margin-bottom: 20px;">
                    Therapeutic Clinical Contraindication: This food cannot be added to the patient's diet plan due to active clinical diagnosis.
                </p>
                <button type="button" class="btn-emerald" style="width: 100%; height: 48px; border-radius: 9999px; background: #ef4444; border: none; color: #ffffff; font-weight: 700; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);" onclick="closeModal()">
                    Understood
                </button>
            </div>
        </div>
    `;
}

function openAddMealModal(slotName, defaultTime) {
    const p = db.patients.find(x => x.id === activeDietPlan.patientId);
    const { safe, excluded } = DietGenerator.filterFoodsForPatient(p, db.foods);
    const allFoods = db.getFoods();

    const container = document.getElementById('modalContainer');
    container.innerHTML = `
        <div class="modal-backdrop" onclick="if(event.target === this) closeModal()">
            <div class="modal-dialog">
                <div class="modal-header">
                    <h5 style="font-weight: 800; margin: 0;">
                        <i class="bi bi-basket me-2"></i> Add Food Item to ${slotName}
                    </h5>
                    <button style="background: none; border: none; color: #fff; font-size: 1.25rem; cursor: pointer;" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <label class="form-label required fw-bold" style="margin: 0;">Select Food from Item Master</label>
                            <small style="color: var(--text-muted); font-size: 0.75rem;">Patient: <strong>${p?.name}</strong> (${(p?.clinicalDiagnoses || []).join(', ') || 'Healthy'})</small>
                        </div>
                        <select class="form-select form-select-lg" id="addMealFoodSelect" onchange="onAddMealFoodChange()">
                            <optgroup label="✅ Safe & Recommended Foods">
                                ${safe.map(f => `
                                    <option value="${f.id}" data-unit="${f.standardUnit}" data-qty="${f.servingQuantity}">
                                        ${f.name} (${f.servingQuantity}${f.standardUnit} - ${Math.round(((f.carbsPerGram*4)+(f.proteinPerGram*4)+(f.fatPerGram*9))*f.servingQuantity)} kcal, P:${(f.proteinPerGram*f.servingQuantity).toFixed(1)}g)
                                    </option>
                                `).join('')}
                            </optgroup>
                            ${excluded.length > 0 ? `
                                <optgroup label="⚠️ Restricted Foods for Diagnoses (Validation Enforced)">
                                    ${excluded.map(f => {
                                        const res = db.isFoodRestrictedForUser(p.id, f.id);
                                        return `
                                            <option value="${f.id}" data-unit="${f.standardUnit}" data-qty="${f.servingQuantity}" style="color: #ef4444; font-weight: 700;">
                                                ⚠️ ${f.name} (Restricted for ${res.diseaseName || 'Diagnosis'})
                                            </option>
                                        `;
                                    }).join('')}
                                </optgroup>
                            ` : ''}
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label class="form-label required">Portion Quantity</label>
                            <input type="number" step="5" min="1" class="form-control" id="addMealFoodQty" value="${(safe[0] || allFoods[0])?.servingQuantity || 100}" oninput="recalcAddMealYield()" />
                        </div>
                        <div>
                            <label class="form-label">Portion Unit</label>
                            <input type="text" class="form-control" id="addMealFoodUnit" value="${(safe[0] || allFoods[0])?.standardUnit || 'g'}" readonly style="background: var(--bg-light);" />
                        </div>
                    </div>

                    <div style="background: var(--bg-light); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 1rem;" id="addMealLiveYield">
                        <!-- Live yield info -->
                    </div>

                    <div>
                        <label class="form-label">Special Preparation / Instructions</label>
                        <input type="text" class="form-control" id="addMealFoodNotes" placeholder="e.g. Steamed without salt, boiled fresh..." />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-outline-teal" onclick="closeModal()">Cancel</button>
                    <button class="btn-emerald" onclick="confirmAddMealItem('${slotName}', '${defaultTime}')">Add to ${slotName}</button>
                </div>
            </div>
        </div>
    `;

    recalcAddMealYield();
}

function onAddMealFoodChange() {
    const sel = document.getElementById('addMealFoodSelect');
    const opt = sel.options[sel.selectedIndex];
    document.getElementById('addMealFoodQty').value = opt.getAttribute('data-qty') || 100;
    document.getElementById('addMealFoodUnit').value = opt.getAttribute('data-unit') || 'g';
    recalcAddMealYield();
}

function recalcAddMealYield() {
    const sel = document.getElementById('addMealFoodSelect');
    const foodId = sel.value;
    const food = db.foods.find(f => f.id === foodId);
    const qty = parseFloat(document.getElementById('addMealFoodQty').value) || 100;
    const unit = document.getElementById('addMealFoodUnit').value;

    if (!food) return;
    const calPerG = (food.carbsPerGram * 4) + (food.proteinPerGram * 4) + (food.fatPerGram * 9);
    const totalCal = Math.round(calPerG * qty);

    document.getElementById('addMealLiveYield').innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Calculated for ${qty} ${unit}:</span>
            <strong style="color: var(--danger); font-size: 1.05rem;">${totalCal} kcal</strong>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            P: ${(food.proteinPerGram * qty).toFixed(1)}g | C: ${(food.carbsPerGram * qty).toFixed(1)}g | F: ${(food.fatPerGram * qty).toFixed(1)}g
        </div>
    `;
}

function confirmAddMealItem(slotName, defaultTime) {
    const foodId = document.getElementById('addMealFoodSelect').value;
    const food = db.foods.find(f => f.id === foodId);
    const qty = parseFloat(document.getElementById('addMealFoodQty').value) || 100;
    const notes = document.getElementById('addMealFoodNotes').value.trim();

    if (!food) return;

    // Check user's diseases and their restricted foods
    const restriction = db.isFoodRestrictedForUser(activeDietPlan.patientId, foodId);
    if (restriction && restriction.isRestricted) {
        showRestrictionWarning(restriction.foodName, restriction.diseaseName);
        return; // Do not allow that food to be added to the user's diet
    }

    activeDietPlan.mealItems.push(DietGenerator.createMealItem(slotName, defaultTime, food, qty, notes));
    closeModal();
    const p = db.patients.find(x => x.id === activeDietPlan.patientId);
    updateDietGeneratorView(document.getElementById('mainContent'), p);
}

function finalizeAndSavePlan() {
    if (!activeDietPlan) return;

    const idx = db.plans.findIndex(p => p.id === activeDietPlan.id);
    if (idx >= 0) {
        db.plans[idx] = activeDietPlan;
    } else {
        db.plans.unshift(activeDietPlan);
    }
    db.save();
    navigateTo('diet-plan-view', activeDietPlan.id);
}

// ==========================================
// VIEW: SAVED DIET PLANS LIST
// ==========================================
function renderDietPlans(container) {
    const plans = db.plans;

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="font-weight: 800; font-size: 1.5rem; color: var(--text-primary);">
                    <i class="bi bi-file-earmark-medical-fill" style="color: var(--primary); margin-right: 0.5rem;"></i>
                    Saved Clinical Diet Prescriptions
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Print medical-grade charts, export to PDF, and share directly via WhatsApp.
                </p>
            </div>
            <button class="btn-emerald" onclick="navigateTo('diet-generator')">
                <i class="bi bi-plus-lg"></i> Prepare New Diet Plan
            </button>
        </div>

        <div class="card-custom">
            ${plans.length === 0 ? `
                <div style="text-align: center; padding: 4rem 1rem;">
                    <i class="bi bi-folder2-open" style="font-size: 3rem; color: var(--text-muted);"></i>
                    <h4 style="font-weight: 700; margin-top: 0.75rem;">No Diet Charts Issued Yet</h4>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem;">Select a registered patient to auto-generate and issue clinical charts.</p>
                    <button class="btn-emerald" onclick="navigateTo('diet-generator')">
                        <i class="bi bi-magic"></i> Auto-Generate Diet Plan
                    </button>
                </div>
            ` : `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--bg-light); border-bottom: 2px solid var(--border-color); text-align: left;">
                                <th style="padding: 0.85rem 1rem;">Plan Title</th>
                                <th style="padding: 0.85rem 1rem;">Patient</th>
                                <th style="padding: 0.85rem 1rem;">Strategy & Energy</th>
                                <th style="padding: 0.85rem 1rem;">Macro Breakdown</th>
                                <th style="padding: 0.85rem 1rem; text-align: right;">Prescription Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${plans.map(p => {
                                const totalCal = Math.round((p.mealItems || []).reduce((acc, i) => acc + (i.calories || 0), 0));
                                const totalProt = Number((p.mealItems || []).reduce((acc, i) => acc + (i.protein || 0), 0).toFixed(1));
                                const totalCarb = Number((p.mealItems || []).reduce((acc, i) => acc + (i.carbs || 0), 0).toFixed(1));
                                const totalFat = Number((p.mealItems || []).reduce((acc, i) => acc + (i.fat || 0), 0).toFixed(1));

                                return `
                                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-light)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 1rem;">
                                            <div style="font-weight: 800; color: var(--text-primary);">${p.planTitle}</div>
                                            <small style="color: var(--text-muted);">
                                                <i class="bi bi-calendar3 me-1"></i>${new Date(p.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${(p.mealItems || []).length} meal items
                                            </small>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <strong style="color: var(--primary);">${p.patientName}</strong>
                                            ${p.patientContact ? `<small style="display: block; color: var(--text-muted); font-size: 0.75rem;"><i class="bi bi-whatsapp text-success me-1"></i>${p.patientContact}</small>` : ''}
                                        </td>
                                        <td style="padding: 1rem;">
                                            <span style="font-size: 0.72rem; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: 700;">
                                                ${p.calorieGoalType}
                                            </span>
                                            <div style="font-weight: 800; color: var(--danger); font-size: 1rem; margin-top: 2px;">
                                                ${totalCal} kcal <small style="font-size: 0.75rem; color: var(--text-muted);">(Target: ${p.targetCalories})</small>
                                            </div>
                                        </td>
                                        <td style="padding: 1rem;">
                                            <div style="font-size: 0.8rem;">
                                                <strong style="color: var(--secondary);">P:</strong> ${totalProt}g |
                                                <strong style="color: #b45309;">C:</strong> ${totalCarb}g |
                                                <strong style="color: #475569;">F:</strong> ${totalFat}g
                                            </div>
                                        </td>
                                        <td style="padding: 1rem; text-align: right;">
                                            <div style="display: inline-flex; gap: 4px;">
                                                <button class="btn-emerald" style="padding: 0.4rem 0.7rem; font-size: 0.75rem;" title="View & Print" onclick="navigateTo('diet-plan-view', '${p.id}')">
                                                    <i class="bi bi-printer me-1"></i> View / PDF
                                                </button>
                                                <button class="btn-outline-teal" style="padding: 0.4rem 0.65rem; font-size: 0.75rem; border-color: #22c55e; color: #15803d;" title="Share WhatsApp" onclick="shareWhatsAppPlan('${p.id}')">
                                                    <i class="bi bi-whatsapp"></i>
                                                </button>
                                                <button style="background: none; border: 1px solid var(--border-color); color: var(--danger); border-radius: var(--radius-sm); padding: 0.4rem 0.55rem; cursor: pointer;" title="Delete" onclick="deleteDietPlan('${p.id}')">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;
}

function deleteDietPlan(planId) {
    if (!window.AdminAuth || !window.AdminAuth.isAuthenticated()) {
        showToast('⚠️ Admin authentication required to delete diet chart.');
        return;
    }
    if (confirm('Are you sure you want to delete this diet chart?')) {
        db.deletePlan(planId);
        renderDietPlans(document.getElementById('mainContent'));
    }
}

// ==========================================
// VIEW: MEDICAL-GRADE PRINTABLE PRESCRIPTION
// ==========================================
function renderDietPlanView(container, planId) {
    const plan = db.plans.find(p => p.id === planId) || activeDietPlan;
    if (!plan) {
        navigateTo('diet-plans');
        return;
    }

    const patient = db.patients.find(p => p.id === plan.patientId);
    const slots = ['Breakfast', 'Mid-Morning', 'Lunch', 'Evening', 'Dinner', 'Bedtime'];

    const totalCal = Math.round((plan.mealItems || []).reduce((acc, i) => acc + (i.calories || 0), 0));
    const totalProt = Number((plan.mealItems || []).reduce((acc, i) => acc + (i.protein || 0), 0).toFixed(1));
    const totalCarb = Number((plan.mealItems || []).reduce((acc, i) => acc + (i.carbs || 0), 0).toFixed(1));
    const totalFat = Number((plan.mealItems || []).reduce((acc, i) => acc + (i.fat || 0), 0).toFixed(1));
    const totalFiber = Number((plan.mealItems || []).reduce((acc, i) => acc + (i.fiber || 0), 0).toFixed(1));

    container.innerHTML = `
        <!-- Action Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;" class="no-print">
            <button class="btn-outline-teal" onclick="navigateTo('diet-plans')">
                <i class="bi bi-arrow-left"></i> Back to Saved Plans
            </button>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                <button class="btn-emerald" style="background: #22c55e; box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);" onclick="shareWhatsAppPlan('${plan.id}')">
                    <i class="bi bi-whatsapp"></i> Share via WhatsApp
                </button>
                <button class="btn-outline-teal" onclick="copyPlanText('${plan.id}')">
                    <i class="bi bi-clipboard-check"></i> Copy Text
                </button>
                <button class="btn-emerald" onclick="window.print()">
                    <i class="bi bi-printer-fill"></i> Export PDF / Print Chart
                </button>
            </div>
        </div>

        <!-- PRINTABLE MEDICAL DOCUMENT -->
        <div class="card-custom printable-chart" style="padding: 2.5rem; background: #ffffff; border: 1.5px solid var(--border-color); box-shadow: var(--shadow-md);">
            <!-- Document Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1.5rem; border-bottom: 2px solid var(--primary); margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 58px; height: 58px; border-radius: var(--radius-md); background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                        <i class="bi bi-heart-pulse-fill"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 0; letter-spacing: -0.02em;">
                            CLINICAL NUTRITION THERAPY PRESCRIPTION
                        </h2>
                        <span style="color: var(--text-secondary); font-size: 0.8rem; font-weight: 600;">
                            Evidence-Based Clinical Dietetics Protocol • Disease Management Chart
                        </span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; background: var(--dark); color: #ffffff; padding: 3px 10px; border-radius: 4px; font-weight: 700; display: inline-block; margin-bottom: 4px;">
                        Date: ${new Date(plan.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <small style="display: block; color: var(--text-muted); font-size: 0.75rem;">Consultant: <strong>${plan.dietitianName}</strong></small>
                    <small style="display: block; color: var(--primary); font-family: monospace; font-size: 0.7rem;">Ref: #MD-${plan.id.substring(plan.id.length - 8).toUpperCase()}</small>
                </div>
            </div>

            <!-- Patient Vitals & Anthropometrics Banner -->
            <div style="background: var(--bg-light); padding: 1.25rem 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div style="border-right: 1px solid var(--border-color); padding-right: 1rem;">
                    <small style="color: var(--text-muted); font-size: 0.7rem; font-weight: 700; display: block;">PATIENT DEMOGRAPHICS</small>
                    <h3 style="font-weight: 800; color: var(--text-primary); margin: 2px 0 4px 0; font-size: 1.25rem;">${plan.patientName}</h3>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        Age: <strong>${patient?.age || 30} yrs</strong> | Gender: <strong>${patient?.gender || 'N/A'}</strong>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        Diet: <strong style="color: var(--success);">${patient?.primaryDietType || 'Vegetarian'}</strong>
                    </div>
                    ${plan.patientContact ? `<div style="color: var(--primary); font-size: 0.75rem; font-weight: 700; margin-top: 2px;"><i class="bi bi-whatsapp"></i> ${plan.patientContact}</div>` : ''}
                </div>

                <div style="border-right: 1px solid var(--border-color); padding-right: 1rem;">
                    <small style="color: var(--text-muted); font-size: 0.7rem; font-weight: 700; display: block;">ANTHROPOMETRIC VITALS</small>
                    <div style="font-size: 0.825rem;">Height: <strong>${plan.patientHeightCm} cm</strong> | Weight: <strong>${plan.patientWeightKg} kg</strong></div>
                    <div style="font-size: 0.825rem;">BMI: <strong>${plan.patientBMI} kg/m²</strong> (${plan.patientBMICategory})</div>
                    <div style="font-size: 0.825rem; color: var(--primary); font-weight: 700;">Broca's Ideal Weight (IBW): ${plan.patientBrocaIBW} kg</div>
                </div>

                <div>
                    <small style="color: var(--text-muted); font-size: 0.7rem; font-weight: 700; display: block;">METABOLIC EXPENDITURE & GOAL</small>
                    <div style="font-size: 0.825rem;">Harris-Benedict BMR: <strong>${plan.patientBMR} kcal</strong></div>
                    <div style="font-size: 0.825rem;">Total Daily (TDEE): <strong>${plan.patientTDEE} kcal</strong></div>
                    <div style="font-size: 0.825rem; color: var(--primary); font-weight: 700;">Prescription: ${plan.calorieGoalType} (${plan.targetCalories} kcal)</div>
                </div>
            </div>

            ${plan.patientDiagnoses && plan.patientDiagnoses.length > 0 ? `
                <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 0.75rem 1rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem;">
                    <i class="bi bi-shield-exclamation text-danger" style="font-size: 1.25rem;"></i>
                    <div>
                        <strong style="color: var(--danger); font-size: 0.825rem;">Active Clinical Diagnoses: </strong>
                        <span style="font-size: 0.825rem; color: var(--text-primary); font-weight: 600;">
                            ${plan.patientDiagnoses.join(' • ')}
                        </span>
                    </div>
                </div>
            ` : ''}

            <!-- Energy & Macro Yield Bar -->
            <div style="background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); color: #ffffff; padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 0.5rem;">
                <div style="border-right: 1px solid rgba(255,255,255,0.2);">
                    <small style="color: rgba(255,255,255,0.7); font-size: 0.72rem; display: block;">TOTAL CALORIES</small>
                    <strong style="font-size: 1.5rem;">${totalCal} kcal</strong>
                </div>
                <div style="border-right: 1px solid rgba(255,255,255,0.2);">
                    <small style="color: #67e8f9; font-size: 0.72rem; display: block;">PROTEIN</small>
                    <strong style="font-size: 1.5rem; color: #a5f3fc;">${totalProt} g</strong>
                    <small style="display: block; font-size: 0.7rem; color: rgba(255,255,255,0.7);">${Math.round(totalProt * 4)} kcal</small>
                </div>
                <div style="border-right: 1px solid rgba(255,255,255,0.2);">
                    <small style="color: #fde047; font-size: 0.72rem; display: block;">CARBOHYDRATES</small>
                    <strong style="font-size: 1.5rem; color: #fef08a;">${totalCarb} g</strong>
                    <small style="display: block; font-size: 0.7rem; color: rgba(255,255,255,0.7);">${Math.round(totalCarb * 4)} kcal</small>
                </div>
                <div>
                    <small style="color: rgba(255,255,255,0.7); font-size: 0.72rem; display: block;">FATS / FIBER</small>
                    <strong style="font-size: 1.5rem;">${totalFat} g</strong>
                    <small style="display: block; font-size: 0.7rem; color: #86efac; font-weight: 700;">Fiber: ${totalFiber}g</small>
                </div>
            </div>

            <!-- Meal Schedule Table -->
            <h4 style="font-weight: 800; color: var(--text-primary); margin-bottom: 0.75rem; font-size: 1.15rem;">
                <i class="bi bi-clock-history text-teal me-2"></i> Structured Meal-by-Meal Timetable
            </h4>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                <thead>
                    <tr style="background: var(--bg-light); border-bottom: 2px solid var(--border-color); text-align: left;">
                        <th style="padding: 0.75rem 1rem; width: 18%;">Meal Slot & Timing</th>
                        <th style="padding: 0.75rem 1rem; width: 32%;">Prescribed Food & Portion</th>
                        <th style="padding: 0.75rem 1rem; width: 25%;">Nutritional Breakdown</th>
                        <th style="padding: 0.75rem 1rem; width: 25%;">Clinical Instructions</th>
                    </tr>
                </thead>
                <tbody>
                    ${slots.map(slot => {
                        const items = (plan.mealItems || []).filter(i => i.mealSlot.toLowerCase() === slot.toLowerCase());
                        if (items.length === 0) return '';
                        return items.map((item, idx) => `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                ${idx === 0 ? `
                                    <td rowspan="${items.length}" style="padding: 0.75rem 1rem; vertical-align: top; background: #fafafa; border-right: 1px solid var(--border-color);">
                                        <div style="font-weight: 800; color: var(--primary); font-size: 0.95rem;">${slot}</div>
                                        <small style="color: var(--text-muted);"><i class="bi bi-clock me-1"></i>${item.timeSlot}</small>
                                    </td>
                                ` : ''}
                                <td style="padding: 0.75rem 1rem;">
                                    <strong style="color: var(--text-primary); font-size: 0.925rem;">${item.foodItemName}</strong>
                                    <span style="display: inline-block; font-size: 0.72rem; padding: 1px 6px; background: var(--primary-light); color: var(--primary); border-radius: 4px; font-weight: 700; margin-left: 6px;">
                                        ${item.quantity} ${item.unit}
                                    </span>
                                </td>
                                <td style="padding: 0.75rem 1rem;">
                                    <strong style="color: var(--danger);">${item.calories} kcal</strong>
                                    <div style="color: var(--text-muted); font-size: 0.75rem;">
                                        P: <span style="color: var(--secondary); font-weight: 700;">${item.protein}g</span> |
                                        C: <span style="color: #b45309; font-weight: 700;">${item.carbs}g</span> |
                                        F: <span style="color: #475569; font-weight: 700;">${item.fat}g</span>
                                    </div>
                                </td>
                                <td style="padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--text-secondary);">
                                    ${item.specialInstructions || 'Standard hygienic home preparation'}
                                </td>
                            </tr>
                        `).join('');
                    }).join('')}
                </tbody>
            </table>

            <!-- Clinical Instructions -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <strong style="color: var(--primary); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">
                        <i class="bi bi-droplet-fill text-info me-1"></i> Hydration Protocol:
                    </strong>
                    <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">${plan.fluidIntakeInstructions}</p>
                </div>

                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <strong style="color: var(--danger); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">
                        <i class="bi bi-x-circle-fill me-1"></i> Strict Dietary Exclusions:
                    </strong>
                    <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">${plan.avoidFoodInstructions}</p>
                </div>
            </div>

            ${plan.generalNotes ? `
                <div style="background: var(--bg-light); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 2rem;">
                    <strong style="color: var(--text-primary); font-size: 0.85rem; display: block; margin-bottom: 0.25rem;">
                        <i class="bi bi-journal-text me-1"></i> Dietitian Lifestyle Advice & Special Precautions:
                    </strong>
                    <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">${plan.generalNotes}</p>
                </div>
            ` : ''}

            <!-- Signature & Validation Line -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                <div>
                    <small style="color: var(--text-muted); display: block;">Clinical Dietetics & Nutrition Management System</small>
                    <small style="color: var(--text-muted); font-size: 0.75rem;">Verified Clinical Record #MD-${plan.id.substring(plan.id.length - 8).toUpperCase()}</small>
                </div>
                <div style="text-align: right;">
                    <strong style="color: var(--text-primary); font-size: 0.95rem; display: block;">Registered Clinical Dietitian</strong>
                    <span style="color: var(--text-secondary); font-size: 0.825rem;">${plan.dietitianName}</span>
                    <div style="width: 140px; border-bottom: 1.5px dashed var(--border-color); margin-top: 1.5rem; margin-left: auto;"></div>
                    <small style="color: var(--text-muted); font-size: 0.7rem;">Dietitian Authorized Stamp</small>
                </div>
            </div>
        </div>
    `;
}

function shareWhatsAppPlan(planId) {
    const plan = db.plans.find(p => p.id === planId) || activeDietPlan;
    if (!plan) return;

    const text = DietGenerator.formatWhatsApp(plan);
    const cleanPhone = (plan.patientContact || '').replace(/\D/g, '');
    const encoded = encodeURIComponent(text);

    const url = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank');
}

function copyPlanText(planId) {
    const plan = db.plans.find(p => p.id === planId) || activeDietPlan;
    if (!plan) return;

    const text = DietGenerator.formatWhatsApp(plan);
    navigator.clipboard.writeText(text).then(() => {
        alert('Clinical diet chart text copied to clipboard successfully!');
    });
}

function directWhatsApp(phone) {
    const clean = phone.replace(/\D/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${clean}`, '_blank');
}

function closeModal() {
    const container = document.getElementById('modalContainer');
    if (container) container.innerHTML = '';
}

function exportDatabaseBackup() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(localStorage.getItem(STORAGE_KEYS.DB));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `ClinicalDiet_Database_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
}
