// public/index.js - Core Initialization and Event Setup

import { 
    handleServiceRequest, 
    initializeTheme, 
    toggleTheme, 
    resetCustomerApp, 
    cancelRequest,
    ShowProfile, // FIX: Import ShowProfile/HideAllViews if they are intended to be modular. 
    HideAllViews  // However, I will keep them defined locally and attached to window for direct HTML calls.
} from './app.js';

// --- UI Element Selectors ---
const UI = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),

    // App Containers
    customerApp: document.getElementById('customer-app'),
    userProfileView: document.getElementById('user-profile-view'),
    driverProfileView: document.getElementById('driver-profile-view'),
    
    // FIX 1: Correctly select the bottom-fixed element, which is the tracking-container, or the entire main-content div
    // The previous selector `document.querySelector('.fixed.bottom-0')` likely returned null or an incorrect element.
    // In the HTML, the main content is within a flex column, and the 'REQUEST ASSISTANCE' button is *inside* the service-selection-grid, not fixed to the bottom.
    // The tracking container *is* at the bottom. We'll use the main service sections instead.
    requestFormContainer: document.getElementById('request-form-container'),
    serviceSelectionGrid: document.getElementById('service-selection-grid'),
    trackingContainer: document.getElementById('tracking-container'),
    
    // Request/Cancel
    serviceCards: document.querySelectorAll('.service-icon-card'),
    submitButton: document.getElementById('request-assistance-btn'),
    cancelButton: document.getElementById('cancel-request'),
    
    // Request Details
    locationDisplay: document.getElementById('location-display'),
    
    // Modals
    detailsModal: document.getElementById('details-modal'),
    closeDetailsModal: document.getElementById('close-details-modal'),
    confirmDetailsBtn: document.getElementById('confirm-details-btn'), // FIX 2: Added missing selector for the confirm button
};

// --- GLOBAL EXPOSED FUNCTIONS (REQUIRED FOR INLINE HTML ONCLICK) ---

/**
 * Hides all profile views and shows the main Customer App.
 */
function HideAllViews() {
    // Hide all profile views
    if (UI.userProfileView) UI.userProfileView.classList.add('hidden');
    if (UI.driverProfileView) UI.driverProfileView.classList.add('hidden');

    // Show the customer app
    if (UI.customerApp) UI.customerApp.classList.remove('hidden');
}

/**
 * Hides the main customer app and shows the specified profile view.
 * @param {string} profileId - The ID of the profile view to show ('user-profile-view' or 'driver-profile-view').
 */
function ShowProfile(profileId) {
    // Hide the customer app
    if (UI.customerApp) UI.customerApp.classList.add('hidden');

    // Hide all profile views first
    if (UI.userProfileView) UI.userProfileView.classList.add('hidden');
    if (UI.driverProfileView) UI.driverProfileView.classList.add('hidden');

    // Show the requested profile view, with null check
    const view = document.getElementById(profileId);
    if (view) view.classList.remove('hidden');
}

// Attach to the window so they can be called from inline HTML (onclick)
window.ShowProfile = ShowProfile;
window.HideAllViews = HideAllViews;


// --- EVENT LISTENERS ---


/**
 * Initializes all event listeners for the customer app.
 */
function setupEventListeners() {
    // 1. THEME TOGGLE
    if (UI.themeToggle) {
        UI.themeToggle.addEventListener('click', toggleTheme);
    }

    // 2. SERVICE SELECTION
    let selectedService = null;
    UI.serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selection border from all cards
            UI.serviceCards.forEach(c => c.classList.remove('border-2', 'border-indigo-500', 'ring-2', 'ring-indigo-500'));
            // Add selection border to the clicked card
            this.classList.add('border-2', 'border-indigo-500', 'ring-2', 'ring-indigo-500');
            selectedService = this.getAttribute('data-service');
        });
    });

    // 3. SERVICE SUBMISSION (Initial Request Button)
    if (UI.submitButton) {
        UI.submitButton.addEventListener('click', () => {
            if (selectedService) {
                // Show the details modal before calling handleServiceRequest
                UI.detailsModal.classList.remove('hidden');
            } else {
                alert('Please tap one of the service icons before requesting assistance.');
            }
        });
    }

    // FIX 3: Add event listener for the confirmation button inside the modal
    if (UI.confirmDetailsBtn) {
        UI.confirmDetailsBtn.addEventListener('click', () => {
            // 1. Close the modal
            UI.detailsModal.classList.add('hidden');
            
            // 2. Extract details (simplified)
            const location = UI.locationDisplay.textContent.replace('Simulated Location: ', '').trim();
            
            // 3. Call the core function to process the request
            // This function should handle the UI switch from form to tracking in app.js
            handleServiceRequest(selectedService, location); 
        });
    }

    // 4. CANCEL REQUEST
    if (UI.cancelButton) {
        UI.cancelButton.addEventListener('click', cancelRequest);
    }

    // 5. DETAILS MODAL CLOSE
    if (UI.closeDetailsModal) {
        // Hides the modal without triggering the request
        UI.closeDetailsModal.addEventListener('click', () => {
            UI.detailsModal.classList.add('hidden');
        });
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the Dark/Light Theme
    initializeTheme(); 

    // 2. Set up all primary listeners
    setupEventListeners();
    
    // 3. Listen for reset event (called after cancel or job complete)
    document.addEventListener('resetApp', resetCustomerApp);
});