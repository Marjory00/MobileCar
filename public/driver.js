// public/driver.js - Driver Management and Service Operations

import { AppState, API_BASE_URL } from './config.js';

// --- DOM Elements ---
const driverStatusToggle = document.getElementById('driver-status-toggle');
const driverEarningsSpan = document.getElementById('driver-earnings');
const pendingRequestsCount = document.getElementById('pending-requests-count');
const pendingRequestsList = document.getElementById('pending-requests-list');
const trackingSection = document.getElementById('tracking-section');
const serviceRequestSection = document.getElementById('service-request-section');
const driverDashboard = document.getElementById('driver-dashboard');

// Internal Driver State
let driverState = {
    isOnline: false,
    earnings: 0.00,
    serviceQueue: [],
    driverId: 'DRV-001', // Static ID for this demo driver
    pollInterval: null,
};

/**
 * Toggles the driver's online/offline status and starts/stops polling.
 */
export function toggleDriverStatus() {
    driverState.isOnline = !driverState.isOnline;
    
    // Update the button appearance
    driverStatusToggle.textContent = driverState.isOnline ? 'Online' : 'Offline';
    driverStatusToggle.classList.toggle('bg-green-600', driverState.isOnline);
    driverStatusToggle.classList.toggle('bg-red-500', !driverState.isOnline);

    if (driverState.isOnline) {
        console.log(`Driver ${driverState.driverId} is now Online. Starting job poll.`);
        startDriverPolling();
    } else {
        console.log(`Driver ${driverState.driverId} is now Offline.`);
        clearInterval(driverState.pollInterval);
        driverState.pollInterval = null;
        // Clear queue when going offline
        driverState.serviceQueue = []; 
    }
    updateDriverUI();
}

/**
 * Starts polling the API for new and active service requests.
 */
function startDriverPolling() {
    // Clear any existing interval
    if (driverState.pollInterval) clearInterval(driverState.pollInterval);

    // Initial fetch
    fetchActiveRequests();
    
    // Poll every 8 seconds
    driverState.pollInterval = setInterval(fetchActiveRequests, 8000); 
}

/**
 * Fetches active service requests from the backend API.
 */
async function fetchActiveRequests() {
    if (!driverState.isOnline) return;

    try {
        const response = await fetch(`${API_BASE_URL}/driver/requests`);
        if (!response.ok) throw new Error('Failed to fetch driver requests.');

        const requests = await response.json();
        // Filter requests to show 'Pending' jobs (for matching) and jobs assigned to this driver
        driverState.serviceQueue = requests.filter(r => 
            r.status === 'Pending' || r.driverId === driverState.driverId
        ); 
        updateDriverUI();

    } catch (error) {
        console.error('Driver polling error:', error);
    }
}

/**
 * Updates the Driver Dashboard UI with current earnings and requests.
 */
function updateDriverUI() {
    driverEarningsSpan.textContent = `$${driverState.earnings.toFixed(2)}`;
    pendingRequestsCount.textContent = driverState.serviceQueue.length;
    pendingRequestsList.innerHTML = '';

    if (driverState.serviceQueue.length === 0) {
        pendingRequestsList.innerHTML = '<div class="text-gray-500 dark:text-gray-400">No active requests. Go online to accept a job!</div>';
        return;
    }

    driverState.serviceQueue.forEach(request => {
        // Determine action based on request status
        const isPending = request.status === 'Pending';
        const isAssigned = request.driverId === driverState.driverId && request.status !== 'Completed';

        // Only show requests that are Pending OR assigned to this specific driver
        if (!isPending && !isAssigned) return;

        const action = isPending ? 'accept' : 'complete';
        const actionText = isPending ? 'Accept' : 'Complete Service';
        const actionClass = isPending ? 'bg-indigo-600' : 'bg-green-600';
        
        const card = document.createElement('div');
        card.className = 'p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg shadow flex justify-between items-center';
        card.innerHTML = `
            <div>
                <p class="font-bold text-gray-900 dark:text-white">${request.serviceType} Service</p>
                <p class="text-sm text-gray-600 dark:text-gray-300">Location: ${request.location} | <span class="font-semibold text-lg">$${request.price.toFixed(2)}</span></p>
                <p class="text-xs text-indigo-500 dark:text-indigo-400">Status: ${request.status}</p>
            </div>
            <button data-request-id="${request.id}" data-action="${action}" class="${actionClass} text-white text-sm py-1 px-3 rounded hover:${actionClass.replace('600', '700')} transition action-btn">
                ${actionText}
            </button>
        `;
        pendingRequestsList.appendChild(card);
    });

    // Re-attach listeners to the dynamically created buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', handleDriverAction);
    });
}

/**
 * Handles a driver accepting or completing a request.
 * @param {Event} event - The click event.
 */
async function handleDriverAction(event) {
    const requestId = event.target.getAttribute('data-request-id');
    const action = event.target.getAttribute('data-action');
    const request = driverState.serviceQueue.find(r => r.id === requestId);

    if (!request) return;

    if (action === 'accept') {
        // The backend server auto-matches, but this action is used to confirm the status is 'In Progress' for the driver.
        await updateRequestStatusAPI(requestId, 'In Progress');
        alert(`Accepted ${request.serviceType}. Proceeding to location. Check the Customer's tracking page (simulated).`);
    } else if (action === 'complete') {
        // Driver marks service as completed
        await updateRequestStatusAPI(requestId, 'Completed');
        
        // Update local earnings (simulating payment success)
        driverState.earnings += parseFloat(request.price);
        alert(`Completed ${request.serviceType}. Earnings updated by $${request.price.toFixed(2)}.`);
    }
    
    // Refresh the driver's queue after action
    fetchActiveRequests();
}

/**
 * Calls the API to update a request's status.
 */
async function updateRequestStatusAPI(requestId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/request/${requestId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status }),
        });
        if (!response.ok) throw new Error(`Failed to update status to ${status}.`);
        return await response.json();
    } catch (error) {
        console.error('API Status Update Error:', error);
    }
}

// --- View Switching Functions ---

export function switchToDriverView() {
    AppState.isDriver = true;
    serviceRequestSection.classList.add('hidden');
    trackingSection.classList.add('hidden');
    driverDashboard.classList.remove('hidden');
    document.getElementById('theme-toggle').classList.add('hidden');
    // Ensure data is fresh when switching to driver view
    if (driverState.isOnline) {
        fetchActiveRequests(); 
    } else {
        updateDriverUI();
    }
}

export function switchToCustomerView() {
    AppState.isDriver = false;
    serviceRequestSection.classList.remove('hidden');
    trackingSection.classList.add('hidden');
    driverDashboard.classList.add('hidden');
    document.getElementById('theme-toggle').classList.remove('hidden');
}

// Export a listener setup function to be used in init.js
export function setupDriverListeners() {
    driverStatusToggle.addEventListener('click', toggleDriverStatus);
    
    // Initial UI setup
    updateDriverUI();
}