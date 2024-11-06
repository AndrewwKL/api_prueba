// models/Coupon.js
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // Ensures coupon codes are unique
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100, // Discount as a percentage
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date, // Optional: expiration date for the coupon
    },
    isActive: {
        type: Boolean,
        default: true, // Allows for soft disabling of a coupon
    },
});

module.exports = mongoose.model('Coupon', CouponSchema);
