// server/models/Feedback.js
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing as a string for simplicity, though often a Mongoose.Types.ObjectId
        required: true
    },
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;