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
    validUserTypes: {
        type: String,
        enum: ['all', 'new_users', 'long_term_users'],
        default: 'all', // Defaults to all users
    },
    isFlashSale: {
        type: Boolean,
        default: false, // Indicates if the offer is a flash sale
    },
    validCategories: [{
        type: String, // Categories to which the flash sale applies
    }],
    validUserTypes: {
        type: String,
        enum: ['all', 'new_users', 'long_term_users'],
        default: 'all',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date, // Optional: expiration date for the offer
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('Offer', OfferSchema);
