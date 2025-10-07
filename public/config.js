// public/config.js - Global Configuration and State

/**
 * Global application state storage.
 * The front-end configuration should NOT contain secrets like DB credentials.
 */
export const AppState = {
    isDarkMode: false,
    serviceRequest: null, // Stores the currently active request object for the customer
    pollInterval: null,   // Stores the timer ID for the status polling loop
    isDriver: false       // True if the demo is currently showing the driver dashboard
};

/**
 * API Base URL:
 * Since the server is expected to serve the frontend on the same origin (localhost:3000),
 * we use a relative path to prevent hardcoding the protocol and port.
 * This is the correct way to handle this in a single-origin web application.
 */
export const API_BASE_URL = '/api';