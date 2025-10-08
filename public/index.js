// public/index.js - Application Entry Point and Initialization

import { initializeTheme, toggleTheme, handleServiceRequest, cancelRequest } from './app.js';
import { setupPaymentListeners } from './payment.js';
import { setupDriverListeners, switchToDriverView, switchToCustomerView } from './driver.js';

document.addEventListener('DOMContentLoaded', () => {
    // State to track the service selected from the quick-select icons
    let selectedService = null;

    // References to core display elements
    const locationDisplay = document.getElementById('location-display');
    const vehicleDisplay = document.getElementById('vehicle-display');
    const serviceCards = document.querySelectorAll('.service-icon-card');
    const requestButton = document.getElementById('request-assistance-btn');

    // References to Modal elements
    const detailsModal = document.getElementById('details-modal');
    const closeDetailsBtn = document.getElementById('close-details-modal');
    const confirmDetailsBtn = document.getElementById('confirm-details-btn');
    const editLocationBtn = document.getElementById('edit-location-btn');
    const changeVehicleBtn = document.getElementById('change-vehicle-btn');
    const useGpsBtn = document.getElementById('use-gps-btn');
    const locationInput = document.getElementById('manual-location-input');
    const locationStatus = document.getElementById('location-status');
    const vehicleSelect = document.getElementById('vehicle-profile-select');

    // 1. Initial Theme Setup
    initializeTheme();

    // 2. Setup Core App Listeners (App Module)
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('cancel-request').addEventListener('click', cancelRequest);

    // Setup listener for the Feedback Link (existing logic)
    const openFeedbackLink = document.getElementById('open-feedback-link');
    if (openFeedbackLink) {
        openFeedbackLink.addEventListener('click', (e) => {
            e.preventDefault();
            const comments = prompt("Please rate our service (1-5) and provide comments:");
            if (comments !== null) {
                submitDemoFeedback(5, comments);
            }
        });
    }

    // ----------------------------------------------------
    // 3. Service Selection Logic (The requested feature) 🛠️
    // ----------------------------------------------------
    
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
            
            handleServiceRequest(selectedService, location);
        });
    }

    // ----------------------------------------------------
    // 4. Location & Vehicle Details Modal Logic 🚗📍
    // ----------------------------------------------------

    // Function to open the modal
    const openDetailsModal = () => {
        if (detailsModal) detailsModal.classList.remove('hidden');
    };

    // Attach listeners to the main screen buttons
    if (editLocationBtn) editLocationBtn.addEventListener('click', openDetailsModal);
    if (changeVehicleBtn) changeVehicleBtn.addEventListener('click', openDetailsModal);

    // Close modal listener
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', () => {
            if (detailsModal) detailsModal.classList.add('hidden');
        });
    }
    
    // GPS Simulation Logic
    if (useGpsBtn) {
        useGpsBtn.addEventListener('click', () => {
            locationStatus.textContent = '...Detecting precise location via satellite...';
            useGpsBtn.disabled = true;

            // Simulate a 2-second API call/GPS lookup
            setTimeout(() => {
                const newAddress = '19875 Central Park Ave, Clarksburg, MD 20871';

                if (locationInput) locationInput.value = newAddress;
                locationStatus.textContent = `Location Confirmed: GPS Active`;
                useGpsBtn.disabled = false;
            }, 2000);
        });
    }
    
    // Confirm Details & Save Logic
    if (confirmDetailsBtn) {
        confirmDetailsBtn.addEventListener('click', () => {
            // 1. Get updated values
            const finalLocation = locationInput ? locationInput.value : 'Unknown Location';
            const selectedVehicleText = vehicleSelect ? vehicleSelect.options[vehicleSelect.selectedIndex].text : 'Unknown Vehicle';
            
            // 2. Update the main screen display elements
            if (locationDisplay) locationDisplay.textContent = finalLocation;
            if (vehicleDisplay) {
                // Only show Make/Model, trim any extra details (like the color/profile in parenthesis)
                vehicleDisplay.textContent = selectedVehicleText.split('(')[0].trim();
            }
            
            // 3. Close the modal
            if (detailsModal) detailsModal.classList.add('hidden');
        });
    }
    
    document.getElementById('add-vehicle-btn')?.addEventListener('click', () => {
        alert("Redirecting to the Vehicle Profile Management Screen...");
    });
    
    // 5. Setup Payment Listeners (Payment Module)
    setupPaymentListeners();

    // 6. Setup Driver Listeners (Driver Module)
    setupDriverListeners();
    
    // 7. DEMO FEATURE: Quick Switcher for Customer/Driver
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