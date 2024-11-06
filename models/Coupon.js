
const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, 
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date, 
    },
    isActive: {
        type: Boolean,
        default: true, 
    },
});

module.exports = mongoose.model('Coupon', CouponSchema);
