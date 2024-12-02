// models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0  
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: [{
        session: {
            type: Number, // Indicates the session or day
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        url: {
            type: String, // URL of the video or file
            required: true,
        },
        type: {
            type: String, // Content type (video, document, etc.)
            enum: ['video', 'document'],
            required: true,
        },
    }],
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', CourseSchema);
