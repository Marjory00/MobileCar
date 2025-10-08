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
    requestForm: document.getElementById('request-form-container'),
    submitButton: document.getElementById('submit-request'),
    serviceType: document.getElementById('service-type'),
    
    // Tracking elements
    trackingContainer: document.getElementById('tracking-container'),
    providerNameDisplay: document.getElementById('provider-name-display'),
    etaDisplay: document.getElementById('eta-display'),
    statusText: document.getElementById('status-text'),
    
    // Global components
    themeToggle: document.getElementById('theme-toggle'),
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

    UI.submitButton.disabled = true;
    UI.submitButton.textContent = 'Searching for Provider...';

    try {
        const response = await fetch('/api/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'demo-user-123', location, serviceType })
        });

        const data = await response.json();

        if (data.success) {
            currentRequestId = data.requestId;
            alert(`Request sent! Provider found: ${data.providerName} (ETA: ${data.eta} min)`);
            
            // Switch UI to tracking view
            UI.requestForm.classList.add('hidden');
            UI.trackingContainer.classList.remove('hidden');
            
            updateTrackingUI(data); // Initial update
            startStatusPolling(); // Start real-time updates (Simulated)
        } else {
            alert(`Request Failed: ${data.message || 'No providers available.'}`);
            UI.submitButton.disabled = false;
            UI.submitButton.textContent = 'Submit Request';
        }
    } catch (error) {
        console.error('Service request failed:', error);
        alert('An internal error occurred during the request.');
        UI.submitButton.disabled = false;
        UI.submitButton.textContent = 'Submit Request';
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
    
    // In a real app, this would send an API call to the server to update the request status to 'Canceled'.
    
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
 * Fetches the latest status from the server API.
 */
async function fetchStatusUpdate() {
    if (!currentRequestId) {
        clearInterval(statusPollingInterval);
        return;
    }

    try {
        const response = await fetch(`/api/status/${currentRequestId}`);
        const data = await response.json();
        
        if (data.success) {
            updateTrackingUI(data);
            
            if (data.status === 'Completed') {
                clearInterval(statusPollingInterval);
                statusPollingInterval = null;
                // Trigger payment flow (handled by payment.js, which listens for the state change)
                console.log('[App] Service completed. Waiting for payment.');
                // We'll use a custom event to communicate this to payment.js
                document.dispatchEvent(new CustomEvent('serviceCompleted', { detail: { requestId: currentRequestId } }));
            }
        }
    } catch (error) {
        console.error('Error fetching status:', error);
    }
}

/**
 * Updates the tracking UI elements based on the latest status data.
 */
function updateTrackingUI(data) {
    UI.providerNameDisplay.textContent = data.providerName || 'Provider Assigned';
    UI.statusText.textContent = `Status: ${data.status}`;
    
    let etaText = `${data.eta || 1} min`;
    if (data.status === 'Arrived') {
        etaText = 'Arrived!';
    } else if (data.status === 'Completed') {
        etaText = 'Service Complete';
    }
    UI.etaDisplay.textContent = etaText;
    
    // Visually update the status steps (e.g., changing classes on progress bar elements)
    // (Implementation of the visual progress bar is left to the index.html/CSS)
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
    UI.themeToggle.textContent = isDark ? '☀️' : '🌙';
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
    UI.trackingContainer.classList.add('hidden');
    UI.requestForm.classList.remove('hidden');
    
    // Reset form and buttons
    UI.serviceType.value = '';
    UI.submitButton.disabled = false;
    UI.submitButton.textContent = 'Submit Request';
    
    console.log('[App] Customer application state reset.');
}