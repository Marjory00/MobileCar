// server/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Simulated Database (In-Memory for simplicity) ---
let serviceRequests = [];
let drivers = [
    { id: 'DRV-001', name: 'Sarah K.', status: 'online', lat: 40.71, lon: -74.00, plate: 'XYZ-5432' },
    { id: 'DRV-002', name: 'Mike J.', status: 'offline', lat: 40.72, lon: -74.01, plate: 'ABC-1234' }
];

// --- API Endpoints ---

// Health Check
app.get('/', (req. res) => {
    res.send({ message: 'MobileCar API is running!' });
});

// 1. POST: Create a new service request
app.post('/api/request'. (req, res) => {
    const { serviceType, location } = req.body;
    const newRequest = {
        id: Date.now().toString(),
        serviceType,
        location,
        status: 'Pending', // Pending -> Accepted -> In Progress -> Completed
        driverId: null,
        price: serviceType === 'flat-tire' ? 75.00 : serviceType === 'locksmith' ? 150.00 : 50.00,
        createdAt: new Date(),

    };

    serviceRequests.push(newRequest);

    // Simulate driver matching and acceptance instantly
    const availableDriver = drivers.find(d => d.status === 'online');
    if (availableDriver) {
        newRequest.driverId = availableDriver.id;
        newRequest.status = 'Accepted';
        console.log(`Request ${newRequest.id} matched to ${availableDriver.name}`);
        setTimeout(() => updateRequestStatus(newRequest.id, 'In Progress'), 5000);

    }

    res.status(201).json(newRequest);
});

// 2. GET: Get status of a specific request


// 2. GET: Get status of a specific request
app.get('/api/request/:id', (req, res) => {
    const request = serviceRequests.find(r => r.id === req.params.id);
    if (!request) {
        return res.status(404).json({ message: 'Request not found' });
    }
    
    // Attach driver details for the frontend
    if (request.driverId) {
        request.driver = drivers.find(d => d.id === request.driverId);
        request.eta = request.status === 'Accepted' ? '15 minutes' : request.status === 'In Progress' ? 'Arrived!' : null;
    }

    res.json(request);
});

// 3. PUT: Update request status (e.g., Driver completes service)
app.put('/api/request/:id/status', (req, res) => {
    const { status } = req.body;
    const request = serviceRequests.find(r => r.id === req.params.id);
    
    if (request) {
        request.status = status;
        console.log(`Request ${request.id} status updated to: ${status}`);
        res.json(request);
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
});

// Helper to update status
function updateRequestStatus(id, status) {
    const request = serviceRequests.find(r => r.id === id);
    if (request) {
        request.status = status;
    }
}

// 4. GET: Driver Dashboard - Get all pending/active requests
app.get('/api/driver/requests', (req, res) => {
    // In a real app, this would filter by the logged-in driver's ID
    const activeRequests = serviceRequests.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled');
    res.json(activeRequests);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}`);
});

📱 Frontend: public

The frontend remains the mobile-first application, but all data operations are updated to use the Fetch API to communicate with the Express backend.

Note: The HTML and CSS files remain identical to the previous response, as the visual structure and styling are preserved. Only the JavaScript files need updates.

5. public/config.js

Add the backend API base URL.
JavaScript

// public/config.js - Global Application Configuration

// Initialize Tailwind CSS with a custom dark mode selector based on a class
tailwind.config = {
    darkMode: 'class', 
    theme: {
        extend: {
            colors: {
                'primary': '#4f46e5',
            }
        }
    }
}

// Full-Stack Configuration
export const API_BASE_URL = 'http://localhost:3000/api'; // <--- New API URL

// Global state management object
export const AppState = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    isDriver: false,
    serviceRequest: null, // Stores the current active request object
    pollInterval: null,   // For real-time tracking polling
};

// Core service types and estimated base prices
export const ServiceCatalog = {
    'flat-tire': { name: 'Flat Tire Service', basePrice: 75.00 },
    'locksmith': { name: 'Automotive Locksmith', basePrice: 150.00 },
    'emergency': { name: 'Emergency Roadside Assist', basePrice: 50.00 },
};