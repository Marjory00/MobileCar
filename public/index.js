// public/index.js - Application Entry Point and Initialization

import { initializeTheme, toggleTheme, handleServiceRequest, cancelRequest } from './app.js';
import { setupPaymentListeners } from './payment.js';
import { setupDriverListeners, switchToDriverView, switchToCustomerView } from './driver.js';

document.addEventListener('DOMContentLoaded', () => {
    // State to track the service selected from the quick-select icons
    let selectedService = null;

    // 1. Initial Theme Setup
    initializeTheme();

    // 2. Setup Core App Listeners (App Module)
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('cancel-request').addEventListener('click', cancelRequest);

    // Setup listener for the Feedback Link
    const openFeedbackLink = document.getElementById('open-feedback-link');
    if (openFeedbackLink) {
        openFeedbackLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Using a simple prompt for the demo feedback
            const comments = prompt("Please rate our service (1-5) and provide comments:");
            if (comments !== null) {
                submitDemoFeedback(5, comments); // Rating 5 is hardcoded for simplicity
            }
        });
    }

    // --- NEW HOME SCREEN LOGIC ---
    const serviceCards = document.querySelectorAll('.service-icon-card');
    const requestButton = document.getElementById('request-assistance-btn');
    const locationDisplay = document.getElementById('location-display');

    // A. Service Card Selection Logic
    serviceCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Remove highlight from all cards
            serviceCards.forEach(c => c.classList.remove('border-2', 'border-indigo-500'));
            
            // Highlight the selected card and set the service type
            event.currentTarget.classList.add('border-2', 'border-indigo-500');
            selectedService = event.currentTarget.dataset.service;

            console.log(`Service selected: ${selectedService}`);
        });
    });
    
    // B. Primary Request Button Submission Listener
    if (requestButton) {
        requestButton.addEventListener('click', () => {
            if (!selectedService) {
                alert('Please select a service type (Flat Tire, Towing, etc.) from the icons before requesting assistance.');
                return;
            }
            
            // The location is read from the location display element
            const location = locationDisplay ? locationDisplay.textContent : "Unknown Location";
            
            // Execute the core application logic
            handleServiceRequest(selectedService, location);
        });
    }
    // --- END NEW HOME SCREEN LOGIC ---

    // 3. Setup Payment Listeners (Payment Module)
    setupPaymentListeners();

    // 4. Setup Driver Listeners (Driver Module)
    setupDriverListeners();
    
    // --- 5. DEMO FEATURE: Quick Switcher for Customer/Driver ---
    const addSwitcher = () => {
        const switcher = document.createElement('div');
        switcher.className = 'fixed bottom-4 right-4 z-30 flex space-x-2';
        // 🛑 FIX: Missing HTML re-inserted here 🛑
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

/**
 * Simulates the client-side API call to the new /api/feedback endpoint.
 */
async function submitDemoFeedback(rating, comments) {
    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'demo-user-123', rating, comments })
        });
        
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        alert('Could not submit feedback due to a connection error.');
    }
}