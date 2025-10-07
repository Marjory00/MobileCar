// public/index.js - Application Entry Point and Initialization

import { initializeTheme, toggleTheme, handleServiceRequest, cancelRequest } from './app.js';
import { setupPaymentListeners } from './payment.js';
import { setupDriverListeners, switchToDriverView, switchToCustomerView } from './driver.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Theme Setup
    initializeTheme();

    // 2. Setup Core App Listeners (App Module)
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('cancel-request').addEventListener('click', cancelRequest);

    // Service Request Submission Listener
    document.getElementById('submit-request').addEventListener('click', () => {
        const serviceType = document.getElementById('service-type').value;
        handleServiceRequest(serviceType);
    });

    // 3. Setup Payment Listeners (Payment Module)
    setupPaymentListeners();

    // 4. Setup Driver Listeners (Driver Module)
    setupDriverListeners();
    
    // --- 5. DEMO FEATURE: Quick Switcher for Customer/Driver ---
    // This creates and attaches the floating buttons used for demoing the two user views.
    const addSwitcher = () => {
        const switcher = document.createElement('div');
        switcher.className = 'fixed bottom-4 right-4 z-30 flex space-x-2';
        switcher.innerHTML = `
            <button id="switch-customer" class="p-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition text-sm font-medium">Customer View</button>
            <button id="switch-driver" class="p-2 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition text-sm font-medium">Driver View</button>
        `;
        document.body.appendChild(switcher);

        // Attach listeners to the floating buttons
        document.getElementById('switch-customer').addEventListener('click', switchToCustomerView);
        document.getElementById('switch-driver').addEventListener('click', switchToDriverView);
    };

    addSwitcher();
});