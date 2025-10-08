// server/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Removes leading/trailing whitespace
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
export default User;