// public/app.js - Core Application Logic (Customer View)

import { AppState, API_BASE_URL } from './config.js';
import { showPaymentModal } from './payment.js';

// --- DOM Elements ---
const serviceRequestSection = document.getElementById('service-request-section');
const trackingSection = document.getElementById('tracking-section');
const currentStatusSpan = document.getElementById('current-status');
const etaDisplay = document.getElementById('eta-display');
const driverNameSpan = document.getElementById('driver-name');
const driverPlateSpan = document.getElementById('driver-plate');

// --- Theme Management ---

/**
 * Initializes the theme based on local storage or system preference.
 */
export function initializeTheme() {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        AppState.isDarkMode = true;
    } else {
        document.documentElement.classList.remove('dark');
        AppState.isDarkMode = false;
    }
}

/**
 * Toggles the theme between light and dark mode.
 */
export function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    if (AppState.isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}

// --- Service Request & Tracking ---

/**
 * Handles the submission of a new service request to the backend.
 * @param {string} serviceType - The type of service requested (e.g., 'flat-tire').
 */
export async function handleServiceRequest(serviceType) {
    if (AppState.serviceRequest) {
        alert('You already have an active service request.');
        return;
    }

    // 1. Simulate getting user's location
    const location = '40.7128, -74.0060 (New York City)'; // Static location for demo

    try {
        // 2. POST the request to the backend API
        const response = await fetch(`${API_BASE_URL}/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceType, location }),
        });

        if (!response.ok) throw new Error('Failed to create service request.');
        
        const requestData = await response.json();
        AppState.serviceRequest = requestData;
        
        // 3. Switch to tracking view and start polling
        switchToTrackingView();
        startPolling();

    } catch (error) {
        console.error('Service request submission error:', error);
        alert('Error: Could not submit service request. Check the server console.');
    }
}

/**
 * Switches the UI from the request form to the tracking status view.
 */
function switchToTrackingView() {
    serviceRequestSection.classList.add('hidden');
    trackingSection.classList.remove('hidden');
}

/**
 * Starts the interval for fetching real-time status updates from the API.
 */
function startPolling() {
    // Clear any previous interval
    if (AppState.pollInterval) clearInterval(AppState.pollInterval);

    // Fetch immediately, then every 5 seconds
    fetchStatusUpdate(); 
    AppState.pollInterval = setInterval(fetchStatusUpdate, 5000); 
}

/**
 * Fetches the latest status and driver details for the active request.
 */
async function fetchStatusUpdate() {
    if (!AppState.serviceRequest || AppState.isDriver) {
        // Stop polling if request is complete or user switches to driver view
        clearInterval(AppState.pollInterval);
        AppState.pollInterval = null;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/request/${AppState.serviceRequest.id}`);
        if (!response.ok) throw new Error('Failed to fetch status update.');

        const updatedRequest = await response.json();
        AppState.serviceRequest = updatedRequest;

        // 1. Update UI Elements
        updateTrackingUI(updatedRequest);

        // 2. Check for Completion
        if (updatedRequest.status === 'Completed') {
            clearInterval(AppState.pollInterval);
            AppState.pollInterval = null;
            
            // Show payment modal
            showPaymentModal(updatedRequest.price);
            AppState.serviceRequest = null; // Clear the active request
        }
    } catch (error) {
        console.error('Status polling error:', error);
    }
}

/**
 * Updates the tracking section DOM elements.
 * @param {object} request - The latest request object from the API.
 */
function updateTrackingUI(request) {
    currentStatusSpan.textContent = request.status;
    currentStatusSpan.className = 'font-bold'; 

    if (request.status === 'Pending') {
        currentStatusSpan.classList.add('text-yellow-500');
        etaDisplay.textContent = 'Searching...';
        driverNameSpan.textContent = 'N/A';
        driverPlateSpan.textContent = 'N/A';
    } else if (request.driver) {
        currentStatusSpan.classList.add('text-green-500');
        etaDisplay.textContent = request.eta || 'Tracking...';
        driverNameSpan.textContent = request.driver.name;
        driverPlateSpan.textContent = request.driver.plate;
    } else {
        currentStatusSpan.classList.add('text-indigo-500');
    }
}

/**
 * Handles cancelling an active request. (Simulated)
 */
export async function cancelRequest() {
    if (!AppState.serviceRequest) return;

    const confirmed = confirm('Are you sure you want to cancel this service request?');
    if (!confirmed) return;

    try {
        // 1. Tell the backend to cancel the request
        await fetch(`${API_BASE_URL}/request/${AppState.serviceRequest.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelled' }),
        });

        // 2. Cleanup local state
        clearInterval(AppState.pollInterval);
        AppState.pollInterval = null;
        AppState.serviceRequest = null;
        
        // 3. Reset UI to request form
        trackingSection.classList.add('hidden');
        serviceRequestSection.classList.remove('hidden');
        alert('Service request has been cancelled.');

    } catch (error) {
        console.error('Cancellation error:', error);
        alert('Error: Failed to cancel request.');
    }
}