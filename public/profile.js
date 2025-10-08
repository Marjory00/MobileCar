// public/profile.js - Logic for User Profile, History, and Data Management

// --- UI Element Selectors ---
const UI_PROFILE = {
    profileModal: document.getElementById('user-profile-view'), // FIX 1: Use the user-profile-view container ID, not 'profile-modal'
    closeButton: document.getElementById('close-profile-btn'), // FIX 1: Updated to a common 'close' button ID for the profile view

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
    
    // FIX 2: Add selector for the "Edit Profile" button/link that toggles the edit state
    editProfileToggle: document.getElementById('edit-profile-toggle'), 
    profileInfoContainer: document.getElementById('profile-info-display'), // Container for read-only data
    profileEditContainer: document.getElementById('profile-edit-form'), // Container for edit form
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
    
    // FIX: Clone the MOCK_USER_DATA to prevent direct modification of the constant default object
    const data = JSON.parse(JSON.stringify(MOCK_USER_DATA));

    if (savedName) data.name = savedName;
    if (savedEmail) data.email = savedEmail;

    return data;
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
        <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center mb-2">
            <div>
                <p class="font-semibold text-gray-900 dark:text-white">${v.year} ${v.make} ${v.model}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">License: ${v.license}</p>
            </div>
            <button class="text-indigo-500 hover:text-indigo-700 text-sm" onclick="alert('Simulated: Opening vehicle edit form for ${v.make} ${v.model}')">Edit</button>
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
                <button class="text-xs text-indigo-500 hover:text-indigo-700 mt-1 view-receipt-btn" data-id="${h.id}">View Receipt</button>
            </div>
        </li>
    `).join('');
    
    // Attach listener for receipt buttons
    UI_PROFILE.historyList.querySelectorAll('.view-receipt-btn').forEach(btn => { // FIX 3: Use a specific class for better targeting
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
    // FIX 4: Add mandatory null checks for input fields before accessing 'value'
    if (!UI_PROFILE.editNameInput || !UI_PROFILE.editEmailInput) {
        console.error("Edit form inputs are missing from the DOM.");
        return;
    }
    
    const newName = UI_PROFILE.editNameInput.value.trim();
    const newEmail = UI_PROFILE.editEmailInput.value.trim();

    if (!newName || !newEmail) {
        alert("Name and Email cannot be empty.");
        return;
    }
    
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Update mock data and persist to localStorage
    MOCK_USER_DATA.name = newName;
    MOCK_USER_DATA.email = newEmail;
    localStorage.setItem('user_name', newName);
    localStorage.setItem('user_email', newEmail);

    // Re-render the display section with new data
    renderProfileInfo(MOCK_USER_DATA);
    
    // FIX 5: Switch back to read-only view after saving
    toggleEditMode(false); 
    
    alert("Profile details updated successfully!");
    console.log("[Profile] Profile saved.");
}

/**
 * Toggles between the read-only profile view and the edit form.
 * @param {boolean} [isEditing] - Explicitly set the state (true for edit, false for read-only).
 */
function toggleEditMode(isEditing) {
    if (!UI_PROFILE.profileInfoContainer || !UI_PROFILE.profileEditContainer) return;

    const currentlyEditing = isEditing !== undefined ? isEditing : UI_PROFILE.profileInfoContainer.classList.contains('hidden');
    
    if (currentlyEditing) {
        // Switch to read-only
        UI_PROFILE.profileInfoContainer.classList.remove('hidden');
        UI_PROFILE.profileEditContainer.classList.add('hidden');
        if (UI_PROFILE.editProfileToggle) UI_PROFILE.editProfileToggle.textContent = 'Edit Profile';
    } else {
        // Switch to edit form
        UI_PROFILE.profileInfoContainer.classList.add('hidden');
        UI_PROFILE.profileEditContainer.classList.remove('hidden');
        if (UI_PROFILE.editProfileToggle) UI_PROFILE.editProfileToggle.textContent = 'Cancel Edit';
    }
}


// --- EXPORTED FUNCTIONS ---

/**
 * Opens the profile view and updates all content. This function is called from index.js.
 */
export function openProfileView() {
    const data = loadUserProfileData();
    renderProfileInfo(data);
    renderVehicles(data.vehicles);
    renderHistory(data.history);
    
    // Ensure read-only mode is active when the view is opened
    toggleEditMode(false); 
    
    // FIX 1: The UI is now handled by index.js's ShowProfile/HideAllViews functions.
    // The profile view is already visible if this is called after ShowProfile('user-profile-view').
    console.log("[Profile] Data refreshed for user profile view.");
}

/**
 * Attaches all event listeners for the profile view.
 */
export function setupProfileListeners() {
    // 1. Profile Edit Toggle Listener
    UI_PROFILE.editProfileToggle?.addEventListener('click', () => toggleEditMode());

    // 2. Save Profile button listener
    UI_PROFILE.saveProfileBtn?.addEventListener('click', saveProfileChanges);
    
    // FIX 6: Removed the unnecessary close button listener, as closing is handled by the globally exposed HideAllViews function in index.js
    // FIX 6: Removed the document.getElementById('open-profile-btn') listener, as opening is handled by the globally exposed ShowProfile function in index.js
}