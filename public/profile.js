// public/profile.js - Logic for User Profile, History, and Data Management

// --- UI Element Selectors ---
const UI_PROFILE = {
    profileModal: document.getElementById('user-profile-view'),
    closeButton: document.getElementById('close-profile-btn'),

    // Profile Info Display & Edit Containers (Crucial for Edit Toggle)
    profileInfoContainer: document.getElementById('profile-info-display'), 
    profileEditContainer: document.getElementById('profile-edit-form'), 
    editProfileToggle: document.getElementById('edit-profile-toggle'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'), 
    
    // Profile Info Elements
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

function loadUserProfileData() {
    // Clone and load local data
    const data = JSON.parse(JSON.stringify(MOCK_USER_DATA));
    const savedName = localStorage.getItem('user_name');
    const savedEmail = localStorage.getItem('user_email');
    
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
    
    // Pre-fill edit form (Only done on rendering read-only data)
    if (UI_PROFILE.editNameInput) UI_PROFILE.editNameInput.value = data.name;
    if (UI_PROFILE.editEmailInput) UI_PROFILE.editEmailInput.value = data.email;
}

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
    UI_PROFILE.historyList.querySelectorAll('.view-receipt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const historyId = e.target.dataset.id;
            alert(`[Receipt] Displaying detailed receipt for transaction ID ${historyId}.`);
        });
    });
}

/**
 * Toggles between the read-only profile view and the edit form.
 * @param {boolean} [showInfoView] - Explicitly set the view state (true for read-only/info, false for edit form).
 */
function toggleEditMode(showInfoView) {
    const info = UI_PROFILE.profileInfoContainer;
    const edit = UI_PROFILE.profileEditContainer;
    const toggleBtn = UI_PROFILE.editProfileToggle;
    
    if (!info || !edit || !toggleBtn) {
        console.error("Profile view containers or toggle button are missing.");
        return;
    }

    // Determine the target state. If showInfoView is undefined, we toggle the current state.
    const shouldShowInfo = showInfoView === undefined ? info.classList.contains('hidden') : showInfoView;

    if (shouldShowInfo) {
        // ACTION: Show Read-Only/Info View
        info.classList.remove('hidden');
        edit.classList.add('hidden');
        toggleBtn.textContent = 'Edit Profile';
    } else {
        // ACTION: Show Edit Form View
        info.classList.add('hidden');
        edit.classList.remove('hidden');
        toggleBtn.textContent = 'Cancel Edit';
        
        // Ensure inputs are pre-filled with current data when entering edit mode
        const data = loadUserProfileData();
        if (UI_PROFILE.editNameInput) UI_PROFILE.editNameInput.value = data.name;
        if (UI_PROFILE.editEmailInput) UI_PROFILE.editEmailInput.value = data.email;
    }
    console.log(`[Profile] Switched to ${shouldShowInfo ? 'Read-Only' : 'Edit'} mode.`);
}

/**
 * Saves profile changes from the edit form.
 */
function saveProfileChanges() {
    // Robust checks
    if (!UI_PROFILE.editNameInput || !UI_PROFILE.editEmailInput) {
        alert("Error: Profile edit form is not fully loaded.");
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
    
    // Switch back to read-only view after saving
    toggleEditMode(true); // Explicitly set to read-only view
    
    alert("Profile details updated successfully! 🎉");
    console.log("[Profile] Profile saved and updated.");
}

// --- EXPORTED FUNCTIONS ---

/**
 * Opens the profile view and updates all content. This function is called via a CustomEvent from index.js.
 */
export function openProfileView() {
    const data = loadUserProfileData();
    renderProfileInfo(data);
    renderVehicles(data.vehicles);
    renderHistory(data.history);
    
    // Ensure the read-only mode is active when the view is opened
    toggleEditMode(true); 
    
    console.log("[Profile] Data refreshed for user profile view.");
}

/**
 * Attaches all event listeners for the profile view.
 */
export function setupProfileListeners() {
    // 1. Profile Edit Toggle Listener (Toggles between read-only and edit form)
    UI_PROFILE.editProfileToggle?.addEventListener('click', () => {
        // If the current text is 'Edit Profile', we are in the info view and need to switch to edit (false)
        const isCurrentlyInfoView = UI_PROFILE.editProfileToggle.textContent.includes('Edit Profile');
        toggleEditMode(!isCurrentlyInfoView);
    });

    // 2. Save Profile button listener
    UI_PROFILE.saveProfileBtn?.addEventListener('click', saveProfileChanges);
    
    // 3. Cancel Edit button listener (Handles the button inside the form)
    UI_PROFILE.cancelEditBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleEditMode(true); // Explicitly switch back to read-only view
    });

    // 4. Listen for the custom event dispatched when the profile is opened from the header button
    document.addEventListener('openProfileView', openProfileView);
    
    console.log("[Profile] Listeners set up.");
}

export { setupProfileListeners as initProfile };