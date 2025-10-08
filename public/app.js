// public/app.js - Core Application Logic (Customer View)

// --- State Management ---
let currentRequestId = null;
let statusPollingInterval = null;
let selectedService = null; // FIX: Add state for the service selected in index.js/request
const POLLING_RATE_MS = 5000; // Poll every 5 seconds
let simulatedEta = 15;
const SIMULATED_ETA_DECREMENT = 3; 
let lastStatusUpdate = Date.now(); 

// --- UI Element Selectors ---
const UI = {
    // Main containers
    customerApp: document.getElementById('customer-app'),
    driverApp: document.getElementById('driver-app'),
    
    // Request form elements
    requestForm: document.getElementById('request-form-container'),
    submitButton: document.getElementById('request-assistance-btn'),
    serviceSelectionGrid: document.getElementById('service-selection-grid'),
    
    // Tracking elements (Real-Time Tracking components)
    trackingContainer: document.getElementById('tracking-container'),
    providerNameDisplay: document.getElementById('provider-name-display'),
    etaDisplay: document.getElementById('eta-display'),
    statusText: document.getElementById('status-text'),
    providerPhoto: document.getElementById('provider-photo'), 
    mapContainer: document.getElementById('map-simulation-container'), 

    // Communication Elements
    chatButton: document.getElementById('chat-with-provider-btn'),
    callButton: document.getElementById('call-provider-btn'),
    cancelButton: document.getElementById('cancel-request-btn'), // FIX: Add the cancel button selector
    
    // Global components
    themeToggle: document.getElementById('theme-toggle'),
    mainContent: document.getElementById('main-content') 
};

// --- SYNCHRONIZATION SETUP ---

/**
 * Sets up listeners for custom events dispatched by other modules (like driver.js) 
 * to instantly update the customer's tracking status.
 */
function setupSyncListeners() {
    // FIX: Remove duplicate listeners by first removing them
    document.removeEventListener('driverStatusChange', handleDriverStatusChange);
    document.removeEventListener('resetApp', resetCustomerApp);
    document.removeEventListener('serviceCompleted', handleServiceCompleted);
    
    // Add the listeners
    document.addEventListener('driverStatusChange', handleDriverStatusChange);
    document.addEventListener('resetApp', resetCustomerApp);
    document.addEventListener('serviceCompleted', handleServiceCompleted);

    // FIX: Attach the cancel button listener once
    if (UI.cancelButton && !UI.cancelButton.hasAttribute('data-listener-attached')) {
        UI.cancelButton.addEventListener('click', cancelRequest);
        UI.cancelButton.setAttribute('data-listener-attached', 'true');
    }
}

/**
 * Event handler for 'driverStatusChange' custom event.
 */
function handleDriverStatusChange(e) {
    const { status: newStatus, providerName } = e.detail;
    console.log(`[App] Received direct status update from driver: ${newStatus}`);
    
    // Stop the polling temporarily to accept the driver's update immediately
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
    lastStatusUpdate = Date.now(); 
    
    // Manually update simulatedEta based on driver status for consistent display
    if (newStatus === 'Arrived' || newStatus === 'Completed' || newStatus === 'Canceled') {
        simulatedEta = 0;
    } else if (newStatus === 'En Route') {
        // Reset ETA to a fresh countdown value when they start driving
        simulatedEta = 15; 
    }

    // Apply the update to the UI
    updateTrackingUI({
        providerName: providerName || UI.providerNameDisplay?.textContent,
        status: newStatus,
        eta: simulatedEta,
        // Photo URL is preserved
        providerPhotoUrl: UI.providerPhoto?.src
    });

    // Restart polling or handle terminal states
    if (newStatus === 'Completed' || newStatus === 'Canceled') {
         // Driver module will usually trigger a 'serviceCompleted' or 'resetApp' next
         // No need to restart polling
         console.log(`[App] Service is in terminal state: ${newStatus}. Polling stopped.`);
         // The payment modal should be handled via the 'serviceCompleted' event
    } else {
        // Only restart polling if not in a terminal state
        startStatusPolling();
    }
}

/**
 * FIX: New handler for the service completed state to show the Payment Modal.
 */
function handleServiceCompleted(e) {
    console.log(`[App] Service Request ${e.detail.requestId} complete. Showing payment modal.`);
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.classList.remove('hidden');
    }
    // Optionally: Dispatch event to driver to show completed UI
}


// --- CORE FUNCTIONS ---

// ... (startChatSimulation and startCallSimulation remain unchanged) ...

/**
 * Initiates an in-app chat simulation.
 */
function startChatSimulation() {
    const provider = UI.providerNameDisplay?.textContent || 'Your Provider';
    alert(`[SIMULATED CHAT] Opening chat window with ${provider}. You can now send messages.`);
    console.log(`[Communication] Chat initiated with ${provider}.`);
}

/**
 * Initiates an in-app call simulation.
 */
function startCallSimulation() {
    const provider = UI.providerNameDisplay?.textContent || 'Your Provider';
    alert(`[SIMULATED CALL] Calling ${provider}. (Real world: This would connect via VoIP/Twilio.)`);
    console.log(`[Communication] Call initiated with ${provider}.`);
}


/**
 * Attaches communication listeners once a provider is assigned.
 */
function setupCommunicationListeners() {
    // FIX: Use a single helper to prevent redundant listeners
    const attachListener = (element, handler) => {
        if (element && !element.hasAttribute('data-listener-attached')) {
            element.addEventListener('click', handler);
            element.setAttribute('data-listener-attached', 'true');
        }
    };
    attachListener(UI.chatButton, startChatSimulation);
    attachListener(UI.callButton, startCallSimulation);
}


/**
 * Handles the initial service request submission.
 * @param {string} serviceType - The type of assistance requested.
 * @param {string} location - The user's current location (simulated).
 */
export async function handleServiceRequest(serviceType, location) {
    if (!serviceType || !location) {
        alert('Please select a service type and ensure your location is set.');
        return;
    }
    selectedService = serviceType; // FIX: Store the selected service type

    if (UI.submitButton) {
        UI.submitButton.disabled = true;
        // FIX: Add utility class to visually show the disabled state
        UI.submitButton.classList.add('opacity-50', 'cursor-not-allowed');
        UI.submitButton.textContent = 'Searching for Provider...';
    }
    
    // HIDE THE SERVICE SELECTION GRID AND THE REQUEST FORM CONTAINER
    if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.add('hidden');
    if (UI.requestForm) UI.requestForm.classList.add('hidden'); 

    try {
        // SIMULATED API CALL to /api/request (1 second delay)
        const data = await new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    requestId: 'REQ-' + Date.now(),
                    providerName: 'Sarah J. 🛠️', 
                    providerPhotoUrl: 'https://via.placeholder.com/150/500E9C/FFFFFF?text=SJ', 
                    eta: 15,
                    status: 'Assigned',
                    // Location data for map simulation
                    currentLat: 39.18, 
                    currentLon: -77.20 
                });
            }, 1000);
        });

        if (data.success) {
            currentRequestId = data.requestId;
            
            // Initial ETA setup
            simulatedEta = data.eta; 
            lastStatusUpdate = Date.now();
            
            if (UI.trackingContainer) UI.trackingContainer.classList.remove('hidden');
            
            updateTrackingUI(data); 
            setupCommunicationListeners(); 
            setupSyncListeners(); // Attach sync listeners
            startStatusPolling(); // Start real-time updates

            // Dispatch event for the driver module to pick up the new job details
            document.dispatchEvent(new CustomEvent('requestSubmitted', {
                detail: {
                    serviceType: selectedService, // Use the stored service type
                    location: location,
                    requestId: currentRequestId,
                    providerName: data.providerName 
                }
            }));
        } else {
            // FIX: Use reset to handle UI cleanup on failure
            resetCustomerApp(); 
            alert(`Request Failed: ${data.message || 'No providers available.'}`);
        }
    } catch (error) {
        console.error('Service request failed:', error);
        alert('An internal error occurred during the request.');
        resetCustomerApp(); // FIX: Use reset to handle UI cleanup on error
    }
}

/**
 * Cancels the active service request.
 */
export function cancelRequest() {
    if (!currentRequestId) {
        console.log('[App] No active request to cancel.');
        return;
    }
    
    // 1. Stop Polling
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
    
    console.log(`[App] Request ${currentRequestId} officially cancelled.`);
    alert('Service request canceled.');
    
    // 2. Dispatch cancel event so driver.js clears the job too
    document.dispatchEvent(new CustomEvent('driverStatusChange', { 
        detail: { status: 'Canceled', providerName: UI.providerNameDisplay?.textContent } 
    }));
    
    // 3. Reset UI/State
    resetCustomerApp();
}


// --- REAL-TIME TRACKING AND STATUS ---

/**
 * Initiates the periodic polling for request status updates.
 */
function startStatusPolling() {
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
    }
    // FIX: Call fetchStatusUpdate immediately on start to show fresh status
    fetchStatusUpdate(); 
    statusPollingInterval = setInterval(fetchStatusUpdate, POLLING_RATE_MS);
    console.log(`[App] Status polling started for Request ID: ${currentRequestId}`);
}

/**
 * Fetches the latest status from the server API (SIMULATED).
 */
async function fetchStatusUpdate() {
    if (!currentRequestId) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
        return;
    }

    // --- Core Status & ETA Simulation Logic ---
    const currentStatusText = UI.statusText?.textContent;
    let newStatus = currentStatusText;
    
    // Only decrement ETA if the status is "En Route"
    if (currentStatusText === 'En Route') {
        simulatedEta = Math.max(simulatedEta - SIMULATED_ETA_DECREMENT, 0); 
        lastStatusUpdate = Date.now();

        if (simulatedEta <= 0) {
            simulatedEta = 0; // Keep it at 0 once hit
        }
    } 
    
    // --- End Simulation Logic ---

    // Build the data object for UI update
    const data = {
        success: true,
        requestId: currentRequestId,
        providerName: UI.providerNameDisplay?.textContent || 'Sarah J. 🛠️',
        status: newStatus,
        eta: simulatedEta,
        // Simple mock location updates based on time/eta decrement
        currentLat: (newStatus === 'En Route' || newStatus === 'Arrived') ? 39.18 + (15 - simulatedEta) * 0.0001 : 39.18, 
        currentLon: (newStatus === 'En Route' || newStatus === 'Arrived') ? -77.20 - (15 - simulatedEta) * 0.0002 : -77.20
    };
    
    updateTrackingUI(data);
    
    if (data.status === 'Completed' || data.status === 'Canceled') {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
}

/**
 * Updates the tracking UI elements (Name, Photo, ETA, Map).
 */
function updateTrackingUI(data) {
    if (UI.providerNameDisplay) UI.providerNameDisplay.textContent = data.providerName || 'Provider Assigned';
    
    // 1. Provider Photo
    if (UI.providerPhoto) {
        UI.providerPhoto.src = data.providerPhotoUrl || 'https://via.placeholder.com/150/A0AEC0/FFFFFF?text=P'; 
    }

    // 2. Status Text and Color Update
    if (UI.statusText) {
        UI.statusText.textContent = data.status; 
        
        // FIX: Clear status classes more efficiently
        UI.statusText.className = UI.statusText.className.replace(/\b(text|bg)-(green|yellow|blue|red)-\d+.*?\b/g, ''); 
        UI.statusText.className = UI.statusText.className.replace(/\b(dark:text|dark:bg)-(blue|green|yellow|red)-\d+.*?\b/g, '');
        
        // Apply new status classes with background for the pill look 
        if (data.status === 'Assigned' || data.status === 'En Route') {
            UI.statusText.classList.add('text-blue-600', 'dark:text-blue-400', 'bg-blue-100', 'dark:bg-blue-900/50');
        } else if (data.status === 'Arrived') {
            UI.statusText.classList.add('text-green-600', 'dark:text-green-400', 'bg-green-100', 'dark:bg-green-900/50');
        } else if (data.status === 'Completed') {
            UI.statusText.classList.add('text-yellow-600', 'dark:text-yellow-400', 'bg-yellow-100', 'dark:bg-yellow-900/50');
        } else if (data.status === 'Canceled') {
            UI.statusText.classList.add('text-red-600', 'dark:text-red-400', 'bg-red-100', 'dark:bg-red-900/50');
        }
    }
    
    // 3. ETA Update
    let etaText;
    if (data.status === 'Arrived') {
        etaText = 'Arrived!';
    } else if (data.status === 'Completed') {
        etaText = 'Service Complete';
    } else if (data.status === 'Canceled' || data.status === 'Assigned') { // FIX: Show '--' for assigned since ETA is only reliable 'En Route'
        etaText = '--';
    } else {
        // FIX: Use Math.ceil for ETA display to show 1 min instead of 0
        etaText = `${Math.ceil(data.eta)} min`; 
    }
    
    if (UI.etaDisplay) UI.etaDisplay.textContent = etaText;

    // 4. Live Map Simulation
    if (UI.mapContainer && data.currentLat && data.currentLon) {
        if (data.status === 'En Route' || data.status === 'Assigned' || data.status === 'Arrived') {
            UI.mapContainer.textContent = 
                `Live Map: Provider at Lat: ${data.currentLat.toFixed(5)}, Lon: ${data.currentLon.toFixed(5)}`;
        } else {
            UI.mapContainer.textContent = 'Live Map: Provider Location Pending...';
        }
    }
}


// --- THEME & UTILITY FUNCTIONS ---

// ... (initializeTheme and toggleTheme remain unchanged) ...

/**
 * Resets the application state back to the initial request form.
 */
export function resetCustomerApp() {
    currentRequestId = null;
    selectedService = null; // FIX: Reset selected service
    
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
    
    simulatedEta = 15; 
    
    // Switch UI back to request view
    if (UI.trackingContainer) UI.trackingContainer.classList.add('hidden');
    if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
    if (UI.requestForm) UI.requestForm.classList.remove('hidden'); 
    
    // Reset buttons
    if (UI.submitButton) {
        UI.submitButton.disabled = false;
        // FIX: Remove utility class added on disable
        UI.submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
        UI.submitButton.textContent = 'REQUEST ASSISTANCE'; 
    }
    
    // Reset service card highlights (relying on a class selector from index.js)
    document.querySelectorAll('.service-icon-card').forEach(c => c.classList.remove('border-indigo-500', 'dark:border-indigo-400', 'ring-2', 'ring-indigo-500'));
    
    console.log('[App] Customer application state reset.');
}

// FIX: Ensure these are available globally if called from index.js or HTML directly
window.handleServiceRequest = handleServiceRequest;
window.cancelRequest = cancelRequest;
window.resetCustomerApp = resetCustomerApp;
window.initializeTheme = initializeTheme;
window.toggleTheme = toggleTheme;