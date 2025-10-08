import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path'; 
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobilecar_demo';

// NEW IMPORTS: Mongoose Models and Auth/Feedback Routes
import User from './models/User.js';     
import Feedback from './models/Feedback.js';
import authRoutes from './authRoutes.js'; 

// Helper to define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 2. Mongoose Schemas and Models (To be refactored later) ---

// NOTE: These two schemas would typically be in separate files (models/ServiceRequest.js, etc.)
const serviceRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    location: { type: String, required: true },
    serviceType: { type: String, required: true },
    status: { type: String, enum: ['Requested', 'Accepted', 'En Route', 'Arrived', 'Completed', 'Paid'], default: 'Requested' },
    providerId: String,
    providerName: String,
    estimatedArrivalTime: Date,
    completionTime: Date,
    paymentDetails: Object,
}, { timestamps: true });
const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

const driverSchema = new mongoose.Schema({
    driverId: { type: String, unique: true },
    name: String,
    serviceType: String,
    location: { lat: Number, lng: Number },
    status: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
});
const Driver = mongoose.model('Driver', driverSchema);

// --- Initialization: Ensure Demo Drivers Exist ---
const initialDrivers = [
    { driverId: 'P101', name: 'Rapid Towing', serviceType: 'Towing', location: { lat: 38.900, lng: -77.010 } },
    { driverId: 'P102', name: 'FastFix Tires', serviceType: 'Tire Change', location: { lat: 38.905, lng: -77.015 } },
    { driverId: 'P103', name: 'JumpStart Experts', serviceType: 'Jump Start', location: { lat: 38.910, lng: -77.020 } },
];
async function initializeDrivers() {
    try {
        await Driver.deleteMany({});
        await Driver.insertMany(initialDrivers);
        console.log('Demo drivers initialized. 🚗');
    } catch (error) {
        // You should handle errors related to the database operation itself here
        console.error('Error initializing demo drivers:', error);
    }
}

// ---------------------------------------------------------------------
// --- 1. Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully. 🔗');
        initializeDrivers(); 
    })
    .catch(err => console.error('MongoDB connection error:', err));
// ---------------------------------------------------------------------


// ---------------------------------------------------------------------
// EXPRESS APP INITIALIZATION
const app = express(); 
// ---------------------------------------------------------------------


// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- 3. Serve Frontend Static Files ---
app.use(express.static(path.join(__dirname, '../public')));

// 🛑 FIX: Explicitly serve index.html for the root path (/) 🛑
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});


// --- NEW ROUTING: Auth and Feedback ---
app.use('/api', authRoutes);


// --- 4. API Endpoints (Core Service Logic) ---

/**
 * Helper function to simulate provider matching.
 * Finds the nearest provider based on service type.
 */
function findNearestProvider(serviceType) {
    const available = initialDrivers.filter(p => p.serviceType === serviceType);
    if (available.length > 0) {
        return { 
            id: available[0].driverId, 
            name: available[0].name, 
            eta: 12,
            location: available[0].location
        }; 
    }
    return null; 
}

/**
 * POST /api/request
 */
app.post('/api/request', async (req, res) => {
    const { userId, location, serviceType } = req.body;
    
    const provider = findNearestProvider(serviceType);

    if (!provider) {
        return res.status(404).json({ success: false, message: 'No service providers available nearby.' });
    }

    try {
        const etaTime = new Date(Date.now() + provider.eta * 60000); 
        
        const newRequest = new ServiceRequest({
            userId: userId || 'demo-user-123',
            location: location,
            serviceType: serviceType,
            status: 'Requested',
            providerId: provider.id,
            providerName: provider.name,
            estimatedArrivalTime: etaTime,
        });

        await newRequest.save();
        
        console.log(`[SERVICE] New request created: ${newRequest._id} (Provider: ${provider.name})`);

        res.json({
            success: true,
            requestId: newRequest._id,
            status: newRequest.status,
            providerName: provider.name,
            eta: provider.eta,
        });

    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

/**
 * GET /api/status/:requestId
 */
app.get('/api/status/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
        const request = await ServiceRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }
        
        // --- SIMULATE STATE PROGRESSION ---
        if (request.status === 'Requested') {
            request.status = 'Accepted';
        } else if (request.status === 'Accepted' && Math.random() < 0.3) {
            request.status = 'En Route';
        } else if (request.status === 'En Route' && Math.random() < 0.4) {
            request.status = 'Arrived';
        } else if (request.status === 'Arrived' && Math.random() < 0.5) {
            request.status = 'Completed';
            request.completionTime = new Date();
        }

        await request.save();

        let remainingTime = Math.ceil((request.estimatedArrivalTime - Date.now()) / 60000);
        remainingTime = Math.max(0, remainingTime); 

        res.json({
            success: true,
            status: request.status,
            providerName: request.providerName,
            eta: remainingTime,
        });

    } catch (error) {
        console.error('Error fetching request status:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

/**
 * POST /api/payment/:requestId
 */
app.post('/api/payment/:requestId', async (req, res) => {
    const { requestId } = req.params;
    const { paymentMethod, amount } = req.body;
    
    try {
        const request = await ServiceRequest.findById(requestId);
        
        if (!request || request.status !== 'Completed') {
             return res.status(400).json({ success: false, message: 'Service must be completed before payment.' });
        }

        request.status = 'Paid';
        request.paymentDetails = { 
            method: paymentMethod, 
            amount: parseFloat(amount), 
            transactionId: `TX-${Date.now()}` 
        };
        await request.save();

        console.log(`[PAYMENT] Request ${requestId} paid with ${paymentMethod} for $${amount}.`);

        res.json({
            success: true,
            message: 'Payment processed successfully! Thank you for using MobileCar.',
            transactionId: request.paymentDetails.transactionId
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access App at http://localhost:${PORT}`);
});