// public/app.js - Core Application Logic (Customer View)

// --- State Management ---
let currentRequestId = null;
let statusPollingInterval = null;
const POLLING_RATE_MS = 5000; // Poll every 5 seconds
let simulatedEta = 15;
const SIMULATED_ETA_DECREMENT = 5; // Updated to 5 to make the 15-min ETA decrease faster

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
    // 1. Listen for Driver status changes (triggered by driver.js's handleDriverAction)
    document.addEventListener('driverStatusChange', (e) => {
        const newStatus = e.detail.status;
        console.log(`[App] Received direct status update from driver: ${newStatus}`);
        
        // Stop the polling temporarily to accept the driver's update immediately
        if (statusPollingInterval) {
            clearInterval(statusPollingInterval);
            statusPollingInterval = null;
        }

        // Manually update simulatedEta based on driver status for consistent display
        if (newStatus === 'Arrived' || newStatus === 'Completed') {
            simulatedEta = 0;
        } else if (newStatus === 'En Route') {
            // If they just accepted, reset to a high ETA to start countdown
            simulatedEta = 10; 
        }

        // Apply the update to the UI
        updateTrackingUI({
            providerName: UI.providerNameDisplay?.textContent,
            status: newStatus,
            eta: simulatedEta,
        });

        // Restart polling if the job isn't completed yet
        if (newStatus !== 'Completed' && newStatus !== 'Canceled') {
            startStatusPolling();
        } else if (newStatus === 'Completed') {
            console.log('[App] Service completed. Waiting for payment.');
            document.dispatchEvent(new CustomEvent('serviceCompleted', { detail: { requestId: currentRequestId } }));
        }
    });
}


// --- CORE FUNCTIONS ---

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
    // We check the data-listener-attached attribute to prevent adding multiple listeners
    if (UI.chatButton && !UI.chatButton.hasAttribute('data-listener-attached')) {
        UI.chatButton.addEventListener('click', startChatSimulation);
        UI.chatButton.setAttribute('data-listener-attached', 'true');
    }
    if (UI.callButton && !UI.callButton.hasAttribute('data-listener-attached')) {
        UI.callButton.addEventListener('click', startCallSimulation);
        UI.callButton.setAttribute('data-listener-attached', 'true');
    }
}


/**
 * Handles the initial service request submission.
 * @param {string} serviceType - The type of assistance requested.
 * @param {string} location - The user's current location (simulated).
 */
export async function handleServiceRequest(serviceType, location) {
    if (!serviceType || !location) {
        alert('Please select a service type.');
        return;
    }

    if (UI.submitButton) {
        UI.submitButton.disabled = true;
        UI.submitButton.textContent = 'Searching for Provider...';
    }
    // HIDE THE SERVICE SELECTION GRID AND THE REQUEST FORM CONTAINER (location/vehicle card)
    if (UI.serviceSelectionGrid) {
        UI.serviceSelectionGrid.classList.add('hidden');
    }
    if (UI.requestForm) { // FIX: Ensure the request form card is hidden
        UI.requestForm.classList.add('hidden');
    }

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
                    currentLat: 39.18, 
                    currentLon: -77.20 
                });
            }, 1000);
        });

        if (data.success) {
            currentRequestId = data.requestId;
            console.log(`Request sent! Provider found: ${data.providerName} (ETA: ${data.eta} min)`);
            
            // Initial ETA setup
            simulatedEta = data.eta; 
            
            if (UI.trackingContainer) UI.trackingContainer.classList.remove('hidden');
            
            updateTrackingUI(data); // Initial update
            setupCommunicationListeners(); // Attach the communication listeners
            setupSyncListeners(); // **Crucial:** Set up synchronization listeners for the driver
            startStatusPolling(); // Start real-time updates

            // Dispatch event for the driver module to pick up the new job details
            document.dispatchEvent(new CustomEvent('requestSubmitted', {
                detail: {
                    serviceType: serviceType,
                    location: location,
                    requestId: currentRequestId
                }
            }));

        } else {
            alert(`Request Failed: ${data.message || 'No providers available.'}`);
            
            if (UI.submitButton) {
                UI.submitButton.disabled = false;
                UI.submitButton.textContent = 'REQUEST ASSISTANCE';
            }
            if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
            if (UI.requestForm) UI.requestForm.classList.remove('hidden'); // Show form again on failure
        }
    } catch (error) {
        console.error('Service request failed:', error);
        alert('An internal error occurred during the request.');
        
        if (UI.submitButton) {
            UI.submitButton.disabled = false;
            UI.submitButton.textContent = 'REQUEST ASSISTANCE';
        }
        if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
        if (UI.requestForm) UI.requestForm.classList.remove('hidden'); // Show form again on error
    }
}

/**
 * Cancels the active service request.
 */
export function cancelRequest() {
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
    
    console.log(`[App] Request ${currentRequestId} officially cancelled.`);
    alert('Service request canceled.');
    resetCustomerApp();
    // Dispatch reset event so driver.js clears the job too
    document.dispatchEvent(new CustomEvent('resetApp'));
}


// --- REAL-TIME TRACKING AND STATUS ---

/**
 * Initiates the periodic polling for request status updates.
 */
function startStatusPolling() {
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
    }
    statusPollingInterval = setInterval(fetchStatusUpdate, POLLING_RATE_MS);
    console.log(`[App] Status polling started for Request ID: ${currentRequestId}`);
}

/**
 * Fetches the latest status from the server API (SIMULATED).
 */
async function fetchStatusUpdate() {
    if (!currentRequestId) {
        clearInterval(statusPollingInterval);
        return;
    }

    // --- Core Status & ETA Simulation Logic ---
    const currentStatusText = UI.statusText?.textContent;
    let newStatus = currentStatusText;

    // Only decrement ETA if the status is "En Route"
    if (currentStatusText === 'En Route') {
        simulatedEta = Math.max(simulatedEta - SIMULATED_ETA_DECREMENT, 1);
        if (simulatedEta <= 1) {
            // Once ETA hits 1, trigger the next status change after one more poll
            newStatus = 'Arrived';
            simulatedEta = 0;
        }
    } else if (currentStatusText === 'Assigned') {
        // Automatically move from Assigned to En Route after one poll cycle if driver hasn't accepted
        newStatus = 'En Route';
    } 
    
    // --- End Simulation Logic ---

    const data = {
        success: true,
        requestId: currentRequestId,
        providerName: UI.providerNameDisplay?.textContent || 'Sarah J. 🛠️',
        status: newStatus,
        eta: simulatedEta,
        // Simple mock location updates based on time/eta decrement
        currentLat: 39.18 + (15 - simulatedEta) * 0.0001, 
        currentLon: -77.20 - (15 - simulatedEta) * 0.0002 
    };
    
    updateTrackingUI(data);
    
    if (data.status === 'Completed') {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
        console.log('[App] Service completed. Waiting for payment.');
        document.dispatchEvent(new CustomEvent('serviceCompleted', { detail: { requestId: currentRequestId } }));
    }
}

/**
 * Updates the tracking UI elements (Name, Photo, ETA, Map).
 */
function updateTrackingUI(data) {
    if (UI.providerNameDisplay) UI.providerNameDisplay.textContent = data.providerName || 'Provider Assigned';
    
    // 1. Provider Photo
    if (UI.providerPhoto) {
        // Use a default placeholder if the URL isn't in the data
        UI.providerPhoto.src = data.providerPhotoUrl || 'https://via.placeholder.com/150/A0AEC0/FFFFFF?text=P'; 
    }

    // 2. Status Text and Color Update
    if (UI.statusText) {
        UI.statusText.textContent = data.status; 
        
        // Remove all status classes for a clean update
        UI.statusText.classList.remove('text-green-600', 'text-yellow-600', 'text-blue-600', 'dark:text-blue-400', 'dark:text-green-400', 'dark:text-yellow-400', 'text-red-600', 'dark:text-red-400', 'bg-blue-100', 'dark:bg-blue-900/50', 'bg-green-100', 'dark:bg-green-900/50', 'bg-yellow-100', 'dark:bg-yellow-900/50', 'bg-red-100', 'dark:bg-red-900/50');
        
        // Apply new status classes with background for the pill look (FIX)
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
    } else if (data.status === 'Canceled') {
        etaText = '--';
    } else {
        etaText = `${data.eta} min`;
    }
    
    if (UI.etaDisplay) UI.etaDisplay.textContent = etaText;

    // 4. Live Map Simulation
    if (UI.mapContainer && data.currentLat && data.currentLon) {
        // Only show location if provider is en route or assigned
        if (data.status === 'En Route' || data.status === 'Assigned' || data.status === 'Arrived') {
            UI.mapContainer.textContent = 
                `Live Map: Provider at Lat: ${data.currentLat.toFixed(5)}, Lon: ${data.currentLon.toFixed(5)}`;
        } else {
            UI.mapContainer.textContent = 'Live Map: Provider Location Pending...';
        }
    }
}


// --- THEME & UTILITY FUNCTIONS ---

/**
 * Initializes the theme based on local storage.
 */
export function initializeTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (UI.themeToggle) UI.themeToggle.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        if (UI.themeToggle) UI.themeToggle.textContent = '🌙';
    }
}

/**
 * Toggles between light and dark themes.
 */
export function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
    if (UI.themeToggle) UI.themeToggle.textContent = isDark ? '☀️' : '🌙';
}

/**
 * Resets the application state back to the initial request form.
 */
export function resetCustomerApp() {
    currentRequestId = null;
    if (statusPollingInterval) {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
    }
    
    simulatedEta = 15; 
    
    // Switch UI back to request view
    if (UI.trackingContainer) UI.trackingContainer.classList.add('hidden');
    if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
    if (UI.requestForm) UI.requestForm.classList.remove('hidden'); // FIX: Show the request form card again
    
    // Reset buttons
    if (UI.submitButton) {
        UI.submitButton.disabled = false;
        UI.submitButton.textContent = 'REQUEST ASSISTANCE'; 
    }
    
    // Reset service card highlights (FIX: Updated classes to match new Tailwind design)
    document.querySelectorAll('.service-icon-card').forEach(c => c.classList.remove('border-2', 'border-indigo-500', 'ring-2', 'ring-indigo-500', 'shadow-xl'));
    
    console.log('[App] Customer application state reset.');
}