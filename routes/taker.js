const express = require('express');
const router = express.Router();
const TakerController = require('../controllers/TakerController');
const auth = require('../middleware/auth'); // Middleware de autenticación

// Rutas para gestión de cursos
router.get('/courses', auth, TakerController.filterCourses);

// Rutas para carrito
router.post('/cart', auth, TakerController.addToCart);
router.delete('/cart', auth, TakerController.removeFromCart);
router.post('/cart/apply-coupon', auth, TakerController.applyCoupon);

// Rutas para checkout y contacto con el instructor
router.post('/checkout', auth, TakerController.checkout);
router.post('/contact-instructor', auth, TakerController.contactInstructor);


module.exports = router;
