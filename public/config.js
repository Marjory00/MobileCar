// public/config.js - Global Configuration and State

/**
 * Global application state storage.
 */
export const AppState = {
    isDarkMode: false,
    serviceRequest: null, // Stores the currently active request object for the customer
    pollInterval: null,   // Stores the timer ID for the status polling loop
    isDriver: false       // True if the demo is currently showing the driver dashboard
};

/**
 * API Base URL:
 * We use a relative path (/api) because the Node.js server is now serving the 
 * frontend from the same origin (http://localhost:3000). This keeps the code clean 
 * and prevents hardcoding the port.
 */
export const API_BASE_URL = '/api';