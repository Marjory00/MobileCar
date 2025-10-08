// public/driver.js - Logic for the Driver/Provider Side Simulation

// --- UI Element Selectors ---
const UI_DRIVER = {
    // Containers
    customerApp: document.getElementById('customer-app'),
    driverApp: document.getElementById('driver-app'),
    
    // Driver view elements (to be dynamically added in real app)
    driverStatusDisplay: null,
    driverActionBtn: null,
    driverRequestInfo: null,
};

// --- State and View Control ---

/**
 * Sets up listeners for the driver actions.
 */
export function setupDriverListeners() {
    // Since driver elements are dynamically managed in this demo,
    // we set listeners on the document for simplicity.
    document.addEventListener('click', (e) => {
        if (e.target.id === 'driver-action-btn') {
            handleDriverAction();
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
 * Renders the driver's current status and actions.
 */
function renderDriverView() {
    if (!UI_DRIVER.driverApp) return;

    // Mock request details for the driver
    const mockRequest = {
        service: 'Tire Change',
        customer: 'John D. (Membership #456)',
        location: '19875 Central Park Ave, Clarksburg, MD',
        status: 'En Route',
        eta: '10 min',
    };

    UI_DRIVER.driverApp.innerHTML = `
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Provider Dashboard</h2>
        <div id="driver-request-info" class="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4">
            <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Active Job: ${mockRequest.service}</h3>
            <p>Customer: <span class="font-medium">${mockRequest.customer}</span></p>
            <p>Destination: <span class="font-medium">${mockRequest.location}</span></p>
            <p>Current Status: <span id="driver-status-display" class="font-bold text-green-500">${mockRequest.status}</span></p>
            <p>Customer ETA: <span class="font-bold">${mockRequest.eta}</span></p>
            
            <div class="h-48 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500">
                [Live Map Simulation: Driver to Customer Route]
            </div>
            
            <button id="driver-action-btn" class="w-full p-3 mt-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
                Mark as Arrived
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
    if (!UI_DRIVER.driverStatusDisplay || !UI_DRIVER.driverActionBtn) return;

    let currentStatus = UI_DRIVER.driverStatusDisplay.textContent;
    let newStatus, newButtonText;

    switch (currentStatus) {
        case 'En Route':
        case '10 min away':
            newStatus = 'Arrived';
            newButtonText = 'Mark as Service Complete';
            break;
        case 'Arrived':
            newStatus = 'Completed';
            newButtonText = 'Job Finished (Switch to Customer View)';
            break;
        case 'Completed':
            // Final action: switch back to customer view to see payment modal
            switchToCustomerView();
            return; 
        default:
            newStatus = 'En Route';
            newButtonText = 'Mark as Arrived';
    }

    // Update driver UI
    UI_DRIVER.driverStatusDisplay.textContent = newStatus;
    UI_DRIVER.driverActionBtn.textContent = newButtonText;

    // SIMULATED: Trigger the customer's status polling update right away
    // In a real application, the server would handle this.
    console.warn(`[Driver] Triggering customer status update: ${newStatus}`);
    
    // Dispatch a dummy event to simulate the customer's polling receiving the update
    document.dispatchEvent(new CustomEvent('driverStatusChange', { detail: { status: newStatus } }));
}