// public/profile.js - Logic for User Profile, History, and Data Management

// --- UI Element Selectors ---
const UI_PROFILE = {
    profileModal: document.getElementById('profile-modal'),
    closeButton: document.getElementById('close-profile-modal'),

    // Profile Info
    userName: document.getElementById('profile-user-name'),
    userEmail: document.getElementById('profile-user-email'),
    membershipStatus: document.getElementById('profile-membership-status'),
    
    // Vehicle List
    savedVehiclesContainer: document.getElementById('saved-vehicles-list'),
    
    // History
    historyList: document.getElementById('service-history-list'),
    
    // Mock Edit Form elements
    editNameInput: document.getElementById('edit-name-input'),
    editEmailInput: document.getElementById('edit-email-input'),
    saveProfileBtn: document.getElementById('save-profile-btn'),
};

// --- SIMULATED USER DATA ---
const MOCK_USER_DATA = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    membership: 'Premium (Full Coverage)',
    vehicles: [
        { id: 1, make: 'Tesla', model: 'Model 3', year: 2022, license: 'EASYPASS' },
        { id: 2, make: 'Ford', model: 'F-150', year: 2018, license: 'TRUCKIT' },
    ],
    history: [
        { id: 101, date: '2025-08-15', service: 'Tire Change', cost: 25.00, provider: 'Sarah J.' },
        { id: 102, date: '2025-03-20', service: 'Fuel Delivery', cost: 75.00, provider: 'Mike L.' },
    ]
};

// --- CORE PROFILE FUNCTIONS ---

/**
 * Loads mock user data, prioritizing any saved data in localStorage.
 * @returns {object} The user's combined profile data.
 */
function loadUserProfileData() {
    const savedName = localStorage.getItem('user_name');
    const savedEmail = localStorage.getItem('user_email');
    
    if (savedName) MOCK_USER_DATA.name = savedName;
    if (savedEmail) MOCK_USER_DATA.email = savedEmail;

    return MOCK_USER_DATA;
}

/**
 * Renders the user profile section.
 */
function renderProfileInfo(data) {
    if (UI_PROFILE.userName) UI_PROFILE.userName.textContent = data.name;
    if (UI_PROFILE.userEmail) UI_PROFILE.userEmail.textContent = data.email;
    if (UI_PROFILE.membershipStatus) UI_PROFILE.membershipStatus.textContent = data.membership;
    
    // Pre-fill edit form
    if (UI_PROFILE.editNameInput) UI_PROFILE.editNameInput.value = data.name;
    if (UI_PROFILE.editEmailInput) UI_PROFILE.editEmailInput.value = data.email;
}

/**
 * Renders the list of saved vehicles.
 */
function renderVehicles(vehicles) {
    if (!UI_PROFILE.savedVehiclesContainer) return;
    UI_PROFILE.savedVehiclesContainer.innerHTML = vehicles.map(v => `
        <div class="p-3 bg-gray-100 dark:bg-gray-600 rounded-lg flex justify-between items-center mb-2">
            <div>
                <p class="font-semibold text-gray-900 dark:text-white">${v.year} ${v.make} ${v.model}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">License: ${v.license}</p>
            </div>
            <button class="text-indigo-500 hover:text-indigo-700 text-sm">Edit</button>
        </div>
    `).join('');
}

/**
 * Renders the service history list.
 */
function renderHistory(history) {
    if (!UI_PROFILE.historyList) return;
    UI_PROFILE.historyList.innerHTML = history.map(h => `
        <li class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
                <p class="font-medium text-gray-900 dark:text-white">${h.service} Service</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${h.date} - Provider: ${h.provider}</p>
            </div>
            <div class="text-right">
                <p class="font-bold ${h.cost > 25 ? 'text-red-500' : 'text-green-500'}">$${h.cost.toFixed(2)}</p>
                <button class="text-xs text-indigo-500 hover:text-indigo-700 mt-1" data-id="${h.id}">View Receipt</button>
            </div>
        </li>
    `).join('');
    
    // Attach listener for receipt buttons
    UI_PROFILE.historyList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const historyId = e.target.dataset.id;
            alert(`[Receipt] Displaying detailed receipt for transaction ID ${historyId}.`);
        });
    });
}

/**
 * Saves profile changes from the edit form.
 */
function saveProfileChanges() {
    const newName = UI_PROFILE.editNameInput.value.trim();
    const newEmail = UI_PROFILE.editEmailInput.value.trim();

    if (!newName || !newEmail) {
        alert("Name and Email cannot be empty.");
        return;
    }

    // Update mock data and persist to localStorage
    MOCK_USER_DATA.name = newName;
    MOCK_USER_DATA.email = newEmail;
    localStorage.setItem('user_name', newName);
    localStorage.setItem('user_email', newEmail);

    renderProfileInfo(MOCK_USER_DATA);
    alert("Profile details updated successfully!");
    console.log("[Profile] Profile saved.");
}

/**
 * Opens the profile modal and updates all content.
 */
export function openProfileModal() {
    const data = loadUserProfileData();
    renderProfileInfo(data);
    renderVehicles(data.vehicles);
    renderHistory(data.history);
    
    UI_PROFILE.profileModal?.classList.remove('hidden');
    console.log("[Profile] Modal opened and data refreshed.");
}

/**
 * Attaches all event listeners for the profile modal.
 */
export function setupProfileListeners() {
    // Open Profile Modal listener (assumes a button with ID 'open-profile-btn' exists in index.html)
    document.getElementById('open-profile-btn')?.addEventListener('click', openProfileModal);

    // Close Modal listener
    UI_PROFILE.closeButton?.addEventListener('click', () => {
        UI_PROFILE.profileModal?.classList.add('hidden');
    });

    // Save Profile button listener
    UI_PROFILE.saveProfileBtn?.addEventListener('click', saveProfileChanges);
}