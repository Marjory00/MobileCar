// public/app.js - Core Application Logic and State Management (Updated for Full-Stack)

import { AppState, ServiceCatalog, API_BASE_URL } from './config.js';
import { showPaymentModal } from './payment.js';

// --- DOM Elements ---
const serviceRequestSection = document.getElementById('service-request-section');
const trackingSection = document.getElementById('tracking-section');
// const driverDashboard = document.getElementById('driver-dashboard');

// --- Helper Functions ---

export function initializeTheme() {
    if (AppState.isDarkMode) {
        document.body.classList.add('dark');
    }
}

export function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    if (AppState.isDarkMode) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Sends a service request to the backend API.
 * @param {string} serviceType - The selected service.
 */
export async function handleServiceRequest(serviceType) {
    if (!serviceType) {
        alert('Please select a service type.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                serviceType,
                location: 'Customer GPS Location (Simulated)',
            }),
        });

        if (!response.ok) throw new Error('Failed to create service request.');
        
        const newRequest = await response.json();
        AppState.serviceRequest = newRequest;

        // Update UI to tracking view
        serviceRequestSection.classList.add('hidden');
        trackingSection.classList.remove('hidden');
        updateTrackingUI();

        // Start polling for real-time status updates
        startTrackingPolling(newRequest.id);

    } catch (error) {
        console.error('Service request error:', error);
        alert('Could not process request. Please ensure the server is running.');
    }
}

/**
 * Starts polling the API for real-time request status updates.
 * @param {string} requestId - The ID of the active request.
 */
function startTrackingPolling(requestId) {
    // Clear any existing interval
    if (AppState.pollInterval) clearInterval(AppState.pollInterval);

    AppState.pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/request/${requestId}`);
            if (!response.ok) throw new Error('Failed to fetch request status.');

            const updatedRequest = await response.json();
            AppState.serviceRequest = updatedRequest;
            updateTrackingUI();

            if (updatedRequest.status === 'Completed') {
                clearInterval(AppState.pollInterval);
                AppState.pollInterval = null;
                handleServiceCompletion();
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 5000); // Poll every 5 seconds
}


/**
 * Updates the Tracking section based on the AppState.serviceRequest.
 */
export function updateTrackingUI() {
    const request = AppState.serviceRequest;
    if (!request) return;

    document.getElementById('current-status').textContent = request.status;

    if (request.status === 'Accepted' || request.status === 'In Progress') {
        const driver = request.driver || {}; // Use driver object from API
        document.getElementById('eta-display').textContent = request.eta || 'Calculating...';
        document.getElementById('driver-name').textContent = driver.name || 'Mobile Technician N/A';
        document.getElementById('driver-plate').textContent = driver.plate || 'N/A';
    } else {
        document.getElementById('eta-display').textContent = '...';
        document.getElementById('driver-name').textContent = 'Waiting for match...';
        document.getElementById('driver-plate').textContent = '...';
    }
}

/**
 * Handles service completion, triggering the payment process.
 */
function handleServiceCompletion() {
    if (!AppState.serviceRequest) return;
    
    // The status is 'Completed', now trigger the modal
    showPaymentModal(AppState.serviceRequest.price);

    AppState.serviceRequest = null; // Clear local request after payment modal is triggered
}

/**
 * Clears the active service request and resets the UI.
 */
export async function cancelRequest() {
    if (!AppState.serviceRequest) return;

    if (confirm('Are you sure you want to cancel the service request?')) {
        try {
            // Update backend status to 'Cancelled'
            await fetch(`${API_BASE_URL}/request/${AppState.serviceRequest.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Cancelled' }),
            });

            if (AppState.pollInterval) clearInterval(AppState.pollInterval);
            AppState.pollInterval = null;
            AppState.serviceRequest = null;
            trackingSection.classList.add('hidden');
            serviceRequestSection.classList.remove('hidden');
            alert('Service request cancelled.');

        } catch (error) {
            console.error('Cancel request error:', error);
            alert('Could not cancel request. Driver may be en-route.');
        }
    }
}