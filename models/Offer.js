
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
        max: 100, 
    },
    criteria: {
        type: String,
        enum: ['all', 'new_users', 'long_term_users', 'specific_category'],
        required: true,
        default: 'all', 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date, 
    },
});

module.exports = mongoose.model('Offer', OfferSchema);
