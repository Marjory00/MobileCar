// public/index.js (or wherever your main app logic lives)

// Assuming you have this function available in profile.js
// You'll need to create a profile.js file with this export:
// export function initProfile() { /* ... profile logic ... */ }
import { initProfile } from './profile.js'; 

let selectedService = null; // Global state for the selected service

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
                        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        document.documentElement.classList.remove('dark');
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        const isCurrentlyDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isCurrentlyDark ? 'dark' : 'light');
        themeToggle.textContent = isCurrentlyDark ? '☀️' : '🌙';
    });
}

function setupServiceSelection() {
    const serviceCards = document.querySelectorAll('.service-icon-card');
    const requestBtn = document.getElementById('request-assistance-btn');

    if (!serviceCards.length || !requestBtn) return;

    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // 1. Deselect all cards visually
            serviceCards.forEach(c => c.classList.remove('border-indigo-500', 'dark:border-indigo-400', 'ring-2', 'ring-indigo-500'));
            
            // 2. Select the clicked card visually
            this.classList.add('border-indigo-500', 'dark:border-indigo-400', 'ring-2', 'ring-indigo-500');
            
            // 3. Update global state and button text
            selectedService = this.getAttribute('data-service');
            requestBtn.textContent = `REQUEST ${selectedService.toUpperCase()}`;
            requestBtn.disabled = false;
            requestBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        });
    });

    // Initial state: Disable the button until a service is selected
    requestBtn.disabled = true;
    requestBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

function setupRequestLogic() {
    const requestBtn = document.getElementById('request-assistance-btn');
    const trackingContainer = document.getElementById('tracking-container');
    const vehicleDisplay = document.getElementById('vehicle-display');
    const locationDisplay = document.getElementById('location-display');

    // 1. Listener to show tracking on request
    requestBtn?.addEventListener('click', () => {
        if (!selectedService) {
            alert("Please select a service before requesting assistance.");
            return;
        }

        console.log(`Requesting ${selectedService} for ${vehicleDisplay.textContent} at ${locationDisplay.textContent}`);
        
        // Simulation steps
        alert(`Simulating: Requesting **${selectedService}** for **${vehicleDisplay.textContent}**. Showing tracking.`);
        trackingContainer?.classList.remove('hidden');

        // Optional: Scroll to the bottom to show the tracking bar on mobile views
        const customerApp = document.getElementById('customer-app');
        if (customerApp) {
             customerApp.scrollTop = customerApp.scrollHeight;
        }
    });

    // 2. Listener to hide the tracking container
    document.getElementById('close-tracking-btn')?.addEventListener('click', () => {
        trackingContainer?.classList.add('hidden');
        selectedService = null; // Reset selection on request cancel/close
        requestBtn.textContent = 'REQUEST ASSISTANCE';
        requestBtn.disabled = true;
        requestBtn.classList.add('opacity-50', 'cursor-not-allowed');
        document.querySelectorAll('.service-icon-card').forEach(c => c.classList.remove('border-indigo-500', 'dark:border-indigo-400', 'ring-2', 'ring-indigo-500'));
        console.log("Tracking view manually closed and service reset.");
    });
}

function setupModalLogic() {
    const detailsModal = document.getElementById('details-modal');
    const paymentModal = document.getElementById('payment-modal');
    const vehicleSelect = document.getElementById('vehicle-profile-select');
    const vehicleDisplay = document.getElementById('vehicle-display');
    
    // Details Modal Open/Close
    document.getElementById('change-vehicle-btn')?.addEventListener('click', () => {
        detailsModal?.classList.remove('hidden');
    });

    document.getElementById('close-details-modal')?.addEventListener('click', () => {
        detailsModal?.classList.add('hidden');
    });
    
    document.getElementById('confirm-details-btn')?.addEventListener('click', () => {
        // Update the main app display with the new selected vehicle
        const selectedVehicle = vehicleSelect.options[vehicleSelect.selectedIndex].text.split(',')[0].trim();
        if (vehicleDisplay) vehicleDisplay.textContent = selectedVehicle;
        detailsModal?.classList.add('hidden');
    });

    // Payment Modal Close (if you need to open it later, the logic would be here)
    document.getElementById('close-payment-modal')?.addEventListener('click', () => {
        paymentModal?.classList.add('hidden');
    });
    
    document.getElementById('complete-payment-btn')?.addEventListener('click', () => {
        alert("Simulated: Payment completed! Thank you.");
        paymentModal?.classList.add('hidden');
        document.getElementById('tracking-container')?.classList.add('hidden'); 
    });
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("Application initializing...");
    
    // 1. Initialize Theme
    setupThemeToggle();

    // 2. Initialize Profile Listeners (if profile.js is functional)
    if (typeof initProfile === 'function') {
        initProfile(); 
    }

    // 3. Initialize Modal & Detail Logic
    setupModalLogic();
    
    // 4. Initialize Service Selection Logic
    setupServiceSelection();

    // 5. Initialize Main Request/Tracking Logic
    setupRequestLogic();

    console.log("Application initialization complete.");
});