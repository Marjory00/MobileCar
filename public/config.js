// public/config.js - Global Application Configuration

// Initialize Tailwind CSS with a custom dark selector based on a class 
tailwind.config = {
    darkMode: 'class',
    theme: [
        extend: {
            colors: {
                'primary': '#4f46e5',

            }
        }
    ]
}

// Full-Stack Configuration
export const API_BASE_URL = 'http://localhost:3000/api'; // <--- New API URL

// Global state management object
export const AppState = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    isDriver: false,
    serviceRequest: null, // Stores the current active request object
    pollInterval: null, // For real-time tracking polling
};


// Core service types and estimated base prices
export const ServiceCatalog = {
    'flat-tire': { name: 'Flat Tire Service', basePrice: 75.00 },
    'locksmith': { name: 'Automotive Locksmith', basePrice: 150.00 },
    'emergency': { name: 'Emergency Roadside Assist', basePrice: 50.00 },
};