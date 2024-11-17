const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const auth = require('../middleware/auth'); // Authentication middleware
const adminauth = require('../middleware/adminAuth');  // Admin authorization middleware 

// User Management Routes
router.post('/createUser', auth ,adminauth, AdminController.createUser);
router.get('/users', auth, adminauth, AdminController.listUsers);
router.put('/users/:id', auth, adminauth, AdminController.updateUserRole);
router.delete('/users/:id', auth, adminauth, AdminController.deleteUser);

// Offer Management Routes
router.post('/offers', auth ,adminauth, AdminController.createOffer);
router.get('/offers', auth ,adminauth, AdminController.listOffers);
router.put('/offers/:id', auth ,adminauth, AdminController.updateOffer);
router.delete('/offers/:id', auth ,adminauth, AdminController.deleteOffer);

// Coupon Management Routes
router.post('/coupons', auth ,adminauth, AdminController.createCoupon);
router.get('/coupons', auth ,adminauth,AdminController.listCoupons);
router.delete('/coupons/:id', auth, adminauth ,AdminController.deleteCoupon);

// Flash Sales Routes
router.post('/flash-sales', auth, adminauth, AdminController.createFlashSale);
router.get('/flash-sales', auth, adminauth, AdminController.listFlashSales);


// User-Based Offer Routes
router.post('/user-based-offers', auth, adminauth, AdminController.createUserBasedOffer);
router.get('/user-based-offers', auth, adminauth, AdminController.listUserBasedOffers);

router.post('/login', AdminController.login);

module.exports = router;
