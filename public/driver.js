// public/driver.js - Logic for the Driver/Provider Side Simulation

// --- UI Element Selectors ---
const UI_DRIVER = {
    // Containers
    customerApp: document.getElementById('customer-app'),
    driverApp: document.getElementById('driver-app'),
    
    // Driver view elements (to be dynamically managed)
    driverStatusDisplay: null,
    driverActionBtn: null,
    driverRequestInfo: null,
};

// --- SIMULATED GLOBAL REQUEST STATE (Assumed to be updated by app.js on request) ---
let activeDriverRequest = {
    service: 'No Active Job',
    customer: 'N/A',
    location: 'Waiting for assignment...',
    status: 'Ready for Next Job',
    eta: '0 min',
    active: false
};


// --- State and View Control ---

/**
 * Sets up listeners for the driver actions and global events.
 */
export function setupDriverListeners() {
    // Listener for the dynamic action button
    document.addEventListener('click', (e) => {
        if (e.target.id === 'driver-action-btn') {
            handleDriverAction();
        }
    });

    // NEW: Listener for when the customer submits a request (simulated)
    document.addEventListener('requestSubmitted', (e) => {
        activeDriverRequest = {
            service: e.detail.serviceType,
            customer: 'John D. (Membership #456)', // Static customer info for simplicity
            location: e.detail.location,
            status: 'Assigned', // The driver first sees the job as "Assigned"
            eta: '15 min',
            active: true
        };
        // If the driver view is open, refresh it immediately
        if (!UI_DRIVER.driverApp.classList.contains('hidden')) {
             renderDriverView();
        }
    });

    // NEW: Listener for the app reset (after customer payment/cancellation)
    document.addEventListener('resetApp', () => {
        activeDriverRequest = {
            service: 'No Active Job',
            customer: 'N/A',
            location: 'Waiting for assignment...',
            status: 'Ready for Next Job',
            eta: '0 min',
            active: false
        };
        // If driver view is open, update to the 'Ready' state
        if (!UI_DRIVER.driverApp.classList.contains('hidden')) {
             renderDriverView();
        }
    });
}

/**
 * Switches the view to the Driver interface.
 */
export function switchToDriverView() {
    if (UI_DRIVER.customerApp && UI_DRIVER.driverApp) {
        UI_DRIVER.customerApp.classList.add('hidden');
        UI_DRIVER.driverApp.classList.remove('hidden');
        renderDriverView();
        console.log('[Driver] Switched to Driver View.');
    }
}

/**
 * Switches the view back to the Customer interface.
 */
export function switchToCustomerView() {
    if (UI_DRIVER.customerApp && UI_DRIVER.driverApp) {
        UI_DRIVER.customerApp.classList.remove('hidden');
        UI_DRIVER.driverApp.classList.add('hidden');
        console.log('[Driver] Switched to Customer View.');
    }
}

/**
 * Renders the driver's current status and actions using the global state.
 */
function renderDriverView() {
    if (!UI_DRIVER.driverApp) return;

    const request = activeDriverRequest;

    if (!request.active) {
         UI_DRIVER.driverApp.innerHTML = `
            <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Provider Dashboard</h2>
            <div class="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4 text-center">
                <p class="text-xl font-semibold text-gray-600 dark:text-gray-300">No Active Jobs</p>
                <p class="text-gray-500 dark:text-gray-400">You are currently ${request.status}. Awaiting the next service request.</p>
                <button id="driver-status-btn" class="p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">Go Offline</button>
            </div>
        `;
        return;
    }

    // Render Active Job details
    UI_DRIVER.driverApp.innerHTML = `
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Provider Dashboard</h2>
        <div id="driver-request-info" class="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4">
            <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Active Job: ${request.service}</h3>
            <p>Customer: <span class="font-medium">${request.customer}</span></p>
            <p>Destination: <span class="font-medium">${request.location}</span></p>
            <p>Current Status: <span id="driver-status-display" class="font-bold text-blue-500 dark:text-blue-400">${request.status}</span></p>
            <p>Customer ETA: <span class="font-bold">${request.eta}</span></p>
            
            <div class="h-48 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500">
                [Live Map Simulation: Driver to Customer Route]
            </div>
            
            <button id="driver-action-btn" class="w-full p-3 mt-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
                ${request.status === 'Assigned' ? 'Start Driving (Go En Route)' : 
                  request.status === 'En Route' ? 'Mark as Arrived' :
                  request.status === 'Arrived' ? 'Mark as Service Complete' : 
                  'Acknowledge Completion'}
            </button>
        </div>
    `;

    // Update references
    UI_DRIVER.driverStatusDisplay = document.getElementById('driver-status-display');
    UI_DRIVER.driverActionBtn = document.getElementById('driver-action-btn');
}

/**
 * Handles the driver action (e.g., Arrived, Completed) and triggers status update.
 */
function handleDriverAction() {
    if (!UI_DRIVER.driverStatusDisplay || !UI_DRIVER.driverActionBtn || !activeDriverRequest.active) return;

    let currentStatus = UI_DRIVER.driverStatusDisplay.textContent;
    let newStatus, newButtonText;

    switch (currentStatus) {
        case 'Assigned':
        case 'En Route':
            newStatus = 'Arrived';
            newButtonText = 'Mark as Service Complete';
            activeDriverRequest.eta = 'Arrived!';
            break;
        case 'Arrived':
            newStatus = 'Completed';
            newButtonText = 'Job Finished (Switch to Customer View)';
            activeDriverRequest.eta = 'Service Complete';
            break;
        case 'Completed':
            // Final action: switch back to customer view to see payment modal
            switchToCustomerView();
            // We rely on the customer app's logic (in app.js/payment.js) to trigger the final reset
            return; 
        default:
            newStatus = 'En Route';
            newButtonText = 'Mark as Arrived';
            activeDriverRequest.eta = '10 min';
    }

    // Update driver internal state and UI
    activeDriverRequest.status = newStatus;
    UI_DRIVER.driverStatusDisplay.textContent = newStatus;
    UI_DRIVER.driverActionBtn.textContent = newButtonText;
    
    // Rerender the ETA in the small status bar
    renderDriverView();

    // SIMULATED: Notify the customer side (via event)
    console.warn(`[Driver] Triggering customer status update: ${newStatus}`);
    
    // Dispatch an event to simulate the server pushing a status change to the customer
    // The customer app.js needs to listen for 'driverStatusChange' and immediately update its state
    document.dispatchEvent(new CustomEvent('driverStatusChange', { detail: { status: newStatus } }));
}