// server/models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    // Core Links
    jobId: {
        type: String, // Link to the specific job (e.g., JOB-123)
        required: true,
        index: true
    },
    
    // Actors
    submittedBy: { // The User ID of the person *giving* the feedback
        type: String, 
        required: true
    },
    submittedFor: { // The User ID of the person *receiving* the feedback (customer or driver)
        type: String,
        required: true,
        index: true
    },
    
    // Feedback Direction/Type
    feedbackType: {
        type: String,
        enum: ['customer_to_driver', 'driver_to_customer'],
        required: true
    },

    // Rating Details
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Optional: Structured reasons for low ratings (e.g., 'Late', 'Unprofessional')
    reasonTags: {
        type: [String],
        default: []
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;