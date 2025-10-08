// public/driver.js - Handles Driver Dashboard Logic (Demo/Admin Dashboard Component)

const UI = {
    customerApp: document.getElementById('customer-app'),
    driverApp: document.getElementById('driver-app'),
    driverRequestList: document.getElementById('driver-request-list') // Target container for driver requests
};

/**
 * Sets up any initial listeners specific to the driver view.
 */
export function setupDriverListeners() {
    console.log('[Driver] Driver listeners set up.');
}

/**
 * Switches the primary view to the Customer application.
 */
export function switchToCustomerView() {
    if (UI.driverApp && UI.customerApp) {
        UI.driverApp.classList.add('hidden');
        UI.customerApp.classList.remove('hidden');
        console.log('[View] Switched to Customer View.');
    }
}

/**
 * Switches the primary view to the Driver application (Dashboard).
 */
export function switchToDriverView() {
    if (UI.driverApp && UI.customerApp) {
        UI.customerApp.classList.add('hidden');
        UI.driverApp.classList.remove('hidden');
        // Load requests when the driver view is active
        fetchDriverRequests();
        console.log('[View] Switched to Driver View.');
    }
}

/**
 * Fetches and displays the list of open service requests for the demo.
 */
async function fetchDriverRequests() {
    // NOTE: In a complete app, this would query a dedicated endpoint like /api/driver/requests.
    // Since we haven't created that, we'll use a dynamic placeholder based on current time.
    
    const lastRequestTime = new Date().toLocaleTimeString();

    if (UI.driverRequestList) {
        UI.driverRequestList.innerHTML = `
            <h3 class="text-xl font-semibold mb-4 text-green-700 dark:text-green-400">Active Service Requests</h3>
            <p class="text-sm text-gray-500 mb-2">
                (Simulated Data - Last Updated: ${lastRequestTime})
            </p>
            <div class="p-4 bg-white dark:bg-gray-800 border border-yellow-400 rounded shadow-md mb-3">
                <p class="font-bold">Request ID: TEMP-001</p>
                <p>Service: **Tire Change**</p>
                <p>Location: 456 Demo Blvd.</p>
                <p class="text-sm mt-1">Status: **Waiting for Acceptance**</p>
                <button class="mt-2 text-sm bg-green-500 hover:bg-green-600 text-white p-2 rounded">[Simulate Accept]</button>
            </div>
            
            <div class="p-4 bg-white dark:bg-gray-800 border border-gray-300 rounded shadow-md">
                <p>No other active requests.</p>
            </div>
        `;
    }
}