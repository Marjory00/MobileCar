// public/app.js - Core Application Logic (Customer View)

// --- State Management ---
let currentRequestId = null;
let statusPollingInterval = null;
const POLLING_RATE_MS = 5000; // Poll every 5 seconds

// --- UI Element Selectors (Ensures they exist in index.html) ---
const UI = {
    // Main containers
    customerApp: document.getElementById('customer-app'),
    driverApp: document.getElementById('driver-app'),
    
    // Request form elements
    requestForm: document.getElementById('request-form-container'), // The info card at the top
    submitButton: document.getElementById('request-assistance-btn'),
    serviceSelectionGrid: document.getElementById('service-selection-grid'),
    
    // Tracking elements
    trackingContainer: document.getElementById('tracking-container'),
    providerNameDisplay: document.getElementById('provider-name-display'),
    etaDisplay: document.getElementById('eta-display'),
    statusText: document.getElementById('status-text'),
    
    // Global components
    themeToggle: document.getElementById('theme-toggle'),
    
    // New: The main content wrapper to be hidden/shown when switching views
    mainContent: document.getElementById('main-content') 
};

// --- CORE FUNCTIONS ---

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

    // Hide the service selection grid (icons) when tracking starts
    if (UI.serviceSelectionGrid) {
        UI.serviceSelectionGrid.classList.add('hidden');
    }

    try {
        // SIMULATED API CALL to /api/request
        const data = await new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    requestId: 'REQ-' + Date.now(),
                    providerName: 'Sarah J.',
                    providerPhoto: 'sarah.jpg',
                    eta: 15, // minutes
                    status: 'Assigned',
                    // Location data for map simulation would go here
                });
            }, 1000);
        });

        if (data.success) {
            currentRequestId = data.requestId;
            alert(`Request sent! Provider found: ${data.providerName} (ETA: ${data.eta} min)`);
            
            // Switch UI to tracking view
            if (UI.trackingContainer) UI.trackingContainer.classList.remove('hidden');
            
            updateTrackingUI(data); // Initial update
            startStatusPolling(); // Start real-time updates (Simulated)
        } else {
            alert(`Request Failed: ${data.message || 'No providers available.'}`);
            
            // Restore UI state
            if (UI.submitButton) {
                UI.submitButton.disabled = false;
                UI.submitButton.textContent = 'REQUEST ASSISTANCE';
            }
            if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Service request failed:', error);
        alert('An internal error occurred during the request.');
        
        // Restore UI state
        if (UI.submitButton) {
            UI.submitButton.disabled = false;
            UI.submitButton.textContent = 'REQUEST ASSISTANCE';
        }
        if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
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
    
    // SIMULATED: API call to server to cancel the request
    console.log(`[App] Request ${currentRequestId} officially cancelled.`);
    
    alert('Service request canceled.');
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

    // SIMULATED STATUS UPDATE LOGIC
    const statuses = ['Assigned', 'En Route', '5 min away', 'Arrived', 'Completed'];
    // Randomly advance the status every poll (for demo purposes)
    const currentStatusIndex = statuses.indexOf(UI.statusText?.textContent.split(': ')[1]) || 0;
    const nextStatusIndex = Math.min(currentStatusIndex + 1, statuses.length - 1);
    const newStatus = statuses[nextStatusIndex];
    const newEta = nextStatusIndex === 0 ? 15 : (5 - nextStatusIndex) * 3; // Mock ETA decrease

    const data = {
        success: true,
        requestId: currentRequestId,
        providerName: UI.providerNameDisplay?.textContent || 'Sarah J.',
        status: newStatus,
        eta: newEta > 0 ? newEta : 0,
    };
    
    updateTrackingUI(data);
    
    if (data.status === 'Completed') {
        clearInterval(statusPollingInterval);
        statusPollingInterval = null;
        console.log('[App] Service completed. Waiting for payment.');
        // Notify payment.js
        document.dispatchEvent(new CustomEvent('serviceCompleted', { detail: { requestId: currentRequestId } }));
    }
}

/**
 * Updates the tracking UI elements based on the latest status data.
 */
function updateTrackingUI(data) {
    if (UI.providerNameDisplay) UI.providerNameDisplay.textContent = data.providerName || 'Provider Assigned';
    
    if (UI.statusText) {
        // Ensure status text is only the status itself for the simulation logic to work
        UI.statusText.textContent = data.status; 
        
        // Change text color based on status
        UI.statusText.classList.remove('text-green-600', 'text-yellow-600', 'text-blue-600');
        if (data.status === 'Assigned' || data.status === 'En Route') {
            UI.statusText.classList.add('text-blue-600', 'dark:text-blue-400');
        } else if (data.status === 'Arrived') {
            UI.statusText.classList.add('text-green-600', 'dark:text-green-400');
        } else if (data.status === 'Completed') {
            UI.statusText.classList.add('text-yellow-600', 'dark:text-yellow-400');
        }
    }
    
    let etaText = `${data.eta || 1} min`;
    if (data.status === 'Arrived') {
        etaText = 'Arrived!';
    } else if (data.status === 'Completed') {
        etaText = 'Service Complete';
    }
    if (UI.etaDisplay) UI.etaDisplay.textContent = etaText;

    // In a real app, this is where you'd update the map view with the provider's coordinates.
    // E.g., MapLibreGL.updateMarker(data.providerLat, data.providerLon);
}


// --- THEME & UTILITY FUNCTIONS ---

/**
 * Initializes the theme based on local storage.
 */
export function initializeTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
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
    
    // Switch UI back to request view
    if (UI.trackingContainer) UI.trackingContainer.classList.add('hidden');
    if (UI.serviceSelectionGrid) UI.serviceSelectionGrid.classList.remove('hidden');
    
    // Reset buttons
    if (UI.submitButton) {
        UI.submitButton.disabled = false;
        UI.submitButton.textContent = 'REQUEST ASSISTANCE'; 
    }
    
    // Reset service card highlights (requires access to serviceCards, usually in index.js)
    document.querySelectorAll('.service-icon-card').forEach(c => c.classList.remove('border-2', 'border-indigo-500'));
    
    console.log('[App] Customer application state reset.');
}