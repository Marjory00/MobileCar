// server/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; // 1. Import Mongoose
import path from 'path'; // 2. Import path for static file serving
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Helper to define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- 2. Mongoose Schemas and Models ---

// Define the Service Request Schema
const serviceRequestSchema = new mongoose.Schema({
    id: String, // Used for client-side matching (from Date.now())
    serviceType: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // Pending, Accepted, In Progress, Completed
    driverId: String,
    price: Number,
    createdAt: { type: Date, default: Date.now },
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

// Define the Driver Schema
const driverSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    status: { type: String, default: 'offline' }, // online, offline
    lat: Number,
    lon: Number,
    plate: String
});

const Driver = mongoose.model('Driver', driverSchema);

// --- Initialization: Ensure Demo Drivers Exist ---
async function initializeDrivers() {
    // Only add drivers if the collection is empty
    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
        const demoDrivers = [
            { id: 'DRV-001', name: 'Sarah K.', status: 'online', lat: 40.71, lon: -74.00, plate: 'XYZ-5432' },
            { id: 'DRV-002', name: 'Mike J.', status: 'offline', lat: 40.72, lon: -74.01, plate: 'ABC-1234' }
        ];
        await Driver.insertMany(demoDrivers);
        console.log('Demo drivers added to the database.');
    }
}
// Run driver initialization after successful connection
mongoose.connection.once('open', initializeDrivers);


// Middleware
app.use(cors());
app.use(express.json());

// --- 3. Serve Frontend Static Files ---
app.use(express.static(path.join(__dirname, '../public')));


// --- 4. API Endpoints (Now using Mongoose) ---

// 1. POST: Create a new service request
app.post('/api/request', async (req, res) => {
    const { serviceType, location } = req.body;
    
    const price = serviceType === 'flat-tire' ? 75.00 : serviceType === 'locksmith' ? 150.00 : 50.00;

    const newRequestData = {
        id: Date.now().toString(),
        serviceType,
        location,
        status: 'Pending',
        price,
    };

    let newRequest = new ServiceRequest(newRequestData);

    // Simulate driver matching and acceptance
    const availableDriver = await Driver.findOne({ status: 'online' }).lean();
    
    if (availableDriver) {
        newRequest.driverId = availableDriver.id;
        newRequest.status = 'Accepted';
        console.log(`Request ${newRequest.id} matched to ${availableDriver.name}`);
        
        // Simulate status progression after a delay (In Progress)
        setTimeout(async () => {
            await updateRequestStatus(newRequest.id, 'In Progress');
        }, 5000);
    }
    
    newRequest = await newRequest.save();
    res.status(201).json(newRequest);
});

// 2. GET: Get status of a specific request
app.get('/api/request/:id', async (req, res) => {
    const request = await ServiceRequest.findOne({ id: req.params.id }).lean();
    
    if (!request) {
        return res.status(404).json({ message: 'Request not found' });
    }
    
    // Attach driver details for the frontend
    if (request.driverId) {
        request.driver = await Driver.findOne({ id: request.driverId }, 'name plate').lean(); // Only fetch name and plate
        request.eta = request.status === 'Accepted' ? '15 minutes' : request.status === 'In Progress' ? 'Arrived!' : null;
    }

    res.json(request);
});

// 3. PUT: Update request status (e.g., Driver completes service or Customer cancels)
app.put('/api/request/:id/status', async (req, res) => {
    const { status } = req.body;
    
    const updatedRequest = await ServiceRequest.findOneAndUpdate(
        { id: req.params.id }, 
        { status: status }, 
        { new: true } // Return the updated document
    );
    
    if (updatedRequest) {
        console.log(`Request ${updatedRequest.id} status updated to: ${status}`);
        res.json(updatedRequest);
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
});

// Helper to update status (used by setTimeout)
async function updateRequestStatus(id, status) {
    // Note: This helper doesn't need to return the doc or handle response
    await ServiceRequest.findOneAndUpdate({ id: id }, { status: status });
}

// 4. GET: Driver Dashboard - Get all pending/active requests
app.get('/api/driver/requests', async (req, res) => {
    const activeRequests = await ServiceRequest.find({ 
        // Find requests that are NOT Completed or Cancelled
        status: { $nin: ['Completed', 'Cancelled'] } 
    }).lean();
    res.json(activeRequests);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Access App at http://localhost:${PORT}`);
});