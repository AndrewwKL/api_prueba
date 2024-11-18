// models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        price: Number,
        purchased: {
            type: Boolean,
            default: false // Los cursos añadidos al carrito no están comprados por defecto
        }
    }],
    discount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', CartSchema);
