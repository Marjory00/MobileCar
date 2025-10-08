// server/models/User.js
import mongoose from 'mongoose';

// --- Sub-Schemas for complex data ---

// 1. Customer Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String },
    licensePlate: { type: String, unique: true, sparse: true }, // Optional, but unique if present
    isDefault: { type: Boolean, default: false }
}, { _id: false });

// 2. Driver Earnings/Payout Schema
const driverPayoutSchema = new mongoose.Schema({
    jobId: { type: String, required: true },
    serviceType: { type: String },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Completed', 'Pending', 'Paid Out', 'Withdrawal'], 
        default: 'Completed' 
    }
}, { _id: false });


// --- Main User Schema ---
const userSchema = new mongoose.Schema({
    // Core Authentication Fields
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // NOTE: In a production app, the password MUST be hashed (e.g., using bcrypt)
    password: { 
        type: String, 
        required: true 
    },
    role: { // Differentiate between 'customer' and 'driver'
        type: String,
        enum: ['customer', 'driver'],
        default: 'customer'
    },

    // Customer Profile Fields
    vehicles: {
        type: [vehicleSchema],
        default: []
    },
    
    // Driver Profile & Earnings Fields
    driverProfile: {
        isAvailable: { type: Boolean, default: false },
        currentLocation: { // For real-time GPS tracking (simulated by frontend)
            latitude: { type: Number },
            longitude: { type: Number }
        },
        serviceVehicle: { // The vehicle the provider uses for work
            type: vehicleSchema
        },
        earnings: {
            totalEarnings: { type: Number, default: 0.00 },
            withdrawableBalance: { type: Number, default: 0.00 },
            payoutHistory: {
                type: [driverPayoutSchema],
                default: []
            }
        }
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
export default User;