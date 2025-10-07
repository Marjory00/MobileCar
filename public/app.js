
// public/app.js = Core Application Logic and State Management (Update for Full -Stack)

import { AppState, ServiceCatalog, API_BASE_URL } from './config.js';
import { showPaymentModal } from './payment.js';

// === DOM Elements ===

const serviceRequestSection = document.getElementById('service-request-section');
const trackingSection = document.getElementById('tracking-section');
const driverDashboard = document.getElementById('driver-dashboard');

// --- Helper Functions ---

export function initializeTheme() {
    if (AppState.isDarkMode) {
        document.body.classList.add('dark');
    }
}

export function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    if (AppState.isDarkMode) {
        document.body.classList.add('dark');
        
    }
}