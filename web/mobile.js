/**
 * Clinical Dietetics Mobile Application Engine
 * Supports:
 * 1. Admin Role: Upload meals with full Protein, Vitamin, Fat breakdown; Edit every user; Delete user; Add user; Edit user's diet.
 * 2. Multi-User Role: Switch between multiple users; View daily diet plans; Inspect meal nutrition (Egg, etc.); Log meals.
 * 3. Screenshot-Matching Onboarding: Interactive Year picker (1998, 1999, [2000], 2001, 2002); Gender cards with checkmark; Eating frequency with colorful icons.
 */

// Global Application State
let currentRole = 'user'; // 'admin' | 'user'
let currentAdminTab = 'admin-home'; // 'admin-home' | 'admin-upload' | 'admin-users' | 'admin-diet-editor' | 'onboarding'
let currentUserTab = 'user-diet'; // 'user-diet' | 'user-foods' | 'onboarding' | 'user-profile'
let activeUserId = 'p-1';

// Onboarding State (Matching Screenshots)
// Onboarding State (Matching Screenshots)
let onboardingStep = 1; // 1: Goal, 2: Gender, 3: Year, 4: Height, 5: Weight, 6: Eating Frequency, 7: Clinical Focus
let onboardingData = {
    mainGoal: 'Gain energy', // Matches Screenshot 1
    gender: 'Female', // Matches Screenshot 2 & 3
    yearOfBirth: 2000, // Matches Screenshot 1
    heightUnit: 'ft', // 'ft' or 'cm' (Screenshot 4: 5'3" ft)
    heightCm: 160.02, // 5'3" = 63 inches = 160 cm
    weightUnit: 'lbs', // 'lbs' or 'kg' (Screenshot 2: 154.3 lbs)
    weightKg: 69.99, // 154.3 lbs / 2.20462 = 70.0 kg -> BMI 27.3!
    eatingFrequency: '3 meals a day', // Options: 2, 3, 4, 5, 6 meals a day
    waistCm: 76,
    hipCm: 96,
    activityLevel: 'Lightly Active',
    name: 'Ananya Sen',
    contactNumber: '+919934567890',
    primaryDietType: 'Eggitarian',
    clinicalDiagnoses: []
};

// Meal Inspector State
let inspectedMeal = null;
let inspectedPortion = 50; // default for 1 large egg
let inspectedFromLibrary = false;

// Active Diet Editor State
let editorUserId = 'p-1';

// Lifecycle Initialization
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initDatabaseState();
    setupUserDropdown();
    initMobileAuth();
});

function initMobileAuth() {
    const isAuthed = window.AdminAuth ? window.AdminAuth.isAuthenticated() : false;
    const loginScreen = document.getElementById('mobileLoginScreen');
    const appShell = document.getElementById('mobileAppShell');

    if (isAuthed) {
        if (loginScreen) loginScreen.style.display = 'none';
        if (appShell) appShell.style.display = 'flex';
        applyRole(currentRole || 'admin');
    } else {
        if (appShell) appShell.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        const alertEl = document.getElementById('mobileLoginAlert');
        if (alertEl) alertEl.style.display = 'none';
    }
}

// Option for Patient / User to view their prescribed diets directly in read-only mode
function enterAsPatientUser() {
    currentRole = 'user';
    currentUserTab = 'user-diet';
    db.setRole('user');
    const loginScreen = document.getElementById('mobileLoginScreen');
    const appShell = document.getElementById('mobileAppShell');
    if (loginScreen) loginScreen.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';
    applyRole('user');
    showToast('👤 Switched to Patient View (Read-Only Mode)');
}

// Full-screen mobile login submit
function handleMobileFullscreenLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const uInput = document.getElementById('mobileLoginUser');
    const pInput = document.getElementById('mobileLoginPass');
    const u = uInput ? uInput.value : '';
    const p = pInput ? pInput.value : '';

    const res = window.AdminAuth ? window.AdminAuth.login(u, p) : { success: true, user: { username: u } };

    if (res.success) {
        const loginScreen = document.getElementById('mobileLoginScreen');
        const appShell = document.getElementById('mobileAppShell');
        if (loginScreen) loginScreen.style.display = 'none';
        if (appShell) appShell.style.display = 'flex';

        showToast('✅ Admin Authenticated! Welcome, ' + (res.user?.username || 'Ashish'));
        currentRole = 'admin';
        db.setRole('admin');
        applyRole('admin');
    } else {
        const alertEl = document.getElementById('mobileLoginAlert');
        if (alertEl) {
            alertEl.style.display = 'flex';
            alertEl.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> <span>${res.message}</span>`;
        }
    }
}

function autofillMobileLogin(u, p) {
    const uInput = document.getElementById('mobileLoginUser');
    const pInput = document.getElementById('mobileLoginPass');
    if (uInput) uInput.value = u;
    if (pInput) pInput.value = p;
    handleMobileFullscreenLogin(null);
}

function toggleMobileLoginEye() {
    const passInput = document.getElementById('mobileLoginPass');
    const eyeIcon = document.getElementById('mobileLoginEyeIcon');
    if (!passInput) return;
    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (eyeIcon) eyeIcon.className = 'bi bi-eye-slash-fill';
    } else {
        passInput.type = 'password';
        if (eyeIcon) eyeIcon.className = 'bi bi-eye-fill';
    }
}

// Clock function (matches user's screenshot format: 3:19 PM)
function initClock() {
    function update() {
        const now = new Date();
        let hours = now.getHours();
        let mins = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMins = mins < 10 ? '0' + mins : mins;
        const clockEl = document.getElementById('mobileClock');
        if (clockEl) {
            clockEl.innerText = `${hours}:${strMins} ${ampm}`;
        }
    }
    update();
    setInterval(update, 20000);
}

function initDatabaseState() {
    if (!window.db) return;
    const isAuthed = window.AdminAuth ? window.AdminAuth.isAuthenticated() : false;
    currentRole = (db.activeRole || 'admin');
    activeUserId = db.activeUserId || (db.patients[0]?.id || 'p-1');
    editorUserId = activeUserId;
}

function setupUserDropdown() {
    const sel = document.getElementById('activeUserSelect');
    if (!sel || !window.db) return;
    const users = db.getUsers();
    sel.innerHTML = users.map(u => `
        <option value="${u.id}" ${u.id === activeUserId ? 'selected' : ''}>
            ${u.name} (${u.age || (2026 - (u.yearOfBirth || 1996))}y, ${u.gender})
        </option>
    `).join('');
}

function onActiveUserChanged(userId) {
    activeUserId = userId;
    editorUserId = userId;
    db.setActiveUser(userId);
    showToast(`Switched active user to: ${db.getUser(userId)?.name || 'User'}`);
    if (currentRole === 'user') {
        renderCurrentView();
    } else if (currentAdminTab === 'admin-diet-editor') {
        renderAdminDietEditor(document.getElementById('mobileCardSheet'));
    }
}

// ==========================================
// ROLE SWITCHING: ADMIN vs MULTIPLE USERS
// ==========================================
function setAppRole(role) {
    if (role === 'admin') {
        const isAuthed = window.AdminAuth ? window.AdminAuth.isAuthenticated() : false;
        if (!isAuthed) {
            openAdminLoginModal();
            return;
        }
    }
    currentRole = role;
    db.setRole(role);
    applyRole(role);
    if (role === 'user') {
        showToast('👤 Switched to Patient View (Read-Only)');
    } else {
        showToast('🛡️ Switched to Admin Portal (Full Access)');
    }
}

function openAdminLoginModal() {
    const overlay = document.getElementById('mobileModalOverlay');
    const sheet = document.getElementById('mobileModalSheet');
    if (!overlay || !sheet) return;

    sheet.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(13, 148, 136, 0.15); color: #0d9488; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                    <i class="bi bi-shield-lock-fill"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.12rem; font-weight: 800; color: var(--navy-900); margin: 0;">Admin Portal Login</h3>
                    <p style="font-size: 0.74rem; color: var(--slate-500); margin: 0;">Clinical Dietitian Authentication Required</p>
                </div>
            </div>
            <button onclick="closeMobileModal()" style="background: none; border: none; font-size: 1.25rem; color: var(--slate-400); cursor: pointer;">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>

        <div id="adminLoginError" style="display: none; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; border-radius: 10px; padding: 8px 12px; font-size: 0.78rem; margin-bottom: 14px;">
        </div>

        <form onsubmit="handleMobileAdminLogin(event)">
            <div class="form-input-group" style="margin-bottom: 12px;">
                <label class="form-label-custom">Admin Username</label>
                <div style="position: relative;">
                    <i class="bi bi-person-fill" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--slate-400);"></i>
                    <input type="text" id="adminLoginUsername" class="form-control-custom" placeholder="Enter username (Ashish)" style="padding-left: 36px;" value="Ashish" required />
                </div>
            </div>

            <div class="form-input-group" style="margin-bottom: 14px;">
                <label class="form-label-custom">Password</label>
                <div style="position: relative;">
                    <i class="bi bi-lock-fill" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--slate-400);"></i>
                    <input type="password" id="adminLoginPassword" class="form-control-custom" placeholder="Enter password (Ashish@2026)" style="padding-left: 36px; padding-right: 40px;" value="Ashish@2026" required />
                    <button type="button" onclick="toggleMobileAdminPasswordVisibility()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--slate-400); cursor: pointer;">
                        <i id="adminLoginPwEye" class="bi bi-eye-fill"></i>
                    </button>
                </div>
            </div>

            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 10px 12px; margin-bottom: 16px; font-size: 0.74rem; color: var(--slate-600); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div><strong>Username:</strong> Ashish (or admin)</div>
                    <div><strong>Password:</strong> Ashish@2026 (or admin123)</div>
                </div>
                <button type="button" onclick="fillAdminCredentials('Ashish', 'Ashish@2026')" class="role-pill-btn" style="background: #ffffff; border: 1px solid #cbd5e1; font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    Fill Demo
                </button>
            </div>

            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn-onboarding-next" style="background: #e2e8f0; color: var(--slate-600); width: 35%; justify-content: center; box-shadow: none;" onclick="closeMobileModal()">
                    Cancel
                </button>
                <button type="submit" class="btn-onboarding-next" style="flex: 1; justify-content: center;">
                    <i class="bi bi-box-arrow-in-right"></i>
                    <span>Login to Admin</span>
                </button>
            </div>
        </form>
    `;

    overlay.style.display = 'flex';
}

function handleMobileAdminLogin(e) {
    e.preventDefault();
    const u = document.getElementById('adminLoginUsername').value;
    const p = document.getElementById('adminLoginPassword').value;
    const res = window.AdminAuth ? window.AdminAuth.login(u, p) : { success: true, user: { username: u } };
    if (res.success) {
        closeMobileModal();
        showToast('✅ Logged in as ' + (res.user?.username || 'Admin'));
        currentRole = 'admin';
        db.setRole('admin');
        applyRole('admin');
    } else {
        const errEl = document.getElementById('adminLoginError');
        if (errEl) {
            errEl.style.display = 'block';
            errEl.innerText = res.message;
        }
    }
}

function toggleMobileAdminPasswordVisibility() {
    const passInput = document.getElementById('adminLoginPassword');
    const eyeIcon = document.getElementById('adminLoginPwEye');
    if (!passInput) return;
    if (passInput.type === 'password') {
        passInput.type = 'text';
        if (eyeIcon) eyeIcon.className = 'bi bi-eye-slash-fill';
    } else {
        passInput.type = 'password';
        if (eyeIcon) eyeIcon.className = 'bi bi-eye-fill';
    }
}

function fillAdminCredentials(u, p) {
    const userEl = document.getElementById('adminLoginUsername');
    const passEl = document.getElementById('adminLoginPassword');
    if (userEl) userEl.value = u;
    if (passEl) passEl.value = p;
}

function logoutAdmin() {
    if (window.AdminAuth) {
        window.AdminAuth.logout();
    }
    const appShell = document.getElementById('mobileAppShell');
    const loginScreen = document.getElementById('mobileLoginScreen');
    if (appShell) appShell.style.display = 'none';
    if (loginScreen) {
        loginScreen.style.display = 'flex';
        const alertEl = document.getElementById('mobileLoginAlert');
        if (alertEl) alertEl.style.display = 'none';
    }
    showToast('Logged out. Admin authentication required.');
}

function applyRole(role) {
    if (role === 'admin' && (!window.AdminAuth || !window.AdminAuth.isAuthenticated())) {
        openAdminLoginModal();
        return;
    }

    currentRole = role;
    db.setRole(role);

    const btnAdmin = document.getElementById('btnRoleAdmin');
    const btnUser = document.getElementById('btnRoleUser');
    const userDropdownContainer = document.getElementById('userSelectorDropdownContainer');
    const logoutBtn = document.getElementById('btnAdminLogoutPill');
    const roleNoticeBadge = document.getElementById('mobileRoleNoticeBadge');

    if (btnAdmin && btnUser) {
        btnAdmin.classList.toggle('active', role === 'admin');
        btnUser.classList.toggle('active', role === 'user');
    }

    if (logoutBtn) {
        logoutBtn.style.display = (window.AdminAuth && window.AdminAuth.isAuthenticated()) ? 'inline-flex' : 'none';
    }

    if (userDropdownContainer) {
        userDropdownContainer.style.display = role === 'user' ? 'flex' : 'none';
        setupUserDropdown();
    }

    if (roleNoticeBadge) {
        if (role === 'user') {
            roleNoticeBadge.style.display = 'flex';
            roleNoticeBadge.innerHTML = `<i class="bi bi-shield-lock-fill"></i> <span>Patient View (Read-Only) • Admin rights required to add users, edit diets & delete</span>`;
        } else {
            roleNoticeBadge.style.display = 'none';
        }
    }

    renderBottomNav();
    renderCurrentView();
}

function renderBottomNav() {
    const nav = document.getElementById('mobileBottomNav');
    if (!nav) return;

    if (currentRole === 'admin') {
        nav.innerHTML = `
            <button class="nav-tab-btn ${currentAdminTab === 'admin-home' ? 'active' : ''}" onclick="switchAdminTab('admin-home')">
                <i class="bi bi-speedometer2"></i>
                <span>Home</span>
            </button>
            <button class="nav-tab-btn ${currentAdminTab === 'admin-upload' ? 'active' : ''}" onclick="switchAdminTab('admin-upload')">
                <i class="bi bi-cloud-arrow-up-fill"></i>
                <span>Upload</span>
            </button>
            <button class="nav-tab-btn ${currentAdminTab === 'admin-users' ? 'active' : ''}" onclick="switchAdminTab('admin-users')">
                <i class="bi bi-people-fill"></i>
                <span>Users</span>
            </button>
            <button class="nav-tab-btn ${currentAdminTab === 'admin-diseases' ? 'active' : ''}" onclick="switchAdminTab('admin-diseases')">
                <i class="bi bi-shield-shaded"></i>
                <span>Diseases</span>
            </button>
            <button class="nav-tab-btn ${currentAdminTab === 'admin-diet-editor' ? 'active' : ''}" onclick="switchAdminTab('admin-diet-editor')">
                <i class="bi bi-pencil-square"></i>
                <span>Diets</span>
            </button>
            <button class="nav-tab-btn ${currentAdminTab === 'onboarding' ? 'active' : ''}" onclick="startOnboardingFlow()">
                <i class="bi bi-card-checklist"></i>
                <span>Intake</span>
            </button>
        `;
    } else {
        // Patients have no right to add users (no "New User" tab)
        nav.innerHTML = `
            <button class="nav-tab-btn ${currentUserTab === 'user-diet' ? 'active' : ''}" onclick="switchUserTab('user-diet')">
                <i class="bi bi-journal-medical"></i>
                <span>My Diet</span>
            </button>
            <button class="nav-tab-btn ${currentUserTab === 'user-foods' ? 'active' : ''}" onclick="switchUserTab('user-foods')">
                <i class="bi bi-egg-fried"></i>
                <span>Inspect Food</span>
            </button>
            <button class="nav-tab-btn ${currentUserTab === 'user-profile' ? 'active' : ''}" onclick="switchUserTab('user-profile')">
                <i class="bi bi-person-badge-fill"></i>
                <span>My Profile</span>
            </button>
        `;
    }
}

function switchAdminTab(tab) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Admin authentication required.");
        openAdminLoginModal();
        return;
    }
    if (!window.AdminAuth || !window.AdminAuth.isAuthenticated()) {
        openAdminLoginModal();
        return;
    }
    currentAdminTab = tab;
    renderBottomNav();
    renderCurrentView();
}

function switchUserTab(tab) {
    if (tab === 'onboarding' && currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can add users.");
        return;
    }
    currentUserTab = tab;
    renderBottomNav();
    renderCurrentView();
}

function handleMobileBack() {
    if (onboardingStep > 1 && (currentAdminTab === 'onboarding' || currentUserTab === 'onboarding')) {
        onboardingStep--;
        renderOnboardingStep();
        return;
    }

    if (currentRole === 'admin') {
        if (currentAdminTab !== 'admin-home') {
            switchAdminTab('admin-home');
        }
    } else {
        if (currentUserTab !== 'user-diet') {
            switchUserTab('user-diet');
        }
    }
}

function renderCurrentView() {
    const container = document.getElementById('mobileCardSheet');
    if (!container) return;

    if (currentRole === 'admin') {
        if (!window.AdminAuth || !window.AdminAuth.isAuthenticated()) {
            openAdminLoginModal();
            return;
        }
        switch (currentAdminTab) {
            case 'admin-home':
                renderAdminDashboard(container);
                break;
            case 'admin-upload':
                renderAdminMealUploader(container);
                break;
            case 'admin-users':
                renderAdminUsersHub(container);
                break;
            case 'admin-diseases':
                renderAdminDiseaseMaster(container);
                break;
            case 'admin-diet-editor':
                renderAdminDietEditor(container);
                break;
            case 'onboarding':
                renderOnboardingStep();
                break;
            default:
                renderAdminDashboard(container);
        }
    } else {
        // Users cannot access onboarding or admin views
        if (currentUserTab === 'onboarding') {
            currentUserTab = 'user-diet';
        }
        switch (currentUserTab) {
            case 'user-diet':
                renderUserDietView(container);
                break;
            case 'user-foods':
                renderUserFoodInspector(container);
                break;
            case 'user-profile':
                renderUserProfileView(container);
                break;
            default:
                renderUserDietView(container);
        }
    }
}

// Update Top App Screen Header
function setAppHeader(title, progressPct = 0, rightActionHtml = '', showBack = true) {
    const titleEl = document.getElementById('mobileCategoryTitle');
    const fillEl = document.getElementById('headerProgressFill');
    const trackEl = document.getElementById('headerProgressTrack');
    const backBtn = document.getElementById('mobileBackBtn');
    const rightEl = document.getElementById('headerRightAction');

    if (titleEl) titleEl.innerText = title;
    if (backBtn) backBtn.style.visibility = showBack ? 'visible' : 'hidden';
    if (rightEl) rightEl.innerHTML = rightActionHtml;

    if (fillEl && trackEl) {
        if (progressPct > 0) {
            trackEl.style.display = 'block';
            fillEl.style.width = `${progressPct}%`;
        } else {
            trackEl.style.display = 'none';
        }
    }
}

// =========================================================================
// 1. EXACT ONBOARDING QUESTIONNAIRE (MATCHING USER'S 5 SCREENSHOTS)
// =========================================================================
function startOnboardingFlow() {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can add new users.");
        return;
    }
    onboardingStep = 1;
    currentAdminTab = 'onboarding';
    renderBottomNav();
    renderOnboardingStep();
}

function renderOnboardingStep() {
    const container = document.getElementById('mobileCardSheet');
    if (!container) return;

    switch (onboardingStep) {
        case 1:
            renderQuestionGoal(container);
            break;
        case 2:
            renderQuestionGender(container);
            break;
        case 3:
            renderQuestionYear(container);
            break;
        case 4:
            renderQuestionHeight(container);
            break;
        case 5:
            renderQuestionWeight(container);
            break;
        case 6:
            renderQuestionEatingFrequency(container);
            break;
        case 7:
            renderQuestionClinicalFocus(container);
            break;
        default:
            renderQuestionGoal(container);
    }
}

// SCREEN 1: "What Is Your Main Goal?" (Screenshot 1)
function renderQuestionGoal(container) {
    setAppHeader('Basic Info', 18, '', false);

    const currentGoal = onboardingData.mainGoal || 'Gain energy';

    const goalOptions = [
        { 
            id: 'Lose weight', 
            label: 'Lose weight', 
            iconClass: 'lose-weight', 
            iconHtml: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3m0 0a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-3 7 3-3 3 3M6 21h12"/></svg>` 
        },
        { 
            id: 'Improve health', 
            label: 'Improve health', 
            iconClass: 'improve-health', 
            iconHtml: `<span style="font-size: 1.35rem;">🔥</span>` 
        },
        { 
            id: 'Gain energy', 
            label: 'Gain energy', 
            iconClass: 'gain-energy', 
            iconHtml: `<span style="font-size: 1.35rem;">💪</span>` 
        },
        { 
            id: 'Anti-aging and longevity', 
            label: 'Anti-aging and longevity', 
            iconClass: 'anti-aging', 
            iconHtml: `<span style="font-size: 1.35rem;">🍃</span>` 
        },
        { 
            id: 'Maintain weight', 
            label: 'Maintain weight', 
            iconClass: 'maintain-weight', 
            iconHtml: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="4"/><circle cx="12" cy="10" r="3"/><path d="m12 10 2-2"/></svg>` 
        }
    ];

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">What Is Your Main Goal?</h1>

            <div class="options-list-container">
                ${goalOptions.map(opt => `
                    <div class="select-card-item ${currentGoal === opt.id ? 'selected' : ''}" onclick="selectMainGoal('${opt.id}')">
                        <div class="goal-icon-box ${opt.iconClass}">
                            ${opt.iconHtml}
                        </div>
                        <div class="select-card-label">${opt.label}</div>
                        ${currentGoal === opt.id ? '<div class="select-check-badge"><i class="bi bi-check-lg"></i></div>' : ''}
                    </div>
                `).join('')}
            </div>

            <div class="privacy-footnote" style="display: none;"></div>

            <button class="btn-onboarding-next" onclick="nextOnboardingStep()" style="margin-top: auto;">
                <span>Next</span>
            </button>
        </div>
    `;
}

function selectMainGoal(goal) {
    onboardingData.mainGoal = goal;
    renderQuestionGoal(document.getElementById('mobileCardSheet'));
}

// SCREEN 2: "What Is Your Gender?" (Screenshots 2 & 3)
function renderQuestionGender(container) {
    setAppHeader('Basic Info', 32, '', true);

    const currentGender = onboardingData.gender || 'Female';

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">What Is Your Gender?</h1>

            <div class="options-list-container">
                <!-- Male Card -->
                <div class="select-card-item ${currentGender === 'Male' ? 'selected' : ''}" onclick="selectGender('Male')">
                    <div class="avatar-circle male">
                        <i class="bi bi-person-fill"></i>
                    </div>
                    <div class="select-card-label">Male</div>
                    ${currentGender === 'Male' ? '<div class="select-check-badge"><i class="bi bi-check-lg"></i></div>' : ''}
                </div>

                <!-- Female Card (Selected in screenshots) -->
                <div class="select-card-item ${currentGender === 'Female' ? 'selected' : ''}" onclick="selectGender('Female')">
                    <div class="avatar-circle female">
                        <i class="bi bi-person-hearts"></i>
                    </div>
                    <div class="select-card-label">Female</div>
                    ${currentGender === 'Female' ? '<div class="select-check-badge"><i class="bi bi-check-lg"></i></div>' : ''}
                </div>

                <!-- Others Card -->
                <div class="select-card-item ${currentGender === 'Others' ? 'selected' : ''}" onclick="selectGender('Others')">
                    <div class="avatar-circle others">
                        <i class="bi bi-gender-ambiguous"></i>
                    </div>
                    <div class="select-card-label">Others</div>
                    ${currentGender === 'Others' ? '<div class="select-check-badge"><i class="bi bi-check-lg"></i></div>' : ''}
                </div>
            </div>

            <div class="privacy-footnote">
                We'll never sell or inappropriately share your personal data.
            </div>

            <button class="btn-onboarding-next" onclick="nextOnboardingStep()">
                <span>Next</span>
            </button>
        </div>
    `;
}

function selectGender(gender) {
    onboardingData.gender = gender;
    renderQuestionGender(document.getElementById('mobileCardSheet'));
}

// SCREEN 3: "What Year Were You Born in?" (Screenshot 3)
function renderQuestionYear(container) {
    setAppHeader('Basic Info', 46, '<span onclick="jumpToStep(4)">Skip</span>', true);

    const year = onboardingData.yearOfBirth || 2000;

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">What Year Were You Born in?</h1>

            <!-- Interactive Year Wheel Picker matching Screenshot 1 -->
            <div class="year-picker-container">
                <div class="year-item faded-far" onclick="setBirthYear(${year - 2})">${year - 2}</div>
                <div class="year-item faded-near" onclick="setBirthYear(${year - 1})">${year - 1}</div>
                
                <div class="year-selected-box">
                    <button class="year-stepper-btn prev" onclick="setBirthYear(${year - 1})">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <span>${year}</span>
                    <button class="year-stepper-btn next" onclick="setBirthYear(${year + 1})">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>

                <div class="year-item faded-near" onclick="setBirthYear(${year + 1})">${year + 1}</div>
                <div class="year-item faded-far" onclick="setBirthYear(${year + 2})">${year + 2}</div>
            </div>

            <div style="text-align: center; margin-bottom: 14px;">
                <input type="range" min="1950" max="2012" value="${year}" 
                       style="width: 80%; accent-color: var(--primary-green); cursor: pointer;"
                       oninput="setBirthYear(parseInt(this.value))">
            </div>

            <!-- Privacy Notice Footer matching Screenshot -->
            <div class="privacy-footnote">
                We'll never sell or inappropriately share your personal data.
            </div>

            <!-- Big Emerald Next Button matching Screenshot -->
            <button class="btn-onboarding-next" onclick="nextOnboardingStep()">
                <span>Next</span>
            </button>
        </div>
    `;
}

function setBirthYear(val) {
    const y = Math.max(1940, Math.min(2015, val));
    onboardingData.yearOfBirth = y;
    renderQuestionYear(document.getElementById('mobileCardSheet'));
}

// SCREEN 4: "What Is Your Height?" (Screenshot 4)
function renderQuestionHeight(container) {
    setAppHeader('Basic Info', 62, '', true);

    const unit = onboardingData.heightUnit || 'ft';
    const totalInches = Math.round(onboardingData.heightCm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;

    const valueDisplay = unit === 'ft' 
        ? `<span class="measurement-number">${feet}'${inches}"</span><span class="measurement-unit">ft</span>`
        : `<span class="measurement-number">${Math.round(onboardingData.heightCm)}</span><span class="measurement-unit">cm</span>`;

    const labelsHtml = unit === 'ft'
        ? `<span>4'0"</span><span>5'0"</span><span>6'0"</span><span>7'0"</span>`
        : `<span>130</span><span>150</span><span>170</span><span>190</span>`;

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">What Is Your Height?</h1>

            <!-- Unit Toggle: cm vs ft -->
            <div class="unit-toggle-wrapper">
                <div class="unit-toggle-pill">
                    <button class="unit-toggle-btn ${unit === 'cm' ? 'active' : ''}" onclick="setHeightUnit('cm')">cm</button>
                    <button class="unit-toggle-btn ${unit === 'ft' ? 'active' : ''}" onclick="setHeightUnit('ft')">ft</button>
                </div>
            </div>

            <!-- Value Display: 5'3" ft -->
            <div class="measurement-value-display">
                ${valueDisplay}
            </div>

            <!-- Interactive Height Ruler -->
            <div class="ruler-section">
                <div class="ruler-pointer"></div>
                <div class="ruler-track-container">
                    <div class="ruler-center-line"></div>
                    <div class="ruler-ticks-track">
                        ${renderRulerTicksHtml(33)}
                    </div>
                </div>
                <div class="ruler-labels-row">
                    ${labelsHtml}
                </div>
                <div class="ruler-slider-wrapper">
                    <input type="range" class="ruler-range-input" min="120" max="215" value="${Math.round(onboardingData.heightCm)}" 
                           oninput="setHeightCm(parseFloat(this.value))">
                </div>
            </div>

            <div style="flex: 1;"></div>

            <div class="privacy-footnote">
                We'll never sell or inappropriately share your personal data.
            </div>

            <button class="btn-onboarding-next" onclick="nextOnboardingStep()">
                <span>Next</span>
            </button>
        </div>
    `;
}

function setHeightUnit(unit) {
    onboardingData.heightUnit = unit;
    renderQuestionHeight(document.getElementById('mobileCardSheet'));
}

function setHeightCm(val) {
    onboardingData.heightCm = val;
    renderQuestionHeight(document.getElementById('mobileCardSheet'));
}

// SCREEN 5: "What Is Your Weight?" (Screenshot 2)
function renderQuestionWeight(container) {
    setAppHeader('Basic Info', 78, '', true);

    const unit = onboardingData.weightUnit || 'lbs';
    const lbs = (onboardingData.weightKg * 2.20462).toFixed(1);
    const kg = (onboardingData.weightKg).toFixed(1);

    const valueDisplay = unit === 'lbs'
        ? `<span class="measurement-number">${lbs}</span><span class="measurement-unit">lbs</span>`
        : `<span class="measurement-number">${kg}</span><span class="measurement-unit">kg</span>`;

    // Calculate Dynamic Asian-Indian BMI
    const hm = (onboardingData.heightCm || 160) / 100;
    const bmiVal = (onboardingData.weightKg / (hm * hm)).toFixed(1);
    const bmiNum = parseFloat(bmiVal);

    let bmiCat = 'Normal';
    let bmiClass = 'normal';
    if (bmiNum < 18.5) {
        bmiCat = 'Underweight';
        bmiClass = 'underweight';
    } else if (bmiNum < 25.0) {
        bmiCat = 'Normal';
        bmiClass = 'normal';
    } else if (bmiNum < 30.0) {
        bmiCat = 'Overweight';
        bmiClass = 'overweight';
    } else if (bmiNum < 35.0) {
        bmiCat = 'Obese';
        bmiClass = 'obese';
    } else {
        bmiCat = 'Severely Obese';
        bmiClass = 'severely-obese';
    }

    // Pointer offset calculation between 15 and 40
    const arrowPct = Math.max(3, Math.min(97, ((bmiNum - 15) / 25) * 100));

    const curLbsRound = Math.round(onboardingData.weightKg * 2.20462);
    const curKgRound = Math.round(onboardingData.weightKg);

    const rulerLabels = unit === 'lbs'
        ? `<span>${curLbsRound - 1}</span><span>${curLbsRound}</span><span>${curLbsRound + 1}</span><span>${curLbsRound + 2}</span>`
        : `<span>${curKgRound - 2}</span><span>${curKgRound - 1}</span><span>${curKgRound}</span><span>${curKgRound + 1}</span>`;

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">What Is Your Weight?</h1>

            <!-- Unit Toggle: kg vs lbs -->
            <div class="unit-toggle-wrapper">
                <div class="unit-toggle-pill">
                    <button class="unit-toggle-btn ${unit === 'kg' ? 'active' : ''}" onclick="setWeightUnit('kg')">kg</button>
                    <button class="unit-toggle-btn ${unit === 'lbs' ? 'active' : ''}" onclick="setWeightUnit('lbs')">lbs</button>
                </div>
            </div>

            <!-- Value Display: 154.3 lbs -->
            <div class="measurement-value-display">
                ${valueDisplay}
            </div>

            <!-- Interactive Weight Ruler -->
            <div class="ruler-section">
                <div class="ruler-pointer"></div>
                <div class="ruler-track-container">
                    <div class="ruler-center-line"></div>
                    <div class="ruler-ticks-track">
                        ${renderRulerTicksHtml(33)}
                    </div>
                </div>
                <div class="ruler-labels-row">
                    ${rulerLabels}
                </div>
                <div class="ruler-slider-wrapper">
                    <input type="range" class="ruler-range-input" min="38" max="150" step="0.2" value="${onboardingData.weightKg}" 
                           oninput="setWeightKg(parseFloat(this.value))">
                </div>
            </div>

            <!-- Dynamic Live BMI Card (Matching Screenshot 2) -->
            <div class="bmi-card-box">
                <div class="bmi-card-title-row">
                    <span class="bmi-title-bold">Your BMI: ${bmiVal}</span>
                    <span class="bmi-category-label ${bmiClass}">${bmiCat}</span>
                </div>

                <!-- Down-Arrow Marker pointing to exact segment -->
                <div class="bmi-marker-track">
                    <div class="bmi-marker-arrow" style="left: ${arrowPct}%;"></div>
                </div>

                <!-- 5-Color Segmented Bar -->
                <div class="bmi-multi-bar">
                    <div class="bmi-bar-segment under" title="Underweight (<18.5)"></div>
                    <div class="bmi-bar-segment norm" title="Normal (18.5-25)"></div>
                    <div class="bmi-bar-segment over" title="Overweight (25-30)"></div>
                    <div class="bmi-bar-segment ob1" title="Obese I (30-35)"></div>
                    <div class="bmi-bar-segment ob2" title="Obese II (>35)"></div>
                </div>

                <!-- Scale Tick Numbers (15, 18.5, 25, 30, 35, 40) -->
                <div class="bmi-bar-ticks-row">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                </div>
            </div>

            <div class="privacy-footnote">
                We'll never sell or inappropriately share your personal data.
            </div>

            <button class="btn-onboarding-next" onclick="nextOnboardingStep()">
                <span>Next</span>
            </button>
        </div>
    `;
}

function setWeightUnit(unit) {
    onboardingData.weightUnit = unit;
    renderQuestionWeight(document.getElementById('mobileCardSheet'));
}

function setWeightKg(val) {
    onboardingData.weightKg = val;
    renderQuestionWeight(document.getElementById('mobileCardSheet'));
}

function renderRulerTicksHtml(count = 33) {
    let html = '';
    for (let i = 0; i < count; i++) {
        let type = 'minor';
        if (i % 5 === 0) type = 'medium';
        if (i % 10 === 0) type = 'major';
        html += `<div class="ruler-tick ${type}"></div>`;
    }
    return html;
}

// SCREEN 6: "What Is Your Regular Eating Frequency?" (Screenshot with 2, 3, 4, 5, 6 meals)
function renderQuestionEatingFrequency(container) {
    setAppHeader('Eating habits', 90, '', true);

    let freq = onboardingData.eatingFrequency || '3 meals a day';
    if (freq === 'Three meals a day') freq = '3 meals a day';
    else if (freq === 'Two meals a day') freq = '2 meals a day';
    else if (freq === 'One meal a day') freq = '2 meals a day';
    else if (freq === 'More than three meals a day') freq = '4 meals a day';
    onboardingData.eatingFrequency = freq;

    const hasSelection = Boolean(freq);

    const options = [
        { label: '2 meals a day', iconClass: 'two-meals' },
        { label: '3 meals a day', iconClass: 'three-meals' },
        { label: '4 meals a day', iconClass: 'four-meals' },
        { label: '5 meals a day', iconClass: 'five-meals' },
        { label: '6 meals a day', iconClass: 'six-meals' }
    ];

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">What Is Your Regular Eating Frequency?</h1>

            <div class="options-list-container">
                ${options.map(opt => `
                    <div class="select-card-item ${freq === opt.label ? 'selected' : ''}" onclick="selectEatingFrequency('${opt.label}')">
                        <div class="cutlery-circle ${opt.iconClass}">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"></path>
                                <path d="M15 2v18"></path>
                                <path d="M7 2v20"></path>
                                <path d="M4 2v6a3 3 0 0 0 6 0V2"></path>
                            </svg>
                        </div>
                        <div class="select-card-label">${opt.label}</div>
                        ${freq === opt.label ? '<div class="select-check-badge"><i class="bi bi-check-lg"></i></div>' : ''}
                    </div>
                `).join('')}
            </div>

            <div style="flex: 1;"></div>

            <button class="btn-onboarding-next ${hasSelection ? '' : 'disabled'}" onclick="${hasSelection ? 'nextOnboardingStep()' : ''}">
                <span>Next</span>
            </button>
        </div>
    `;
}

function selectEatingFrequency(freq) {
    onboardingData.eatingFrequency = freq;
    renderQuestionEatingFrequency(document.getElementById('mobileCardSheet'));
}

// SCREEN 7: Medical Diagnoses & Finish
function renderQuestionClinicalFocus(container) {
    setAppHeader('Clinical Profile', 98, '', true);

    const diseases = db.diseases || [];

    container.innerHTML = `
        <div class="onboarding-screen-wrapper">
            <h1 class="onboarding-hero-title">Diet Preferences & Health Focus</h1>

            <div class="admin-card">
                <div class="form-input-group">
                    <label class="form-label-custom">Full Name *</label>
                    <input type="text" class="form-control-custom" value="${onboardingData.name}" 
                           oninput="onboardingData.name = this.value">
                </div>

                <div class="form-input-group">
                    <label class="form-label-custom">WhatsApp Phone *</label>
                    <input type="tel" class="form-control-custom" value="${onboardingData.contactNumber}" 
                           oninput="onboardingData.contactNumber = this.value">
                </div>

                <div class="form-input-group">
                    <label class="form-label-custom">Diet Preference *</label>
                    <select class="form-control-custom" onchange="onboardingData.primaryDietType = this.value">
                        <option value="Eggitarian" ${onboardingData.primaryDietType === 'Eggitarian' ? 'selected' : ''}>Eggitarian (Vegetarian + Eggs)</option>
                        <option value="Vegetarian" ${onboardingData.primaryDietType === 'Vegetarian' ? 'selected' : ''}>Pure Vegetarian</option>
                        <option value="Non-Veg" ${onboardingData.primaryDietType === 'Non-Veg' ? 'selected' : ''}>Non-Vegetarian (Chicken, Fish, Eggs)</option>
                        <option value="Vegan" ${onboardingData.primaryDietType === 'Vegan' ? 'selected' : ''}>100% Plant-Based Vegan</option>
                        <option value="Jain" ${onboardingData.primaryDietType === 'Jain' ? 'selected' : ''}>Jain Vegetarian (No Root Vegetables)</option>
                    </select>
                </div>

                <div class="form-input-group" style="margin-bottom: 0;">
                    <label class="form-label-custom">Clinical Diagnoses (Contraindication Filtering):</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                        ${diseases.slice(0, 6).map(d => `
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                                <input type="checkbox" value="${d.name}" 
                                       ${onboardingData.clinicalDiagnoses.includes(d.name) ? 'checked' : ''}
                                       onchange="toggleOnboardingDiagnosis('${d.name}', this.checked)"
                                       style="width: 18px; height: 18px; accent-color: var(--primary-green);">
                                <span>${d.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <button class="btn-onboarding-next" onclick="completeOnboardingFlow()" style="margin-top: 14px;">
                <i class="bi bi-magic"></i>
                <span>Finish & Generate Diet Plan</span>
            </button>
        </div>
    `;
}

function toggleOnboardingDiagnosis(diseaseName, checked) {
    if (checked) {
        if (!onboardingData.clinicalDiagnoses.includes(diseaseName)) {
            onboardingData.clinicalDiagnoses.push(diseaseName);
        }
    } else {
        onboardingData.clinicalDiagnoses = onboardingData.clinicalDiagnoses.filter(d => d !== diseaseName);
    }
}

function nextOnboardingStep() {
    if (onboardingStep < 7) {
        onboardingStep++;
        renderOnboardingStep();
    } else {
        completeOnboardingFlow();
    }
}

function jumpToStep(s) {
    onboardingStep = s;
    renderOnboardingStep();
}

function completeOnboardingFlow() {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can add users and generate diet plans.");
        return;
    }
    const age = 2026 - (onboardingData.yearOfBirth || 2000);
    const newUserData = {
        id: 'p-' + Date.now(),
        name: onboardingData.name || 'New Patient',
        contactNumber: onboardingData.contactNumber || '+919999999999',
        yearOfBirth: onboardingData.yearOfBirth,
        age: age,
        gender: onboardingData.gender,
        eatingFrequency: onboardingData.eatingFrequency,
        primaryDietType: onboardingData.primaryDietType,
        heightCm: onboardingData.heightCm,
        weightKg: onboardingData.weightKg,
        waistCm: onboardingData.waistCm,
        hipsCm: onboardingData.hipCm,
        activityLevel: onboardingData.activityLevel,
        clinicalDiagnoses: [...onboardingData.clinicalDiagnoses],
        calorieGoalType: 'Maintenance',
        macroDistributionPreset: 'Standard Balanced',
        primaryComplaint: 'Personalized Clinical Diet & Nutrition Prescription',
        mealFrequency: onboardingData.eatingFrequency,
        createdAt: new Date().toISOString()
    };

    const savedUser = db.saveUser(newUserData);
    db.setActiveUser(savedUser.id);
    activeUserId = savedUser.id;
    editorUserId = savedUser.id;

    // Automatically generate clean clinical diet plan for new user
    const generatedPlan = DietGenerator.generatePlan(savedUser);
    db.savePlan(generatedPlan);

    showToast(`User ${savedUser.name} registered and diet plan issued!`);
    setupUserDropdown();

    if (currentRole === 'admin') {
        currentAdminTab = 'admin-users';
        renderCurrentView();
    } else {
        currentUserTab = 'user-diet';
        renderCurrentView();
    }
}

// =========================================================================
// 2. ADMIN WORKFLOW: UPLOAD MEAL & RICH NUTRITION INSPECTOR
// =========================================================================
function renderAdminDashboard(container) {
    setAppHeader('Admin Portal', 0, '<i class="bi bi-shield-check text-success"></i> Dt. Ashish', false);

    const users = db.getUsers();
    const foods = db.getFoods();
    const plans = db.getPlans();

    container.innerHTML = `
        <!-- Welcome Card -->
        <div class="admin-card" style="background: linear-gradient(135deg, #0d2137 0%, #0d9488 100%); color: #ffffff; border: none;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-size: 0.72rem; text-transform: uppercase; color: #99f6e4; font-weight: 700;">Clinical Admin & Dietitian</div>
                    <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-main); margin-top: 2px;">Dt. Ashish</div>
                    <div style="font-size: 0.75rem; color: #ccfbf1; margin-top: 4px;">Role: Upload Meals & Manage All Patient Diets</div>
                </div>
                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #ffffff;">
                    <i class="bi bi-shield-shaded"></i>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button class="btn-onboarding-next" style="height: 38px; font-size: 0.8rem; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); box-shadow: none;" onclick="switchAdminTab('admin-upload')">
                    <i class="bi bi-cloud-arrow-up-fill"></i> Upload Meal
                </button>
                <button class="btn-onboarding-next" style="height: 38px; font-size: 0.8rem; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); box-shadow: none;" onclick="switchAdminTab('admin-users')">
                    <i class="bi bi-people-fill"></i> Users Hub
                </button>
                <button class="btn-onboarding-next" style="height: 38px; font-size: 0.8rem; background: rgba(239,68,68,0.25); border: 1px solid rgba(239,68,68,0.45); color: #fecaca; box-shadow: none;" onclick="logoutAdmin()" title="Logout Admin">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </button>
            </div>
        </div>

        <!-- Quick Metrics Grid -->
        <div class="macro-grid-4">
            <div class="macro-box-pill protein">
                <div class="macro-pill-val">${users.length}</div>
                <div class="macro-pill-lbl">Users</div>
            </div>
            <div class="macro-box-pill fat">
                <div class="macro-pill-val">${foods.length}</div>
                <div class="macro-pill-lbl">Meals</div>
            </div>
            <div class="macro-box-pill carbs">
                <div class="macro-pill-val">${plans.length}</div>
                <div class="macro-pill-lbl">Diets</div>
            </div>
            <div class="macro-box-pill calories">
                <div class="macro-pill-val">100%</div>
                <div class="macro-pill-lbl">Offline</div>
            </div>
        </div>

        <!-- Meal Showcase Quick Card (Egg Highlight requested by user) -->
      <div class="admin-card-header" style="margin-top: 8px;">
            <div class="admin-card-title">
                <i class="bi bi-stars" style="color: var(--primary-green);"></i>
                <span>Featured Meal</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--primary-green); font-weight: 700; cursor: pointer;" onclick="openMealLibrary()">
                View All Meal Specs →
            </span>
        </div>



        <!-- Quick User Management Shortcuts -->
        <div class="admin-card-header" style="margin-top: 10px;">
            <div class="admin-card-title">
                <i class="bi bi-person-lines-fill" style="color: var(--primary-green);"></i>
                <span>Registered Users (${users.length})</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--primary-green); font-weight: 700; cursor: pointer;" onclick="switchAdminTab('admin-users')">
                Manage All →
            </span>
        </div>
        <div>
            ${users.slice(0, 3).map(u => `
                <div class="user-card-item">
                    <div class="user-card-header">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="user-avatar-badge">${u.name.charAt(0)}</div>
                            <div>
                                <div style="font-weight: 800; font-size: 0.95rem; color: var(--navy-900);">${u.name}</div>
                                <div style="font-size: 0.72rem; color: var(--slate-500);">${u.age}y • ${u.gender} • ${u.eatingFrequency || '3 Meals'}</div>
                            </div>
                        </div>
                        <span style="background: #eafaf4; color: var(--primary-green); font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 9999px;">
                            BMI: ${ClinicalCalculator.calculateBMI(u.weightKg, u.heightCm)}
                        </span>
                    </div>
                    <div class="user-action-btns">
                        <button class="btn-user-action primary" onclick="openDietEditorForUser('${u.id}')">
                            <i class="bi bi-pencil-square"></i> Edit Diet
                        </button>
                        <button class="btn-user-action" onclick="openEditUserModal('${u.id}')">
                            <i class="bi bi-person-gear"></i> Edit User
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderFeaturedEggCard() {
    const egg = db.getFood('f-8') || db.getFoods()[0];
    if (!egg) return '';
    const nut = db.calculateMealNutrients(egg, 50);

    return `
        <div class="meal-showcase-box" onclick="openMealInspector('${egg.id}')" style="cursor: pointer;">
            <div class="meal-showcase-top">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div class="meal-icon-avatar">🍳</div>
                    <div>
                        <div style="font-size: 1.05rem; font-weight: 800; color: var(--navy-900);">${egg.name}</div>
                        <div style="font-size: 0.74rem; color: var(--slate-500);">Standard Portion: 50g (1 Large Egg)</div>
                    </div>
                </div>
                <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 9999px;">
                    ${nut.calories} kcal
                </span>
            </div>

            <!-- Protein, Vitamins, Fat Breakdown (Directly addressing user prompt) -->
            <div class="macro-grid-4">
                <div class="macro-box-pill protein">
                    <div class="macro-pill-val">${nut.protein}g</div>
                    <div class="macro-pill-lbl">Protein</div>
                </div>
                <div class="macro-box-pill fat">
                    <div class="macro-pill-val">${nut.fat}g</div>
                    <div class="macro-pill-lbl">Fat</div>
                </div>
                <div class="macro-box-pill carbs">
                    <div class="macro-pill-val">${nut.carbs}g</div>
                    <div class="macro-pill-lbl">Carbs</div>
                </div>
                <div class="macro-box-pill calories">
                    <div class="macro-pill-val">${nut.calories}</div>
                    <div class="macro-pill-lbl">Calories</div>
                </div>
            </div>

            <!-- Vitamins & Minerals Bar -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 8px 12px; font-size: 0.72rem; color: var(--navy-800); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px;">
                <span>🌟 <strong>Vit A:</strong> ${nut.vitaminA}mcg</span>
                <span>☀️ <strong>Vit D:</strong> ${nut.vitaminD}mcg</span>
                <span>🧠 <strong>Vit B12:</strong> ${nut.vitaminB12}mcg</span>
                <span>🩸 <strong>Iron:</strong> ${nut.iron}mg</span>
            </div>
            <div style="text-align: right; margin-top: 6px; font-size: 0.7rem; color: var(--primary-green); font-weight: 700;">
                Tap to simulate 1, 2, or 3 eggs →
            </div>
        </div>
    `;
}

// ADMIN TAB: MEAL UPLOADER
function renderAdminMealUploader(container) {
    setAppHeader('Upload Meal', 0, '', true);

    const foods = db.getFoods();

    container.innerHTML = `
        <div class="admin-card">
            <div class="admin-card-header">
                <div class="admin-card-title">
                    <i class="bi bi-cloud-arrow-up-fill" style="color: var(--primary-green);"></i>
                    <span>Admin Meal Uploader</span>
                </div>
                <span style="font-size: 0.72rem; color: var(--slate-500); font-weight: 600;">Full Macro & Vitamin Engine</span>
            </div>

            <form id="uploadMealForm" onsubmit="handleUploadMealSubmit(event)">
                <div class="form-input-group">
                    <label class="form-label-custom">Meal Name * (e.g. Whole Boiled Egg, Chicken Breast)</label>
                    <input type="text" id="upload_name" class="form-control-custom" placeholder="e.g. Whole Boiled Egg" required value="Whole Boiled Egg">
                </div>

                <div class="form-row-2">
                    <div class="form-input-group">
                        <label class="form-label-custom">Category *</label>
                        <select id="upload_category" class="form-control-custom">
                            <option value="Proteins" selected>Proteins</option>
                            <option value="Cereals">Cereals</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Nuts & Seeds">Nuts & Seeds</option>
                            <option value="Snacks">Snacks</option>
                            <option value="Beverages">Beverages</option>
                        </select>
                    </div>
                    <div class="form-input-group">
                        <label class="form-label-custom">Serving Size *</label>
                        <div style="display: flex; gap: 4px;">
                            <input type="number" id="upload_serving" class="form-control-custom" value="50" style="flex: 2;">
                            <select id="upload_unit" class="form-control-custom" style="flex: 1.2;">
                                <option value="g" selected>g</option>
                                <option value="piece">pc</option>
                                <option value="ml">ml</option>
                                <option value="bowl">bowl</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Macronutrient Inputs (in total grams per serving) -->
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--navy-900); margin: 10px 0 6px 0; text-transform: uppercase;">
                    1. Macronutrients (Per Serving):
                </div>
                <div class="form-row-2">
                    <div class="form-input-group">
                        <label class="form-label-custom">Protein (g) *</label>
                        <input type="number" step="0.1" id="upload_protein" class="form-control-custom" value="6.3" required>
                    </div>
                    <div class="form-input-group">
                        <label class="form-label-custom">Fat (g) *</label>
                        <input type="number" step="0.1" id="upload_fat" class="form-control-custom" value="5.0" required>
                    </div>
                </div>

                <div class="form-row-2">
                    <div class="form-input-group">
                        <label class="form-label-custom">Carbs (g)</label>
                        <input type="number" step="0.1" id="upload_carbs" class="form-control-custom" value="0.6">
                    </div>
                    <div class="form-input-group">
                        <label class="form-label-custom">Fiber (g)</label>
                        <input type="number" step="0.1" id="upload_fiber" class="form-control-custom" value="0">
                    </div>
                </div>

                <!-- Vitamins & Micronutrients Inputs (User prompt: show how much meal protein, vitamin, fat) -->
                <div style="font-size: 0.78rem; font-weight: 800; color: var(--navy-900); margin: 10px 0 6px 0; text-transform: uppercase;">
                    2. Vitamins & Minerals (Per Serving):
                </div>
                <div class="form-row-2">
                    <div class="form-input-group">
                        <label class="form-label-custom">Vitamin A (mcg)</label>
                        <input type="number" step="0.1" id="upload_vitA" class="form-control-custom" value="80">
                    </div>
                    <div class="form-input-group">
                        <label class="form-label-custom">Vitamin D (mcg)</label>
                        <input type="number" step="0.01" id="upload_vitD" class="form-control-custom" value="1.1">
                    </div>
                </div>

                <div class="form-row-2">
                    <div class="form-input-group">
                        <label class="form-label-custom">Vitamin B12 (mcg)</label>
                        <input type="number" step="0.01" id="upload_vitB12" class="form-control-custom" value="0.6">
                    </div>
                    <div class="form-input-group">
                        <label class="form-label-custom">Vitamin C (mg)</label>
                        <input type="number" step="0.1" id="upload_vitC" class="form-control-custom" value="0">
                    </div>
                </div>

                <div class="form-row-2">
                    <div class="form-input-group">
                        <label class="form-label-custom">Calcium (mg)</label>
                        <input type="number" step="0.1" id="upload_calcium" class="form-control-custom" value="25">
                    </div>
                    <div class="form-input-group">
                        <label class="form-label-custom">Iron (mg)</label>
                        <input type="number" step="0.01" id="upload_iron" class="form-control-custom" value="0.9">
                    </div>
                </div>

                <div class="form-input-group">
                    <label class="form-label-custom">Diet Category</label>
                    <select id="upload_dietCategory" class="form-control-custom">
                        <option value="Eggitarian" selected>Eggitarian</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Veg">Non-Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                    </select>
                </div>

                <div class="form-input-group">
                    <label class="form-label-custom">Dietitian Notes / Clinical Benefits</label>
                    <textarea id="upload_notes" class="form-control-custom" style="height: 60px; padding-top: 8px;" placeholder="Clinical notes... e.g. High bioavailable protein and choline for cellular health.">High bioavailable reference protein with Vitamin D, Vitamin B12, and brain-essential choline (147mg).</textarea>
                </div>

                <button type="submit" class="btn-onboarding-next" style="margin-top: 8px;">
                    <i class="bi bi-cloud-arrow-up-fill"></i>
                    <span>Upload Meal & Inspect Nutrition</span>
                </button>
            </form>
        </div>

        <!-- Meals Library List with Quick Inspector -->
        <div class="admin-card-header" style="margin-top: 14px;">
            <div class="admin-card-title">
                <i class="bi bi-database-fill" style="color: var(--primary-green);"></i>
                <span>Uploaded Meals Library (${foods.length})</span>
            </div>
        </div>

        <div>
            ${foods.map(f => {
                const nut = db.calculateMealNutrients(f, f.servingQuantity);
                return `
                    <div class="admin-card" style="padding: 12px; margin-bottom: 10px; cursor: pointer;" onclick="openMealInspector('${f.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-weight: 800; font-size: 0.95rem; color: var(--navy-900);">${f.name}</div>
                                <div style="font-size: 0.72rem; color: var(--slate-500);">${f.category} • Serving: ${f.servingQuantity}${f.standardUnit}</div>
                            </div>
                            <span style="font-weight: 800; font-size: 0.85rem; color: var(--primary-green);">
                                ${nut.calories} kcal
                            </span>
                        </div>
                        <div style="display: flex; gap: 6px; margin-top: 8px; font-size: 0.7rem;">
                            <span style="background: #f0fdf4; color: #166534; padding: 2px 6px; border-radius: 6px; font-weight: 700;">
                                P: ${nut.protein}g
                            </span>
                            <span style="background: #fffbeb; color: #92400e; padding: 2px 6px; border-radius: 6px; font-weight: 700;">
                                F: ${nut.fat}g
                            </span>
                            <span style="background: #eff6ff; color: #1e40af; padding: 2px 6px; border-radius: 6px; font-weight: 700;">
                                C: ${nut.carbs}g
                            </span>
                            <span style="background: #fdf2f8; color: #9d174d; padding: 2px 6px; border-radius: 6px; font-weight: 700;">
                                D: ${nut.vitaminD}µg
                            </span>
                            <span style="background: #faf5ff; color: #6b21a8; padding: 2px 6px; border-radius: 6px; font-weight: 700;">
                                B12: ${nut.vitaminB12}µg
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function handleUploadMealSubmit(e) {
    e.preventDefault();
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can upload new meals.");
        return;
    }
    const name = document.getElementById('upload_name').value.trim();
    const category = document.getElementById('upload_category').value;
    const serving = parseFloat(document.getElementById('upload_serving').value) || 100;
    const unit = document.getElementById('upload_unit').value;
    const protein = parseFloat(document.getElementById('upload_protein').value) || 0;
    const fat = parseFloat(document.getElementById('upload_fat').value) || 0;
    const carbs = parseFloat(document.getElementById('upload_carbs').value) || 0;
    const fiber = parseFloat(document.getElementById('upload_fiber').value) || 0;
    const vitA = parseFloat(document.getElementById('upload_vitA').value) || 0;
    const vitD = parseFloat(document.getElementById('upload_vitD').value) || 0;
    const vitB12 = parseFloat(document.getElementById('upload_vitB12').value) || 0;
    const vitC = parseFloat(document.getElementById('upload_vitC').value) || 0;
    const calcium = parseFloat(document.getElementById('upload_calcium').value) || 0;
    const iron = parseFloat(document.getElementById('upload_iron').value) || 0;
    const dietCategory = document.getElementById('upload_dietCategory').value;
    const notes = document.getElementById('upload_notes').value;

    const mealData = {
        name,
        category,
        standardUnit: unit,
        servingQuantity: serving,
        // Calculate per gram rates
        carbsPerGram: carbs / serving,
        proteinPerGram: protein / serving,
        fatPerGram: fat / serving,
        fiberPerGram: fiber / serving,
        vitaminA_mcgPerGram: vitA / serving,
        vitaminD_mcgPerGram: vitD / serving,
        vitaminB12_mcgPerGram: vitB12 / serving,
        vitaminC_mgPerGram: vitC / serving,
        calcium_mgPerGram: calcium / serving,
        iron_mgPerGram: iron / serving,
        dietCategory,
        notes
    };

    const saved = db.uploadMeal(mealData);
    showToast(`Meal "${saved.name}" uploaded successfully!`);

    // Directly open the nutrition inspector showcase card as requested!
    openMealInspector(saved.id);
}

// =========================================================================
// MEAL NUTRITION INSPECTOR SHOWCASE (EGG SHOWCASE CARD WITH PROTEIN, VITAMIN, FAT)
// =========================================================================
function openMealLibrary() {
    const foods = db.getFoods();
    const sheet = document.getElementById('mobileModalSheet');
    const modal = document.getElementById('mobileModalOverlay');
    if (!sheet || !modal) return;

    sheet.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--navy-900); margin: 0;">All Meal Specs</h3>
                <span style="font-size: 0.75rem; color: var(--slate-500);">${foods.length} meals available</span>
            </div>
            <button onclick="closeMobileModal()" style="border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer;" aria-label="Close meal library">
                ✕
            </button>
        </div>
        <p style="font-size: 0.76rem; color: var(--slate-500); margin-bottom: 12px;">
            Select any meal to view its full macros, vitamins, minerals, and portion sizes.
        </p>
        ${foods.length ? renderFoodItemsLibrary(foods, true) : `
            <div class="admin-card" style="text-align: center; color: var(--slate-500);">
                No meals are available yet. Upload a meal to see its nutrition specs here.
            </div>
        `}
    `;
    modal.style.display = 'flex';
}

function openMealInspector(foodId, returnToLibrary = false) {
    const food = db.getFood(foodId) || db.getFoods()[0];
    if (!food) return;

    inspectedMeal = food;
    inspectedPortion = food.servingQuantity || 50;
    inspectedFromLibrary = returnToLibrary;

    renderMealInspectorModalContent();
    const modal = document.getElementById('mobileModalOverlay');
    if (modal) modal.style.display = 'flex';
}

function renderMealInspectorModalContent() {
    const sheet = document.getElementById('mobileModalSheet');
    if (!sheet || !inspectedMeal) return;

    const nut = db.calculateMealNutrients(inspectedMeal, inspectedPortion);
    const isEgg = inspectedMeal.name.toLowerCase().includes('egg');

    sheet.innerHTML = `
        ${inspectedFromLibrary ? `
            <button onclick="openMealLibrary()" style="border: none; background: transparent; color: var(--primary-green); font-size: 0.78rem; font-weight: 700; padding: 0 0 10px; cursor: pointer;">
                ← Back to all meals
            </button>
        ` : ''}
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="meal-icon-avatar" style="font-size: 1.8rem;">
                    ${isEgg ? '🍳' : '🥗'}
                </div>
                <div>
                    <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--navy-900); margin: 0;">${inspectedMeal.name}</h3>
                    <span style="font-size: 0.75rem; color: var(--slate-500);">${inspectedMeal.category} • ${inspectedMeal.dietCategory}</span>
                </div>
            </div>
            <button onclick="closeMobileModal()" style="border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer;">
                ✕
            </button>
        </div>

        <!-- Portion Scaling Bar (e.g. 1 egg, 2 eggs, 3 eggs) -->
        <div class="portion-slider-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.78rem; font-weight: 700; color: var(--navy-900);">Portion Size:</span>
                <span style="font-size: 0.85rem; font-weight: 800; color: var(--primary-green);">${inspectedPortion} ${inspectedMeal.standardUnit}</span>
            </div>
            ${isEgg ? `
                <div class="portion-buttons-row">
                    <button class="portion-btn ${inspectedPortion === 50 ? 'active' : ''}" onclick="setInspectedPortion(50)">1 Large Egg (50g)</button>
                    <button class="portion-btn ${inspectedPortion === 100 ? 'active' : ''}" onclick="setInspectedPortion(100)">2 Eggs (100g)</button>
                    <button class="portion-btn ${inspectedPortion === 150 ? 'active' : ''}" onclick="setInspectedPortion(150)">3 Eggs (150g)</button>
                </div>
            ` : `
                <div class="portion-buttons-row">
                    <button class="portion-btn ${inspectedPortion === 50 ? 'active' : ''}" onclick="setInspectedPortion(50)">50g</button>
                    <button class="portion-btn ${inspectedPortion === 100 ? 'active' : ''}" onclick="setInspectedPortion(100)">100g</button>
                    <button class="portion-btn ${inspectedPortion === 150 ? 'active' : ''}" onclick="setInspectedPortion(150)">150g</button>
                    <button class="portion-btn ${inspectedPortion === 200 ? 'active' : ''}" onclick="setInspectedPortion(200)">200g</button>
                </div>
            `}
        </div>

        <!-- 4 Big Macro Cards (Addressing user request: show how much meal protein, vitamin, fat) -->
        <div style="font-size: 0.76rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; margin-bottom: 6px;">
            Macronutrients Breakdown:
        </div>
        <div class="macro-grid-4">
            <div class="macro-box-pill protein">
                <div class="macro-pill-val">${nut.protein}g</div>
                <div class="macro-pill-lbl">Protein</div>
            </div>
            <div class="macro-box-pill fat">
                <div class="macro-pill-val">${nut.fat}g</div>
                <div class="macro-pill-lbl">Fat</div>
            </div>
            <div class="macro-box-pill carbs">
                <div class="macro-pill-val">${nut.carbs}g</div>
                <div class="macro-pill-lbl">Carbs</div>
            </div>
            <div class="macro-box-pill calories">
                <div class="macro-pill-val">${nut.calories}</div>
                <div class="macro-pill-lbl">Calories</div>
            </div>
        </div>

        <!-- Vitamins & Minerals Detailed Matrix -->
        <div style="font-size: 0.76rem; font-weight: 800; color: var(--slate-500); text-transform: uppercase; margin: 12px 0 6px 0;">
            Vitamins & Micronutrients Spectrum:
        </div>
        <div class="vitamin-matrix-grid">
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🌟 Vitamin A</span>
                <span class="vitamin-badge-val">${nut.vitaminA} mcg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">☀️ Vitamin D</span>
                <span class="vitamin-badge-val">${nut.vitaminD} mcg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🧠 Vitamin B12</span>
                <span class="vitamin-badge-val">${nut.vitaminB12} mcg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🍊 Vitamin C</span>
                <span class="vitamin-badge-val">${nut.vitaminC} mg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🌿 Vitamin E</span>
                <span class="vitamin-badge-val">${nut.vitaminE} mg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🥛 Calcium</span>
                <span class="vitamin-badge-val">${nut.calcium} mg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🩸 Iron</span>
                <span class="vitamin-badge-val">${nut.iron} mg</span>
            </div>
            <div class="vitamin-row-card">
                <span class="vitamin-badge-label">🌾 Dietary Fiber</span>
                <span class="vitamin-badge-val">${nut.fiber} g</span>
            </div>
        </div>

        <!-- Clinical Notes -->
        <div style="background: #f8fafc; border-left: 3px solid var(--primary-green); padding: 10px 12px; border-radius: 8px; margin-top: 14px; font-size: 0.76rem; color: var(--navy-800);">
            <strong>Clinical Advice:</strong> ${inspectedMeal.notes || 'Nutrient-dense clinical food source.'}
        </div>

        <!-- Action Buttons: Admin has Add & Delete, User has Read-Only Notice -->
        ${currentRole === 'admin' ? `
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <button class="btn-onboarding-next" style="flex: 2; height: 46px; font-size: 0.88rem;" onclick="addInspectedMealToActiveUserDiet()">
                    <i class="bi bi-plus-circle-fill"></i> Add to User Diet
                </button>
                <button class="btn-user-action danger" style="flex: 1; height: 46px; font-size: 0.82rem;" onclick="deleteInspectedMeal('${inspectedMeal.id}')">
                    <i class="bi bi-trash-fill"></i> Delete
                </button>
            </div>
        ` : `
            <div class="user-role-notice-card">
                <i class="bi bi-shield-lock-fill" style="color: #059669; font-size: 1.25rem;"></i>
                <div style="font-size: 0.76rem; color: #166534; line-height: 1.35;">
                    <strong>Prescribed Diet Plan:</strong> This nutritional information is for personal reference. Only Administrator has rights to add foods to diets or delete meals.
                </div>
            </div>
        `}
    `;
}

function setInspectedPortion(qty) {
    inspectedPortion = qty;
    renderMealInspectorModalContent();
}

function addInspectedMealToActiveUserDiet() {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can add meals to a user's diet.");
        return;
    }
    if (!inspectedMeal) return;
    const user = db.getActiveUser();
    if (!user) {
        alert("Please select a user first!");
        return;
    }

    // User & Diet Validation (Check user's diseases and their restricted foods)
    const restriction = db.isFoodRestrictedForUser(user.id, inspectedMeal.id);
    if (restriction && restriction.isRestricted) {
        showMobileRestrictionWarning(restriction.foodName, restriction.diseaseName);
        return; // Do not allow that food to be added to user's diet
    }

    db.addMealToUserDiet(user.id, 'Breakfast', inspectedMeal.id, inspectedPortion, `Added via meal inspector`);
    closeMobileModal();
    showToast(`Added ${inspectedMeal.name} (${inspectedPortion}g) to ${user.name}'s Diet!`);
    
    switchAdminTab('admin-diet-editor');
}

function deleteInspectedMeal(foodId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can delete meals.");
        return;
    }
    if (confirm("Are you sure you want to delete this meal from the database?")) {
        db.deleteFood(foodId);
        closeMobileModal();
        showToast("Meal deleted from library.");
        renderCurrentView();
    }
}

// =========================================================================
// 3. MULTI-USER MANAGEMENT: ADD, EDIT, DELETE USER & USER DIETS
// =========================================================================
function renderAdminUsersHub(container) {
    setAppHeader('Users Hub', 0, '<button class="header-right-action" style="border:none;background:transparent;" onclick="startOnboardingFlow()"><i class="bi bi-person-plus-fill"></i> Add</button>', true);

    const users = db.getUsers();

    container.innerHTML = `
        <div class="admin-card-header">
            <div class="admin-card-title">
                <i class="bi bi-people-fill" style="color: var(--primary-green);"></i>
                <span>All Registered Users (${users.length})</span>
            </div>
            <button class="btn-user-action primary" style="padding: 5px 12px; font-size: 0.75rem;" onclick="startOnboardingFlow()">
                <i class="bi bi-person-plus-fill"></i> New User
            </button>
        </div>

        <p style="font-size: 0.76rem; color: var(--slate-500); margin-bottom: 12px;">
            Admin management: Edit user demographics, delete users, and customize each user's clinical diet.
        </p>

        <div>
            ${users.map(u => {
                const bmi = ClinicalCalculator.calculateBMI(u.weightKg, u.heightCm);
                const bmiCat = ClinicalCalculator.getBMICategory(bmi);
                const userDiet = db.getUserDiet(u.id);

                return `
                    <div class="user-card-item">
                        <div class="user-card-header">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <div class="user-avatar-badge">${u.name.charAt(0)}</div>
                                <div>
                                    <div style="font-weight: 800; font-size: 1rem; color: var(--navy-900);">${u.name}</div>
                                    <div style="font-size: 0.74rem; color: var(--slate-500);">
                                        ${u.age}y (${u.yearOfBirth || (2026 - u.age)}) • ${u.gender} • ${u.primaryDietType}
                                    </div>
                                    <div style="font-size: 0.7rem; color: #0284c7; font-weight: 600;">
                                        <i class="bi bi-clock-history"></i> Frequency: ${u.eatingFrequency || 'Three meals a day'}
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <span style="background: #eafaf4; color: var(--primary-green); font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
                                    BMI: ${bmi}
                                </span>
                                <div style="font-size: 0.65rem; color: ${bmi >= 25 ? '#ef4444' : '#059669'}; font-weight: 700; margin-top: 2px;">
                                    ${bmiCat}
                                </div>
                            </div>
                        </div>

                        ${u.clinicalDiagnoses && u.clinicalDiagnoses.length > 0 ? `
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 6px 0;">
                                ${u.clinicalDiagnoses.map(d => `
                                    <span style="background: #fee2e2; color: #991b1b; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;">
                                        ${d}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}

                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--slate-500); margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--slate-200);">
                            <span><i class="bi bi-whatsapp text-success"></i> ${u.contactNumber || 'No contact'}</span>
                            <span>Prescribed Diet: <strong>${userDiet?.mealItems?.length || 0} items</strong></span>
                        </div>

                        <!-- 3 Core Admin User Actions: Edit Diet, Edit User, Delete User -->
                        <div class="user-action-btns">
                            <button class="btn-user-action primary" onclick="openDietEditorForUser('${u.id}')">
                                <i class="bi bi-pencil-square"></i> Edit Diet
                            </button>
                            <button class="btn-user-action" onclick="openEditUserModal('${u.id}')">
                                <i class="bi bi-person-gear"></i> Edit User
                            </button>
                            <button class="btn-user-action danger" onclick="deleteUserConfirm('${u.id}')">
                                <i class="bi bi-trash-fill"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function openDietEditorForUser(userId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can edit user diets.");
        return;
    }
    editorUserId = userId;
    activeUserId = userId;
    db.setActiveUser(userId);
    switchAdminTab('admin-diet-editor');
}

function deleteUserConfirm(userId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can delete users.");
        return;
    }
    const user = db.getUser(userId);
    if (!user) return;

    if (confirm(`Are you sure you want to permanently delete user "${user.name}" and all their diet plans?`)) {
        db.deleteUser(userId);
        setupUserDropdown();
        showToast(`User ${user.name} removed from system.`);
        renderCurrentView();
    }
}

// Edit User Demographics Modal
function openEditUserModal(userId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can edit user profiles.");
        return;
    }
    const user = db.getUser(userId);
    if (!user) return;

    const sheet = document.getElementById('mobileModalSheet');
    if (!sheet) return;

    sheet.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--navy-900); margin: 0;">
                <i class="bi bi-person-gear text-success"></i> Edit User: ${user.name}
            </h3>
            <button onclick="closeMobileModal()" style="border: none; background: #f1f5f9; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; cursor: pointer;">✕</button>
        </div>

        <form id="editUserForm" onsubmit="handleEditUserSubmit(event, '${user.id}')">
            <div class="form-input-group">
                <label class="form-label-custom">Full Name</label>
                <input type="text" id="edit_name" class="form-control-custom" value="${user.name}" required>
            </div>

            <div class="form-row-2">
                <div class="form-input-group">
                    <label class="form-label-custom">Year of Birth</label>
                    <input type="number" id="edit_year" class="form-control-custom" value="${user.yearOfBirth || (2026 - user.age)}">
                </div>
                <div class="form-input-group">
                    <label class="form-label-custom">Gender</label>
                    <select id="edit_gender" class="form-control-custom">
                        <option value="Male" ${user.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${user.gender === 'Female' ? 'selected' : ''}>Female</option>
                        <option value="Others" ${user.gender === 'Others' ? 'selected' : ''}>Others</option>
                    </select>
                </div>
            </div>

            <div class="form-row-2">
                <div class="form-input-group">
                    <label class="form-label-custom">Weight (kg)</label>
                    <input type="number" step="0.1" id="edit_weight" class="form-control-custom" value="${user.weightKg}">
                </div>
                <div class="form-input-group">
                    <label class="form-label-custom">Height (cm)</label>
                    <input type="number" step="0.1" id="edit_height" class="form-control-custom" value="${user.heightCm}">
                </div>
            </div>

            <div class="form-input-group">
                <label class="form-label-custom">Eating Frequency</label>
                <select id="edit_eatingFreq" class="form-control-custom">
                    <option value="2 meals a day" ${(user.eatingFrequency === '2 meals a day' || user.eatingFrequency === 'Two meals a day') ? 'selected' : ''}>2 meals a day</option>
                    <option value="3 meals a day" ${(user.eatingFrequency === '3 meals a day' || user.eatingFrequency === 'Three meals a day') ? 'selected' : ''}>3 meals a day</option>
                    <option value="4 meals a day" ${user.eatingFrequency === '4 meals a day' ? 'selected' : ''}>4 meals a day</option>
                    <option value="5 meals a day" ${user.eatingFrequency === '5 meals a day' ? 'selected' : ''}>5 meals a day</option>
                    <option value="6 meals a day" ${user.eatingFrequency === '6 meals a day' ? 'selected' : ''}>6 meals a day</option>
                </select>
            </div>

            <div class="form-input-group">
                <label class="form-label-custom">Diet Preference</label>
                <select id="edit_dietType" class="form-control-custom">
                    <option value="Vegetarian" ${user.primaryDietType === 'Vegetarian' ? 'selected' : ''}>Vegetarian</option>
                    <option value="Eggitarian" ${user.primaryDietType === 'Eggitarian' ? 'selected' : ''}>Eggitarian</option>
                    <option value="Non-Veg" ${user.primaryDietType === 'Non-Veg' ? 'selected' : ''}>Non-Vegetarian</option>
                    <option value="Vegan" ${user.primaryDietType === 'Vegan' ? 'selected' : ''}>Vegan</option>
                </select>
            </div>

            <div class="form-input-group">
                <label class="form-label-custom">WhatsApp Phone</label>
                <input type="tel" id="edit_contact" class="form-control-custom" value="${user.contactNumber || ''}">
            </div>

            <button type="submit" class="btn-onboarding-next" style="margin-top: 10px;">
                <i class="bi bi-save2-fill"></i> Save User Changes
            </button>
        </form>
    `;

    const modal = document.getElementById('mobileModalOverlay');
    if (modal) modal.style.display = 'flex';
}

function handleEditUserSubmit(e, userId) {
    e.preventDefault();
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can update user profiles.");
        return;
    }
    const year = parseInt(document.getElementById('edit_year').value) || 2000;
    const updates = {
        name: document.getElementById('edit_name').value.trim(),
        yearOfBirth: year,
        age: 2026 - year,
        gender: document.getElementById('edit_gender').value,
        weightKg: parseFloat(document.getElementById('edit_weight').value) || 70,
        heightCm: parseFloat(document.getElementById('edit_height').value) || 170,
        eatingFrequency: document.getElementById('edit_eatingFreq').value,
        primaryDietType: document.getElementById('edit_dietType').value,
        contactNumber: document.getElementById('edit_contact').value.trim()
    };

    db.saveUser({ id: userId, ...updates });
    closeMobileModal();
    setupUserDropdown();
    showToast("User profile updated!");
    renderCurrentView();
}

// =========================================================================
// 4. ADMIN USER DIET EDITOR: EDIT EVERY USER'S DIET IN REAL TIME
// =========================================================================
function renderAdminDietEditor(container) {
    const users = db.getUsers();
    const user = db.getUser(editorUserId) || users[0];
    if (!user) {
        container.innerHTML = `<div style="text-align: center; padding: 40px;">No users found.</div>`;
        return;
    }

    setAppHeader('User Diet Editor', 0, '', true);

    const plan = db.getUserDiet(user.id);
    const slots = ['Breakfast', 'Mid-Morning', 'Lunch', 'Evening', 'Dinner', 'Bedtime'];

    container.innerHTML = `
        <!-- User Selection Switcher for Diet Editor -->
        <div class="admin-card" style="padding: 12px; margin-bottom: 12px;">
            <label class="form-label-custom" style="margin-bottom: 4px;">Currently Editing Diet For:</label>
            <select class="form-control-custom" onchange="editorUserId = this.value; renderAdminDietEditor(document.getElementById('mobileCardSheet'))">
                ${users.map(u => `
                    <option value="${u.id}" ${u.id === user.id ? 'selected' : ''}>
                        ${u.name} (${u.age}y, ${u.primaryDietType} - ${u.eatingFrequency || '3 Meals'})
                    </option>
                `).join('')}
            </select>
        </div>

        <!-- Live Diet Macros & Calories Bar -->
        <div class="admin-card" style="background: #f8fafc; border-color: var(--primary-green); margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 800; font-size: 0.85rem; color: var(--navy-900);">Daily Nutrition Target</span>
                <span style="font-weight: 800; font-size: 0.9rem; color: var(--primary-green);">
                    ${plan.totalAllocatedCalories || 0} / ${plan.targetCalories || 1800} kcal
                </span>
            </div>

            <div class="macro-grid-4" style="margin-bottom: 6px;">
                <div class="macro-box-pill protein">
                    <div class="macro-pill-val">${plan.allocatedProteinGrams || 0}g</div>
                    <div class="macro-pill-lbl">Protein</div>
                </div>
                <div class="macro-box-pill fat">
                    <div class="macro-pill-val">${plan.allocatedFatGrams || 0}g</div>
                    <div class="macro-pill-lbl">Fat</div>
                </div>
                <div class="macro-box-pill carbs">
                    <div class="macro-pill-val">${plan.allocatedCarbsGrams || 0}g</div>
                    <div class="macro-pill-lbl">Carbs</div>
                </div>
                <div class="macro-box-pill calories">
                    <div class="macro-pill-val">${plan.totalAllocatedCalories || 0}</div>
                    <div class="macro-pill-lbl">Calories</div>
                </div>
            </div>

            <!-- Total Daily Vitamins Summary -->
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px; font-size: 0.72rem; color: var(--navy-800); margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--slate-200);">
                <span>🌟 <strong>Vit A:</strong> ${plan.totalVitaminA || 0}mcg</span>
                <span>☀️ <strong>Vit D:</strong> ${plan.totalVitaminD || 0}mcg</span>
                <span>🧠 <strong>Vit B12:</strong> ${plan.totalVitaminB12 || 0}mcg</span>
                <span>🩸 <strong>Iron:</strong> ${plan.totalIron || 0}mg</span>
            </div>
        </div>

        <!-- 6 Meal Slots with Add & Remove functionality -->
        <div class="admin-card-title" style="margin-bottom: 10px;">
            <i class="bi bi-clock-history text-success"></i>
            <span>Prescribed Meal Slots</span>
        </div>

        ${slots.map(slot => {
            const items = (plan.mealItems || []).filter(i => i.mealSlot.toLowerCase() === slot.toLowerCase());
            const slotCals = items.reduce((s, i) => s + (i.calories || 0), 0);

            return `
                <div class="diet-slot-card">
                    <div class="diet-slot-header">
                        <div class="diet-slot-title">
                            <span>${slot}</span>
                            <span style="font-size: 0.7rem; color: var(--slate-500); font-weight: 600;">(${db.getDefaultTimeForSlot(slot)})</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-weight: 800; font-size: 0.8rem; color: var(--primary-green);">${slotCals} kcal</span>
                            <button class="btn-user-action primary" style="padding: 3px 8px; font-size: 0.68rem;" onclick="openAddMealToSlotModal('${user.id}', '${slot}')">
                                <i class="bi bi-plus-lg"></i> Add Meal
                            </button>
                        </div>
                    </div>

                    ${items.length === 0 ? `
                        <div style="font-size: 0.74rem; color: var(--slate-400); text-align: center; padding: 8px;">
                            No meals added to ${slot}. Tap "+ Add Meal".
                        </div>
                    ` : items.map(item => `
                        <div class="diet-meal-row">
                            <div style="flex: 1;">
                                <div style="font-weight: 800; font-size: 0.86rem; color: var(--navy-900);">${item.foodItemName}</div>
                                <div style="font-size: 0.7rem; color: var(--slate-500);">
                                    ${item.quantity}${item.unit} • ${item.calories} kcal • P: ${item.protein}g | F: ${item.fat}g | D: ${item.vitaminD || 0}µg
                                </div>
                                ${item.specialInstructions ? `<div style="font-size: 0.68rem; color: #0284c7;">↳ ${item.specialInstructions}</div>` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <button onclick="quickAdjustMealQty('${user.id}', '${item.id}', -10)" style="width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--slate-200); background:#fff; cursor:pointer;">-</button>
                                <span style="font-size: 0.76rem; font-weight: 800; min-width: 32px; text-align: center;">${item.quantity}</span>
                                <button onclick="quickAdjustMealQty('${user.id}', '${item.id}', 10)" style="width: 24px; height: 24px; border-radius: 6px; border: 1px solid var(--slate-200); background:#fff; cursor:pointer;">+</button>
                                <button onclick="removeMealFromPlan('${user.id}', '${item.id}')" style="border:none; background:#fee2e2; color:#ef4444; width: 24px; height: 24px; border-radius: 6px; margin-left: 4px; cursor:pointer;">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('')}

        <!-- Diet Actions -->
        <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn-onboarding-next" style="flex: 2; height: 46px; font-size: 0.85rem;" onclick="saveUserDietPlan('${user.id}')">
                <i class="bi bi-save2-fill"></i> Save Diet Plan
            </button>
            <button class="btn-user-action" style="flex: 1; height: 46px; font-size: 0.8rem; background: #25D366; color: #ffffff; border-color: #25D366;" onclick="shareDietWhatsApp('${user.id}')">
                <i class="bi bi-whatsapp"></i> WhatsApp
            </button>
        </div>
    `;
}

function openAddMealToSlotModal(userId, slot) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can add meals to diets.");
        return;
    }
    const sheet = document.getElementById('mobileModalSheet');
    if (!sheet) return;

    const user = db.getUser(userId);
    const foods = db.getFoods();
    const diagnoses = (user?.clinicalDiagnoses || []).join(', ') || 'No diagnoses';

    sheet.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--navy-900); margin: 0;">
                    Add Meal to ${slot}
                </h3>
                <span style="font-size: 0.72rem; color: var(--slate-500);">Patient: <strong>${user?.name}</strong> (${diagnoses})</span>
            </div>
            <button onclick="closeMobileModal()" style="border: none; background: #f1f5f9; width: 30px; height: 30px; border-radius: 50%; font-size: 0.95rem; cursor: pointer;">✕</button>
        </div>

        <div class="form-input-group">
            <label class="form-label-custom">Select Meal from Food Master:</label>
            <select id="slot_food_select" class="form-control-custom" onchange="onSlotFoodSelected(this.value)">
                ${foods.map(f => {
                    const res = db.isFoodRestrictedForUser(userId, f.id);
                    return `
                        <option value="${f.id}" style="${res.isRestricted ? 'color:#ef4444; font-weight:700;' : ''}">
                            ${res.isRestricted ? '⚠️ [RESTRICTED] ' : ''}${f.name} (${f.category} - ${f.servingQuantity}${f.standardUnit})
                        </option>
                    `;
                }).join('')}
            </select>
        </div>

        <div class="form-row-2">
            <div class="form-input-group">
                <label class="form-label-custom">Quantity (g / units):</label>
                <input type="number" id="slot_food_qty" class="form-control-custom" value="${foods[0]?.servingQuantity || 50}">
            </div>
            <div class="form-input-group">
                <label class="form-label-custom">Slot:</label>
                <input type="text" class="form-control-custom" value="${slot}" disabled>
            </div>
        </div>

        <div class="form-input-group">
            <label class="form-label-custom">Special Instructions:</label>
            <input type="text" id="slot_food_inst" class="form-control-custom" placeholder="e.g. Boiled, non-oily with black pepper" value="Boiled fresh">
        </div>

        <button class="btn-onboarding-next" style="margin-top: 8px;" onclick="confirmAddMealToSlot('${userId}', '${slot}')">
            <i class="bi bi-plus-circle-fill"></i> Add to ${slot}
        </button>
    `;

    const modal = document.getElementById('mobileModalOverlay');
    if (modal) modal.style.display = 'flex';
}

function onSlotFoodSelected(foodId) {
    const food = db.getFood(foodId);
    if (!food) return;
    const qtyInput = document.getElementById('slot_food_qty');
    if (qtyInput) qtyInput.value = food.servingQuantity || 50;
}

function confirmAddMealToSlot(userId, slot) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can add meals to diets.");
        return;
    }
    const foodId = document.getElementById('slot_food_select').value;
    const qty = parseFloat(document.getElementById('slot_food_qty').value) || 50;
    const inst = document.getElementById('slot_food_inst').value;

    // User & Diet Validation (Check user's diseases and their restricted foods)
    const restriction = db.isFoodRestrictedForUser(userId, foodId);
    if (restriction && restriction.isRestricted) {
        showMobileRestrictionWarning(restriction.foodName, restriction.diseaseName);
        return; // Do not allow that food to be added to user's diet
    }

    db.addMealToUserDiet(userId, slot, foodId, qty, inst);
    closeMobileModal();
    showToast("Meal added to diet!");
    renderAdminDietEditor(document.getElementById('mobileCardSheet'));
}

function removeMealFromPlan(userId, itemId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can delete meals from diet plans.");
        return;
    }
    db.removeMealFromUserDiet(userId, itemId);
    showToast("Item removed.");
    renderAdminDietEditor(document.getElementById('mobileCardSheet'));
}

function quickAdjustMealQty(userId, itemId, delta) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can adjust meal portions.");
        return;
    }
    const plan = db.getUserDiet(userId);
    const item = plan?.mealItems?.find(i => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(5, (item.quantity || 50) + delta);
    db.updateMealInUserDiet(userId, itemId, { quantity: newQty });
    renderAdminDietEditor(document.getElementById('mobileCardSheet'));
}

function saveUserDietPlan(userId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can save diet plans.");
        return;
    }
    const plan = db.getUserDiet(userId);
    if (plan) {
        db.savePlan(plan);
        showToast("Diet chart saved successfully!");
    }
}

function shareDietWhatsApp(userId) {
    const plan = db.getUserDiet(userId);
    const user = db.getUser(userId);
    if (!plan) return;

    const msg = DietGenerator.formatWhatsApp(plan);
    const cleanPhone = (user?.contactNumber || '').replace(/[^\d+]/g, '');
    const waUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
}

// =========================================================================
// 5. MULTIPLE USERS EXPERIENCE: USER MODE
// =========================================================================
function renderUserDietView(container) {
    const user = db.getActiveUser();
    if (!user) {
        container.innerHTML = `<div style="text-align: center; padding: 40px;">No user profile selected.</div>`;
        return;
    }

    // Patient view has no right to add users - clean prescribed badge
    setAppHeader(`My Diet: ${user.name}`, 0, `<span class="header-read-only-badge"><i class="bi bi-shield-check"></i> Prescribed</span>`, false);

    const plan = db.getUserDiet(user.id);
    const slots = ['Breakfast', 'Mid-Morning', 'Lunch', 'Evening', 'Dinner', 'Bedtime'];

    container.innerHTML = `
        <!-- User Vitals Header Card -->
        <div class="admin-card" style="background: linear-gradient(135deg, #0d2137 0%, #00c48c 100%); color: #ffffff; border: none; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-size: 0.72rem; text-transform: uppercase; color: #a7f3d0; font-weight: 700;">Clinical Prescribed Diet</div>
                    <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-main); margin-top: 2px;">${user.name}</div>
                    <div style="font-size: 0.74rem; color: #ccfbf1;">Daily Goal: ${plan?.targetCalories || 1800} kcal (${user.calorieGoalType})</div>
                </div>
                <div style="text-align: right;">
                    <span style="background: rgba(255,255,255,0.2); color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 9999px;">
                        BMI: ${ClinicalCalculator.calculateBMI(user.weightKg, user.heightCm)}
                    </span>
                    <div style="font-size: 0.68rem; color: #a7f3d0; margin-top: 4px;">Diet: ${user.primaryDietType}</div>
                </div>
            </div>

            <!-- Daily Macro Progress Bar -->
            <div class="macro-grid-4" style="margin-top: 14px; margin-bottom: 0;">
                <div class="macro-box-pill protein" style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color:#fff;">
                    <div class="macro-pill-val" style="color:#fff;">${plan.allocatedProteinGrams || 0}g</div>
                    <div class="macro-pill-lbl" style="color:#a7f3d0;">Protein</div>
                </div>
                <div class="macro-box-pill fat" style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color:#fff;">
                    <div class="macro-pill-val" style="color:#fff;">${plan.allocatedFatGrams || 0}g</div>
                    <div class="macro-pill-lbl" style="color:#fde68a;">Fat</div>
                </div>
                <div class="macro-box-pill carbs" style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color:#fff;">
                    <div class="macro-pill-val" style="color:#fff;">${plan.allocatedCarbsGrams || 0}g</div>
                    <div class="macro-pill-lbl" style="color:#bfdbfe;">Carbs</div>
                </div>
                <div class="macro-box-pill calories" style="background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); color:#fff;">
                    <div class="macro-pill-val" style="color:#fff;">${plan.totalAllocatedCalories || 0}</div>
                    <div class="macro-pill-lbl" style="color:#ddd6fe;">Calories</div>
                </div>
            </div>
        </div>

        <div class="admin-card-header">
            <div class="admin-card-title">
                <i class="bi bi-calendar-check" style="color: var(--primary-green);"></i>
                <span>Today's Meal Timeline</span>
            </div>
            <span style="font-size: 0.72rem; color: var(--slate-500);">Tap meal to inspect nutrition</span>
        </div>

        <!-- Meals Timeline -->
        <div>
            ${slots.map(slot => {
                const items = (plan.mealItems || []).filter(i => i.mealSlot.toLowerCase() === slot.toLowerCase());
                if (items.length === 0) return '';

                return `
                    <div class="diet-slot-card">
                        <div class="diet-slot-header">
                            <div class="diet-slot-title">
                                <i class="bi bi-clock"></i>
                                <span>${slot}</span>
                                <span style="font-size: 0.7rem; color: var(--slate-500);">(${items[0]?.timeSlot || '08:30 AM'})</span>
                            </div>
                            <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary-green);">
                                ${items.reduce((s, i) => s + (i.calories || 0), 0)} kcal
                            </span>
                        </div>

                        ${items.map(item => `
                            <div class="diet-meal-row" style="cursor: pointer;" onclick="openMealInspector('${item.foodItemId}')">
                                <div>
                                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--navy-900); display: flex; align-items: center; gap: 6px;">
                                        <i class="bi bi-check-circle" style="color: var(--primary-green);"></i>
                                        <span>${item.foodItemName}</span>
                                    </div>
                                    <div style="font-size: 0.72rem; color: var(--slate-500); margin-left: 22px;">
                                        Portion: ${item.quantity}${item.unit} • ${item.calories} kcal
                                    </div>
                                    <div style="font-size: 0.68rem; color: #059669; margin-left: 22px; font-weight: 700;">
                                        P: ${item.protein}g | F: ${item.fat}g | D: ${item.vitaminD || 0}µg | B12: ${item.vitaminB12 || 0}µg
                                    </div>
                                </div>
                                <span style="font-size: 0.72rem; color: var(--primary-green); font-weight: 700;">
                                    View Specs →
                                </span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderUserFoodInspector(container) {
    setAppHeader('Food & Vitamins Library', 0, '', false);

    const foods = db.getFoods();

    container.innerHTML = `
        <div class="admin-card">
            <div class="admin-card-title" style="margin-bottom: 8px;">
                <i class="bi bi-egg-fried" style="color: var(--primary-green);"></i>
                <span>Explore Meal Nutrition</span>
            </div>
            <p style="font-size: 0.76rem; color: var(--slate-500); margin-bottom: 12px;">
                Tap any meal (like Egg, Chicken, Oats, Paneer) to see its Protein, Vitamins (A, D, B12, C), and Healthy Fats.
            </p>

            <input type="text" class="form-control-custom" placeholder="Search foods (Egg, Chicken, Oats)..." 
                   oninput="filterFoodListUI(this.value)">
        </div>

        <div id="userFoodListContainer">
            ${renderFoodItemsLibrary(foods)}
        </div>
    `;
}

function filterFoodListUI(term) {
    const q = (term || '').toLowerCase();
    const filtered = db.getFoods().filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
    const container = document.getElementById('userFoodListContainer');
    if (container) {
        container.innerHTML = renderFoodItemsLibrary(filtered);
    }
}

function renderFoodItemsLibrary(foods, returnToLibrary = false) {
    return foods.map(f => {
        const nut = db.calculateMealNutrients(f, f.servingQuantity);
        const isEgg = f.name.toLowerCase().includes('egg');

        return `
            <div class="admin-card" style="padding: 12px; margin-bottom: 10px; cursor: pointer;" onclick="openMealInspector('${f.id}', ${returnToLibrary})">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <span style="font-size: 1.5rem;">${isEgg ? '🍳' : '🥗'}</span>
                        <div>
                            <div style="font-weight: 800; font-size: 0.95rem; color: var(--navy-900);">${f.name}</div>
                            <div style="font-size: 0.72rem; color: var(--slate-500);">${f.category} • Portion: ${f.servingQuantity}${f.standardUnit}</div>
                        </div>
                    </div>
                    <span style="background: #eafaf4; color: var(--primary-green); font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 9999px;">
                        ${nut.calories} kcal
                    </span>
                </div>

                <div style="display: flex; gap: 6px; margin-top: 8px; font-size: 0.72rem;">
                    <span style="background: #f0fdf4; color: #166534; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                        Protein: ${nut.protein}g
                    </span>
                    <span style="background: #fffbeb; color: #92400e; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                        Fat: ${nut.fat}g
                    </span>
                    <span style="background: #fdf2f8; color: #9d174d; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                        Vit D: ${nut.vitaminD}µg
                    </span>
                    <span style="background: #faf5ff; color: #6b21a8; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                        B12: ${nut.vitaminB12}µg
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function renderUserProfileView(container) {
    const user = db.getActiveUser();
    if (!user) return;

    setAppHeader('My Profile', 0, '', false);

    const bmi = ClinicalCalculator.calculateBMI(user.weightKg, user.heightCm);
    const bmiCat = ClinicalCalculator.getBMICategory(bmi);
    const ibw = ClinicalCalculator.calculateBrocaIBW(user.heightCm, user.gender);

    container.innerHTML = `
        <div class="admin-card" style="text-align: center; padding: 20px;">
            <div class="user-avatar-badge" style="width: 58px; height: 58px; font-size: 1.5rem; margin: 0 auto 10px auto;">
                ${user.name.charAt(0)}
            </div>
            <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--navy-900); margin: 0;">${user.name}</h2>
            <div style="font-size: 0.78rem; color: var(--slate-500); margin-top: 4px;">
                ${user.age} Years (${user.yearOfBirth || (2026 - user.age)}) • ${user.gender} • ${user.primaryDietType}
            </div>
        </div>

        <div class="admin-card">
            <div class="admin-card-title" style="margin-bottom: 10px;">
                <i class="bi bi-speedometer2 text-success"></i>
                <span>Physical Vitals & Classification</span>
            </div>
            <div class="macro-grid-4">
                <div class="macro-box-pill">
                    <div class="macro-pill-val">${user.heightCm}</div>
                    <div class="macro-pill-lbl">Height (cm)</div>
                </div>
                <div class="macro-box-pill">
                    <div class="macro-pill-val">${user.weightKg}</div>
                    <div class="macro-pill-lbl">Weight (kg)</div>
                </div>
                <div class="macro-box-pill">
                    <div class="macro-pill-val">${bmi}</div>
                    <div class="macro-pill-lbl">BMI</div>
                </div>
                <div class="macro-box-pill">
                    <div class="macro-pill-val">${ibw}kg</div>
                    <div class="macro-pill-lbl">Broca IBW</div>
                </div>
            </div>

            <div style="background: #f0fdf4; border-radius: 12px; padding: 10px; font-size: 0.76rem; color: #166534; font-weight: 700; margin-top: 8px;">
                BMI Status: ${bmiCat} (WHO Asian-Indian Standard)
            </div>
        </div>

        <div class="admin-card">
            <div class="admin-card-title" style="margin-bottom: 10px;">
                <i class="bi bi-cup-hot-fill text-success"></i>
                <span>Eating Habits & Frequency</span>
            </div>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--navy-900);">
                ${user.eatingFrequency || 'Three meals a day'}
            </div>
            <div style="font-size: 0.74rem; color: var(--slate-500); margin-top: 4px;">
                Activity Level: ${user.activityLevel || 'Lightly Active'}
            </div>
        </div>
    `;
}

// ==========================================
// UTILITY HELPERS: MODAL & TOAST
// ==========================================
function closeMobileModal(event) {
    if (event && event.target && event.target.id !== 'mobileModalOverlay') return;
    const modal = document.getElementById('mobileModalOverlay');
    if (modal) modal.style.display = 'none';
}

function showToast(msg) {
    const toast = document.getElementById('mobileToast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

// ==========================================
// 6. RESTRICTION WARNING POPUP (USER & DIET VALIDATION)
// Header: ⚠️ Food Not Allowed
// Message: <Food> is restricted for <Disease>.
// ==========================================
function showMobileRestrictionWarning(foodName, diseaseName) {
    const existing = document.getElementById('mobileRestrictionWarningOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'mobileRestrictionWarningOverlay';
    overlay.className = 'restriction-warning-overlay';
    overlay.innerHTML = `
        <div class="restriction-warning-card">
            <div class="warning-icon-box">⚠️</div>
            <div class="warning-title">Food Not Allowed</div>
            <div class="warning-food-statement">${foodName} is restricted for ${diseaseName}.</div>
            <div class="warning-footnote">
                Clinical contraindication detected for this patient's condition. This food cannot be added to their therapeutic diet plan.
            </div>
            <button class="btn-warning-dismiss" onclick="closeMobileRestrictionWarning()">
                Understood
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closeMobileRestrictionWarning() {
    const el = document.getElementById('mobileRestrictionWarningOverlay');
    if (el) el.remove();
}

// ==========================================
// 7. DISEASE MASTER — ADMIN
// Features: Add, Edit, Delete, View all, Select multiple restricted foods per disease
// Relationship: Disease -> Multiple Restricted Foods (from Item Master)
// ==========================================
let adminDiseaseSearchTerm = '';
let adminDiseaseCategoryFilter = 'All';
window._mobileModalRestrictedFoodIds = [];

function renderAdminDiseaseMaster(container) {
    setAppHeader('Disease Master', 0, '<button class="header-right-action" style="border:none;background:transparent;" onclick="openMobileDiseaseModal()"><i class="bi bi-plus-circle-fill"></i> Add</button>', true);

    const categories = ['All', 'Metabolic', 'Cardiovascular', 'Renal', 'Hepatic', 'Endocrine', 'Gastrointestinal', 'Autoimmune'];
    const allDiseases = db.getDiseases();

    const filtered = allDiseases.filter(d => {
        const matchesCat = adminDiseaseCategoryFilter === 'All' || d.category === adminDiseaseCategoryFilter;
        const matchesSearch = !adminDiseaseSearchTerm ||
            d.name.toLowerCase().includes(adminDiseaseSearchTerm.toLowerCase()) ||
            (d.dietaryGuidelines || '').toLowerCase().includes(adminDiseaseSearchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    container.innerHTML = `
        <div class="admin-card-header">
            <div class="admin-card-title">
                <i class="bi bi-shield-shaded" style="color: var(--primary-green);"></i>
                <span>Disease Master (${allDiseases.length})</span>
            </div>
            <button class="btn-user-action primary" style="padding: 5px 12px; font-size: 0.75rem;" onclick="openMobileDiseaseModal()">
                <i class="bi bi-plus-lg"></i> New Disease
            </button>
        </div>

        <p style="font-size: 0.76rem; color: var(--slate-500); margin-bottom: 12px;">
            Admin management: Add/edit diseases and assign multiple restricted foods from Food Master. Restricted foods are automatically prevented from being added to patient diets.
        </p>

        <!-- Search & Category Filters -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
            <div style="position: relative;">
                <input type="text" class="form-control-custom" placeholder="Search disease (e.g. Diabetes, BP)..." value="${adminDiseaseSearchTerm}" oninput="adminDiseaseSearchTerm = this.value; renderAdminDiseaseMaster(document.getElementById('mobileCardSheet'))" style="padding-left: 32px;" />
                <i class="bi bi-search" style="position: absolute; left: 10px; top: 12px; color: var(--slate-400); font-size: 0.85rem;"></i>
            </div>
            <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
                ${categories.map(c => `
                    <button class="portion-btn ${adminDiseaseCategoryFilter === c ? 'active' : ''}" style="white-space: nowrap; padding: 4px 10px; font-size: 0.74rem;" onclick="adminDiseaseCategoryFilter = '${c}'; renderAdminDiseaseMaster(document.getElementById('mobileCardSheet'))">
                        ${c}
                    </button>
                `).join('')}
            </div>
        </div>

        <!-- Disease Cards List -->
        <div>
            ${filtered.length === 0 ? `
                <div style="text-align: center; padding: 30px 10px; color: var(--slate-400); font-size: 0.85rem;">
                    No diseases found matching filters.
                </div>
            ` : filtered.map(d => {
                const restrictedFoods = db.getRestrictedFoodsForDisease(d.id);
                const count = restrictedFoods.length;

                return `
                    <div class="disease-card-item">
                        <div class="disease-card-header">
                            <div>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <h4 style="margin: 0; font-size: 1rem; font-weight: 800; color: var(--navy-900);">${d.name}</h4>
                                    <span style="font-size: 0.68rem; background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-weight: 700;">
                                        ${d.category}
                                    </span>
                                </div>
                                <div style="font-size: 0.74rem; color: var(--slate-500); margin-top: 2px;">
                                    ${d.description || 'Clinical diagnostic condition'}
                                </div>
                            </div>
                            <span style="background: #fee2e2; color: #991b1b; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 9999px; white-space: nowrap;">
                                ${count} Restricted
                            </span>
                        </div>

                        <!-- Dietary Guidelines -->
                        <div style="background: #f8fafc; border-left: 3px solid var(--primary-green); padding: 6px 10px; border-radius: 6px; margin: 8px 0; font-size: 0.72rem; color: var(--navy-800);">
                            <strong>Clinical Protocol:</strong> ${d.dietaryGuidelines || 'Therapeutic dietary restrictions apply.'}
                        </div>

                        <!-- Restricted Foods Badges (Disease -> Multiple Restricted Foods) -->
                        <div class="restricted-foods-tray">
                            <span style="font-size: 0.7rem; font-weight: 800; color: #991b1b; text-transform: uppercase;">
                                🚫 Restricted Foods (${count}):
                            </span>
                            ${count === 0 ? `
                                <span style="font-size: 0.72rem; color: var(--slate-400); font-style: italic;">None assigned. Tap "Edit & Assign Foods".</span>
                            ` : restrictedFoods.map(rf => `
                                <span class="restricted-chip">
                                    🚫 ${rf.name}
                                </span>
                            `).join('')}
                        </div>

                        <!-- Admin Actions -->
                        <div style="display: flex; gap: 8px; margin-top: 10px;">
                            <button class="btn-user-action primary" style="flex: 2; height: 36px; font-size: 0.76rem;" onclick="openMobileDiseaseModal('${d.id}')">
                                <i class="bi bi-pencil-square"></i> Edit & Assign Foods
                            </button>
                            <button class="btn-user-action danger" style="flex: 1; height: 36px; font-size: 0.76rem;" onclick="deleteMobileDiseaseConfirm('${d.id}')">
                                <i class="bi bi-trash-fill"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function openMobileDiseaseModal(diseaseId = null) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can manage diseases.");
        return;
    }
    const d = diseaseId ? db.getDisease(diseaseId) : {
        id: 'd-' + Date.now(),
        name: '',
        category: 'Metabolic',
        description: '',
        dietaryGuidelines: '',
        restrictedFoodIds: []
    };

    window._mobileModalRestrictedFoodIds = [...(d.restrictedFoodIds || [])];

    const sheet = document.getElementById('mobileModalSheet');
    if (!sheet) return;

    sheet.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--navy-900); margin: 0;">
                    ${diseaseId ? 'Edit Clinical Disease' : 'Add New Disease'}
                </h3>
                <span style="font-size: 0.72rem; color: var(--slate-500);">Disease Master • Food Restrictions</span>
            </div>
            <button onclick="closeMobileModal()" style="border: none; background: #f1f5f9; width: 30px; height: 30px; border-radius: 50%; font-size: 0.95rem; cursor: pointer;">✕</button>
        </div>

        <div class="form-input-group">
            <label class="form-label-custom">Disease / Condition Name *:</label>
            <input type="text" id="mob_disease_name" class="form-control-custom" placeholder="e.g. Diabetes / Sugar" value="${d.name}" />
        </div>

        <div class="form-row-2">
            <div class="form-input-group">
                <label class="form-label-custom">Category:</label>
                <select id="mob_disease_category" class="form-control-custom">
                    ${['Metabolic', 'Cardiovascular', 'Renal', 'Hepatic', 'Endocrine', 'Gastrointestinal', 'Autoimmune'].map(c => `
                        <option value="${c}" ${d.category === c ? 'selected' : ''}>${c}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-input-group">
                <label class="form-label-custom">Restricted Count:</label>
                <input type="text" id="mob_restricted_count" class="form-control-custom" value="${window._mobileModalRestrictedFoodIds.length} Foods" disabled />
            </div>
        </div>

        <div class="form-input-group">
            <label class="form-label-custom">Pathophysiological Description:</label>
            <textarea id="mob_disease_desc" class="form-control-custom" rows="2" placeholder="e.g. Impaired insulin secretion and glucose tolerance...">${d.description || ''}</textarea>
        </div>

        <div class="form-input-group">
            <label class="form-label-custom">Dietary Guidelines:</label>
            <textarea id="mob_disease_guide" class="form-control-custom" rows="2" placeholder="e.g. Strict restriction of simple sugars, sweets, cold drinks...">${d.dietaryGuidelines || ''}</textarea>
        </div>

        <!-- RESTRICTED FOODS SELECTION FROM FOOD MASTER -->
        <div style="border-top: 1px solid var(--slate-200); padding-top: 10px; margin-top: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label-custom" style="color: #991b1b; font-weight: 800; margin: 0;">
                    Select Restricted Foods from Food Master:
                </label>
                <span id="mob_selected_badge" style="font-size: 0.7rem; background: #fee2e2; color: #991b1b; font-weight: 800; padding: 1px 7px; border-radius: 9999px;">
                    ${window._mobileModalRestrictedFoodIds.length} Selected
                </span>
            </div>

            <!-- Selected Chips Tray -->
            <div id="mobSelectedFoodsTray" style="background: #fff8f8; border: 1px dashed #fca5a5; border-radius: 8px; padding: 6px 8px; min-height: 38px; display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; align-items: center;">
                <!-- Populated dynamically -->
            </div>

            <!-- Live Search Food Master -->
            <div style="position: relative; margin-bottom: 8px;">
                <input type="text" id="mobFoodSearchInput" class="form-control-custom" placeholder="Search foods (e.g. Sugar, Sweets, Cake, Cold Drink)..." oninput="renderMobileModalFoodPicker(this.value)" />
            </div>

            <!-- Multi-Select Food Grid -->
            <div id="mobFoodPickerGrid" class="food-picker-grid" style="max-height: 180px; overflow-y: auto;">
                <!-- Populated dynamically -->
            </div>
        </div>

        <button class="btn-onboarding-next" style="margin-top: 12px; height: 46px; font-size: 0.9rem;" onclick="saveMobileDiseaseRecord('${d.id}')">
            <i class="bi bi-check-circle-fill"></i> Save Disease & Restrictions
        </button>
    `;

    renderMobileModalSelectedTray();
    renderMobileModalFoodPicker('');

    const modal = document.getElementById('mobileModalOverlay');
    if (modal) modal.style.display = 'flex';
}

function renderMobileModalSelectedTray() {
    const tray = document.getElementById('mobSelectedFoodsTray');
    const badge = document.getElementById('mob_selected_badge');
    const countInput = document.getElementById('mob_restricted_count');
    if (!tray) return;

    const ids = window._mobileModalRestrictedFoodIds || [];
    if (badge) badge.innerText = `${ids.length} Selected`;
    if (countInput) countInput.value = `${ids.length} Foods`;

    if (ids.length === 0) {
        tray.innerHTML = `<span style="font-size: 0.72rem; color: #94a3b8; font-style: italic;">Tap foods below to add restriction.</span>`;
        return;
    }

    tray.innerHTML = ids.map(id => {
        const food = db.getFood(id);
        const name = food ? food.name : id;
        return `
            <span class="restricted-chip">
                🚫 ${name}
                <button type="button" onclick="removeMobileModalRestrictedFood('${id}')" style="border:none;background:transparent;color:#991b1b;font-size:0.8rem;cursor:pointer;padding:0 2px;">✕</button>
            </span>
        `;
    }).join('');
}

function renderMobileModalFoodPicker(searchTerm = '') {
    const grid = document.getElementById('mobFoodPickerGrid');
    if (!grid) return;

    const term = (searchTerm || '').toLowerCase().trim();
    const allFoods = db.getFoods();
    const filtered = allFoods.filter(f => !term || f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term));

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--slate-400); font-size: 0.75rem; padding: 8px;">No foods found for "${searchTerm}".</div>`;
        return;
    }

    const selectedIds = window._mobileModalRestrictedFoodIds || [];

    grid.innerHTML = filtered.map(f => {
        const isSelected = selectedIds.includes(f.id);
        return `
            <div class="food-picker-item ${isSelected ? 'selected' : ''}" onclick="toggleMobileModalRestrictedFood('${f.id}')">
                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <div class="food-picker-name" style="color: ${isSelected ? '#b91c1c' : 'var(--navy-900)'};">${f.name}</div>
                    <div class="food-picker-meta">${f.category} • ${f.dietCategory}</div>
                </div>
                <div style="width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid ${isSelected ? '#ef4444' : '#cbd5e1'}; background: ${isSelected ? '#ef4444' : '#ffffff'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; margin-left: 4px;">
                    ${isSelected ? '✓' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function toggleMobileModalRestrictedFood(foodId) {
    if (!window._mobileModalRestrictedFoodIds) window._mobileModalRestrictedFoodIds = [];
    const idx = window._mobileModalRestrictedFoodIds.indexOf(foodId);
    if (idx >= 0) {
        window._mobileModalRestrictedFoodIds.splice(idx, 1);
    } else {
        window._mobileModalRestrictedFoodIds.push(foodId);
    }
    renderMobileModalSelectedTray();
    const searchVal = document.getElementById('mobFoodSearchInput')?.value || '';
    renderMobileModalFoodPicker(searchVal);
}

function removeMobileModalRestrictedFood(foodId) {
    if (!window._mobileModalRestrictedFoodIds) return;
    const idx = window._mobileModalRestrictedFoodIds.indexOf(foodId);
    if (idx >= 0) {
        window._mobileModalRestrictedFoodIds.splice(idx, 1);
        renderMobileModalSelectedTray();
        const searchVal = document.getElementById('mobFoodSearchInput')?.value || '';
        renderMobileModalFoodPicker(searchVal);
    }
}

function saveMobileDiseaseRecord(id) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can save disease records.");
        return;
    }
    const name = document.getElementById('mob_disease_name').value.trim();
    const category = document.getElementById('mob_disease_category').value;
    const desc = document.getElementById('mob_disease_desc').value.trim();
    const guide = document.getElementById('mob_disease_guide').value.trim();

    if (!name) {
        alert("Please enter Disease Name.");
        return;
    }

    const restrictedFoodIds = window._mobileModalRestrictedFoodIds || [];

    db.saveDisease({
        id,
        name,
        category,
        description: desc,
        dietaryGuidelines: guide,
        restrictedNutrients: [],
        restrictedFoodIds: restrictedFoodIds
    });

    closeMobileModal();
    showToast(`Saved disease "${name}" with ${restrictedFoodIds.length} restricted foods.`);
    renderAdminDiseaseMaster(document.getElementById('mobileCardSheet'));
}

function deleteMobileDiseaseConfirm(diseaseId) {
    if (currentRole !== 'admin') {
        showToast("⚠️ Permission Denied: Only Admin can delete diseases.");
        return;
    }
    const d = db.getDisease(diseaseId);
    if (!d) return;

    if (confirm(`Are you sure you want to delete disease "${d.name}" and remove its restrictions?`)) {
        db.deleteDisease(diseaseId);
        showToast(`Disease "${d.name}" deleted.`);
        renderAdminDiseaseMaster(document.getElementById('mobileCardSheet'));
    }
}
