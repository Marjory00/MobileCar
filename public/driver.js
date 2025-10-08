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

    // Job Alert Modal Elements
    jobAlertModal: document.getElementById('job-alert-modal'),
    alertServiceType: document.getElementById('alert-service-type'),
    alertCustomerLocation: document.getElementById('alert-customer-location'),
    alertCustomerVehicle: document.getElementById('alert-customer-vehicle'),
    acceptJobBtn: document.getElementById('accept-job-btn'),
    declineJobBtn: document.getElementById('decline-job-btn'),
    
    // Navigation element
    mapNavigationDisplay: null, 

    // Communication Elements
    chatCustomerBtn: null,
    callCustomerBtn: null,

    // Sign-Off Modal and Elements
    signOffModal: document.getElementById('sign-off-modal'),
    signOffCloseBtn: document.getElementById('close-sign-off-modal'),
    signOffSubmitBtn: document.getElementById('sign-off-submit-btn'),
    serviceNotesInput: document.getElementById('service-notes-input'),
};

// --- SIMULATED GLOBAL REQUEST STATE ---
let activeDriverRequest = {
    service: 'No Active Job',
    customer: 'N/A',
    location: 'Waiting for assignment...',
    vehicle: 'N/A', 
    status: 'Ready for Next Job',
    eta: '0 min',
    active: false,
    traffic: 'None',
    formCompleted: false,
};

// --- NEW: EARNINGS STATE ---
let driverEarnings = {
    jobsCompleted: 3,
    totalEarnings: 215.50,
    withdrawableBalance: 85.00,
    recentJobs: [
        { id: 'JOB-902', date: 'Yesterday', service: 'Tire Change', amount: 85.00, status: 'Completed' },
        { id: 'JOB-901', date: '3 days ago', service: 'Jump Start', amount: 65.50, status: 'Paid Out' },
        { id: 'JOB-900', date: 'Last Week', service: 'Towing', amount: 120.00, status: 'Paid Out' }
    ],
    withdrawalStatus: 'Ready', // Changed default status
    driverViewMode: 'job' // Tracks current view: 'job' or 'earnings'
};


// -----------------------------------------------------------
// NEW: EARNINGS & PAYMENT LOGIC
// -----------------------------------------------------------

/**
 * Renders the provider's Earnings and Payment dashboard.
 */
function renderEarningsView() {
    UI_DRIVER.driverApp.innerHTML = `
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Provider Dashboard</h2>
        
        ${renderNavigationView('earnings')}

        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-indigo-600 text-white p-5 rounded-xl shadow-lg">
                    <p class="text-sm opacity-80">Total Earnings</p>
                    <p class="text-3xl font-bold">$${driverEarnings.totalEarnings.toFixed(2)}</p>
                </div>
                <div class="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-lg">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Available to Withdraw</p>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white">$${driverEarnings.withdrawableBalance.toFixed(2)}</p>
                    <button id="withdraw-btn" class="mt-2 w-full text-sm p-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition">
                        Withdraw Funds
                    </button>
                </div>
                <div class="bg-white dark:bg-gray-700 p-5 rounded-xl shadow-lg">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Jobs Completed (YTD)</p>
                    <p class="text-3xl font-bold text-gray-900 dark:text-white">${driverEarnings.jobsCompleted}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Last Payout: 3 days ago</p>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Job History</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead>
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job ID</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                                <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                            ${driverEarnings.recentJobs.map(job => `
                                <tr>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${job.id}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${job.service}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">$${job.amount.toFixed(2)}</td>
                                    <td class="px-3 py-2 whitespace-nowrap text-sm">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${job.status === 'Completed' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}">
                                            ${job.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-lg flex justify-between items-center">
                <p class="text-lg font-semibold text-gray-900 dark:text-white">Next Payout Status:</p>
                <p class="text-lg font-bold ${driverEarnings.withdrawalStatus === 'Ready' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}">${driverEarnings.withdrawalStatus}</p>
            </div>
        </div>
    `;

    // Attach listener for the withdrawal button
    document.getElementById('withdraw-btn')?.addEventListener('click', handleWithdrawal);
}

/**
 * Simulates a withdrawal request.
 */
function handleWithdrawal() {
    if (driverEarnings.withdrawableBalance < 10) {
        alert("Minimum withdrawal amount is $10.00.");
        return;
    }

    const withdrawnAmount = driverEarnings.withdrawableBalance; // FIX: Capture amount before reset

    driverEarnings.withdrawalStatus = 'Processing';
    driverEarnings.withdrawableBalance = 0.00;
    
    // Add a mock job to the history to show the action
    const newJob = { id: 'WDR-' + Date.now().toString().slice(-4), date: 'Today', service: 'Withdrawal', amount: -withdrawnAmount, status: 'Processing' }; // FIX: Use captured amount
    driverEarnings.recentJobs.unshift(newJob);

    renderEarningsView();
    alert("Withdrawal request submitted! Funds should hit your bank within 1-3 business days.");
    console.log("[Earnings] Withdrawal initiated. Balance reset.");
}

/**
 * Renders the navigation bar to switch between views.
 * @param {string} activeView - 'job' or 'earnings'.
 */
function renderNavigationView(activeView) {
    const jobClass = activeView === 'job' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
    const earningsClass = activeView === 'earnings' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300';

    return `
        <div class="flex mb-6 bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
            <button id="switch-to-job-btn" class="flex-1 p-3 font-semibold rounded-lg transition ${jobClass}">
                Current Job Status
            </button>
            <button id="switch-to-earnings-btn" class="flex-1 p-3 font-semibold rounded-lg transition ${earningsClass}">
                Earning & Payments
            </button>
        </div>
    `;
}

/**
 * Adds the completed job to the earnings history.
 */
function logCompletedJob() {
    const earnings = 75.00 + Math.floor(Math.random() * 20); // Mock earnings for the job
    const jobId = 'JOB-' + Date.now().toString().slice(-3);
    
    driverEarnings.jobsCompleted++;
    driverEarnings.totalEarnings += earnings;
    driverEarnings.withdrawableBalance += earnings;
    driverEarnings.recentJobs.unshift({
        id: jobId,
        date: 'Just Now',
        service: activeDriverRequest.service,
        amount: earnings,
        status: 'Completed'
    });
    
    console.log(`[Earnings] Logged job ${jobId}. Earnings: $${earnings.toFixed(2)}.`);
}

// -----------------------------------------------------------
// JOB STATUS & ALERT FUNCTIONS (Modified to use new view mode)
// -----------------------------------------------------------

function triggerNewJobAlert(jobDetails) {
    if (!UI_DRIVER.jobAlertModal || activeDriverRequest.active) return;
    console.warn("🚨🚨🚨 NEW JOB ALERT: LOUD TONE SIMULATED 🚨🚨🚨");
    if (UI_DRIVER.alertServiceType) UI_DRIVER.alertServiceType.textContent = jobDetails.service;
    if (UI_DRIVER.alertCustomerLocation) UI_DRIVER.alertCustomerLocation.textContent = jobDetails.location;
    // Mock a vehicle if it's not present (required to fix N/A issue)
    const vehicle = jobDetails.vehicle || '2022 Honda Civic'; 
    if (UI_DRIVER.alertCustomerVehicle) UI_DRIVER.alertCustomerVehicle.textContent = vehicle;
    UI_DRIVER.acceptJobBtn.jobDetails = {...jobDetails, vehicle}; // Pass the vehicle to acceptJob
    UI_DRIVER.jobAlertModal.classList.remove('hidden');
}

function acceptJob(e) {
    const jobDetails = e.target.jobDetails;
    if (!jobDetails) return;
    
    activeDriverRequest = {
        service: jobDetails.service,
        customer: 'John D. (Membership #456)',
        location: jobDetails.location,
        vehicle: jobDetails.vehicle,
        status: 'En Route', // FIX: Driver status is immediately 'En Route' upon acceptance
        eta: '10 min',
        active: true,
        traffic: 'Moderate',
        formCompleted: false, 
    };
    UI_DRIVER.jobAlertModal.classList.add('hidden');
    // Ensure we switch back to the job view upon acceptance
    driverEarnings.driverViewMode = 'job'; 
    if (!UI_DRIVER.driverApp.classList.contains('hidden')) {
        renderDriverView();
    }
    // FIX: Send 'En Route' to the customer immediately to start their ETA countdown
    document.dispatchEvent(new CustomEvent('driverStatusChange', { detail: { status: 'En Route' } }));
}

function declineJob() {
    UI_DRIVER.jobAlertModal.classList.add('hidden');
    console.log('[Driver] Job declined. Waiting for next alert.');
}


// --- DIGITAL FORM & SIGN-OFF LOGIC (Modified to use new view mode) ---

function showSignOffForm() {
    if (!UI_DRIVER.signOffModal) {
        alert("Sign-Off form UI element not found.");
        return;
    }
    if (UI_DRIVER.serviceNotesInput) {
        // Updated mock note to be clearer
        UI_DRIVER.serviceNotesInput.value = `Completed ${activeDriverRequest.service} for ${activeDriverRequest.vehicle}. Customer provided digital signature.`;
    }
    UI_DRIVER.signOffModal.classList.remove('hidden');
    console.log('[Driver] Sign-Off Form displayed. Awaiting details capture.');
}

function submitSignOffForm() {
    const notes = UI_DRIVER.serviceNotesInput?.value || 'No notes provided.';
    const signatureCaptured = true; 

    if (!signatureCaptured) {
        alert("Customer signature is required to finalize the service.");
        return;
    }

    // Log the job earnings BEFORE marking status completed
    logCompletedJob(); 

    activeDriverRequest.formCompleted = true;
    UI_DRIVER.signOffModal.classList.add('hidden');
    
    activeDriverRequest.status = 'Completed';
    activeDriverRequest.eta = 'Service Complete';
    renderDriverView();

    // The 'Completed' status event is dispatched here, after logging the job.
    document.dispatchEvent(new CustomEvent('driverStatusChange', { detail: { status: 'Completed' } }));
}


// -----------------------------------------------------------
// CORE VIEW AND LISTENER SETUP
// -----------------------------------------------------------

function setupCommunicationLinks() {
    if (activeDriverRequest.active) {
        // Re-query the elements as they are dynamically rendered
        UI_DRIVER.chatCustomerBtn = document.getElementById('chat-customer-btn');
        UI_DRIVER.callCustomerBtn = document.getElementById('call-customer-btn');
        UI_DRIVER.chatCustomerBtn?.addEventListener('click', () => alert(`[Driver Chat] Masked chat with ${activeDriverRequest.customer.split(' (')[0]}`));
        UI_DRIVER.callCustomerBtn?.addEventListener('click', () => alert(`[Driver Call] Masked call to ${activeDriverRequest.customer.split(' (')[0]}`));
    }
}

/**
 * Sets up listeners for the driver actions and global events.
 */
export function setupDriverListeners() {
    // 1. Listeners for the dynamic action button (Job Status Management)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'driver-action-btn') {
            handleDriverAction();
        }
        // NEW: View Switcher Listeners
        if (e.target.id === 'switch-to-job-btn') {
            driverEarnings.driverViewMode = 'job';
            renderDriverView();
        }
        if (e.target.id === 'switch-to-earnings-btn') {
            driverEarnings.driverViewMode = 'earnings';
            renderDriverView();
        }
    });

    // 2. New Job Alert Actions
    UI_DRIVER.acceptJobBtn?.addEventListener('click', acceptJob);
    UI_DRIVER.declineJobBtn?.addEventListener('click', declineJob);
    
    // 3. Sign-Off Form Handlers
    UI_DRIVER.signOffSubmitBtn?.addEventListener('click', submitSignOffForm);
    UI_DRIVER.signOffCloseBtn?.addEventListener('click', () => UI_DRIVER.signOffModal.classList.add('hidden'));

    // 4. Listener for when the customer submits a request (Job Alert Trigger)
    document.addEventListener('requestSubmitted', (e) => {
        const jobDetails = {
            service: e.detail.serviceType,
            location: e.detail.location,
            vehicle: '2022 Tesla Model 3', // Hard-coded mock vehicle data
        };
        triggerNewJobAlert(jobDetails);
    });

    // 5. Listener for the app reset (after customer payment/cancellation)
    document.addEventListener('resetApp', () => {
        activeDriverRequest = {
            service: 'No Active Job',
            customer: 'N/A',
            location: 'Waiting for assignment...',
            vehicle: 'N/A',
            status: 'Ready for Next Job',
            eta: '0 min',
            active: false,
            traffic: 'None',
            formCompleted: false
        };
        driverEarnings.driverViewMode = 'job'; // Reset to default view
        if (!UI_DRIVER.driverApp.classList.contains('hidden')) {
             renderDriverView();
        }
    });
}

export function switchToDriverView() {
    if (UI_DRIVER.customerApp && UI_DRIVER.driverApp) {
        UI_DRIVER.customerApp.classList.add('hidden');
        UI_DRIVER.driverApp.classList.remove('hidden');
        renderDriverView();
        console.log('[Driver] Switched to Driver View.');
    }
}

export function switchToCustomerView() {
    if (UI_DRIVER.customerApp && UI_DRIVER.driverApp) {
        UI_DRIVER.customerApp.classList.remove('hidden');
        UI_DRIVER.driverApp.classList.add('hidden');
        console.log('[Driver] Switched to Customer View.');
    }
}

/**
 * Main render function that delegates to Job Status or Earnings view.
 */
function renderDriverView() {
    if (!UI_DRIVER.driverApp) return;

    if (driverEarnings.driverViewMode === 'earnings') {
        renderEarningsView();
        return;
    }

    const request = activeDriverRequest;

    if (!request.active) {
         // Display for NO ACTIVE JOB
         UI_DRIVER.driverApp.innerHTML = `
             <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Provider Dashboard</h2>
             ${renderNavigationView('job')}
             <div class="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4 text-center">
                 <p class="text-xl font-semibold text-gray-600 dark:text-gray-300">No Active Jobs</p>
                 <p class="text-gray-500 dark:text-gray-400">Status: <span class="font-bold">${request.status}</span>. Awaiting the next service request.</p>
                 <button id="driver-status-btn" class="p-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">Go Offline (Sim)</button>
             </div>
         `;
         return;
    }
    
    // --- Optimized Navigation Simulation Logic ---
    let mapContent, mapHeaderColor;

    if (request.status === 'Arrived') {
        mapContent = 'You have arrived. Customer is on the left. Coordinates confirmed.';
        mapHeaderColor = 'text-green-500';
    } else if (request.status === 'Completed') {
        mapContent = 'Navigation complete. Service finalized.';
        mapHeaderColor = 'text-yellow-500';
    } else { // Assigned or En Route
        mapContent = `**NEXT TURN:** Take I-270 N, exit 16. In 2 miles, turn left onto ${request.location.split(',')[0]}. **TRAFFIC:** ${request.traffic}.`;
        mapHeaderColor = 'text-indigo-500';
    }


    // Determine the button text based on status and form completion
    let buttonText;
    let buttonDisabled = false; // Add a disabled state for visual clarity

    if (request.status === 'Completed') {
        buttonText = 'Acknowledge & Finalize Job';
    } else if (request.status === 'Arrived') {
        if (!request.formCompleted) {
             buttonText = 'Mark as Service Complete (Require Sign-Off)';
        } else {
             // This state should not be hit if the form submits and immediately sets status to 'Completed'
             buttonText = 'Acknowledge & Finalize Job';
        }
    } else if (request.status === 'En Route') {
        buttonText = 'Mark as Arrived';
    } else if (request.status === 'Assigned') {
        buttonText = 'Start Driving (Go En Route)';
    } else {
        // Fallback for unhandled status
        buttonText = 'Next Action';
    }


    // Display for ACTIVE JOB (Job Queue/Status)
    UI_DRIVER.driverApp.innerHTML = `
        <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Provider Dashboard</h2>
        ${renderNavigationView('job')}
        <div id="driver-request-info" class="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg space-y-4">
            <h3 class="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Active Job: ${request.service}</h3>
            
            <div class="grid grid-cols-2 gap-2 text-sm">
                <p>Customer: <span class="font-medium">${request.customer}</span></p>
                <p>Vehicle: <span class="font-medium">${request.vehicle}</span></p>
            </div>

            <p>Destination: <span class="font-medium">${request.location}</span></p>
            
            <div class="flex items-center justify-between">
                <p>Current Status: <span id="driver-status-display" class="font-bold text-lg text-blue-500 dark:text-blue-400">${request.status}</span></p>
                
                <div class="flex space-x-3">
                    <button id="chat-customer-btn" title="Chat with Customer" class="p-2 bg-indigo-100 dark:bg-indigo-700 text-indigo-600 dark:text-white rounded-full hover:bg-indigo-200">
                        💬
                    </button>
                    <button id="call-customer-btn" title="Call Customer (Masked)" class="p-2 bg-indigo-100 dark:bg-indigo-700 text-indigo-600 dark:text-white rounded-full hover:bg-indigo-200">
                        📞
                    </button>
                </div>
            </div>

            <p>Customer ETA: <span class="font-bold">${request.eta}</span></p>
            
            <div id="map-navigation-display" class="p-4 bg-gray-200 dark:bg-gray-600 rounded-lg">
                <p class="font-bold mb-2 ${mapHeaderColor}">Turn-by-Turn Navigation (Simulated)</p>
                <p class="text-sm text-gray-700 dark:text-gray-300">${mapContent}</p>
                <p class="text-xs mt-1 text-red-500 dark:text-red-400">Traffic Overlay: ${request.traffic} on route.</p>
            </div>
            
            ${request.status === 'Completed' ? 
                '<p class="text-sm font-semibold text-yellow-500">✅ Service Finalized. Ready for payment processing.</p>' : ''}
            ${request.formCompleted && request.status === 'Arrived' ? 
                '<p class="text-sm font-semibold text-green-500">✅ Form Completed. Ready to finalize.</p>' : ''}

            <button id="driver-action-btn" class="w-full p-3 mt-4 
                ${request.status === 'Completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} 
                text-white font-bold rounded-lg transition ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}" ${buttonDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        </div>
    `;

    // Update references and attach new listeners
    UI_DRIVER.driverStatusDisplay = document.getElementById('driver-status-display');
    UI_DRIVER.driverActionBtn = document.getElementById('driver-action-btn');
    UI_DRIVER.mapNavigationDisplay = document.getElementById('map-navigation-display');
    setupCommunicationLinks(); 
}

/**
 * Handles the driver action (e.g., En Route, Arrived, Completed) and triggers status update.
 */
function handleDriverAction() {
    if (!UI_DRIVER.driverStatusDisplay || !UI_DRIVER.driverActionBtn || !activeDriverRequest.active) return;

    let currentStatus = activeDriverRequest.status; 

    switch (currentStatus) {
        case 'Assigned': 
            activeDriverRequest.status = 'En Route';
            activeDriverRequest.eta = '10 min';
            activeDriverRequest.traffic = 'Moderate';
            break;
            
        case 'En Route':
            activeDriverRequest.status = 'Arrived';
            activeDriverRequest.eta = 'Arrived!';
            activeDriverRequest.traffic = 'Light'; 
            break;

        case 'Arrived':
            // INTERCEPT: If service is complete, require sign-off first.
            if (!activeDriverRequest.formCompleted) {
                showSignOffForm();
                return; // Stop execution, wait for form submission
            }
            // If form IS completed, the next action is to switch status to completed
            activeDriverRequest.status = 'Completed';
            activeDriverRequest.eta = 'Service Complete';
            // The 'Completed' event is now dispatched by submitSignOffForm, so we break here and handle the final step below.
            break; 

        case 'Completed':
            // Final action: switch back to customer view to initiate payment.
            switchToCustomerView();
            console.log('[Driver] Job finalized. Switching to Customer View for payment processing.');
            return; // EXIT: No status update needed for this internal transition.

        default:
            console.error(`[Driver] Unhandled status action: ${currentStatus}`);
            return;
    }

    renderDriverView();

    console.warn(`[Driver] Triggering customer status update: ${activeDriverRequest.status}`);
    
    // Only dispatch if the status has changed by a normal action (not the final 'Completed' transition)
    document.dispatchEvent(new CustomEvent('driverStatusChange', { detail: { status: activeDriverRequest.status } }));
}