// server/authRoutes.js

import express from 'express';
import User from './models/User.js';

const router = express.Router();

// 1. POST: User Registration (Signup)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, licensePlate } = req.body;

        // Simple validation (In a real app, hash password and validate inputs)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        const newUser = new User({
            name,
            email,
            password, // Store as plaintext for this demo, but HASH in production!
            licensePlate
        });

        await newUser.save();
        
        // Return a subset of user data (excluding password)
        const userResponse = newUser.toObject();
        delete userResponse.password; 
        
        console.log(`New user registered: ${email}`);
        res.status(201).json({ message: 'Registration successful!', user: userResponse });
        
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error (email already exists)
            return res.status(409).json({ message: 'Email already registered.' });
        }
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
});

// 2. POST: Feedback Submission
router.post('/feedback', async (req, res) => {
    try {
        const { requestId, rating, comment } = req.body;

        if (!requestId || !rating) {
            return res.status(400).json({ message: 'Request ID and rating are required.' });
        }
        
        // NOTE: In a real app, you'd fetch the UserID from the session/token.
        // For the demo, we assume the user is authenticated.

        const newFeedback = new Feedback({
            requestId,
            rating,
            comment,
            // driverId and userId would be populated from the completed service request
        });
        
        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully!' });
        
    } catch (error) {
        console.error('Feedback Submission Error:', error);
        res.status(500).json({ message: 'Internal server error during feedback submission.' });
    }
});


export default router;