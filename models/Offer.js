// models/Offer.js
const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100, // Discount as a percentage
    },
    criteria: {
        type: String,
        enum: ['all', 'new_users', 'long_term_users', 'specific_category'],
        required: true,
        default: 'all', // Criteria for applying the offer (you can customize as needed)
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date, // Optional: expiration date for the offer
    },
});

module.exports = mongoose.model('Offer', OfferSchema);
