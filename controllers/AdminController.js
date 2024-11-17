const User = require('../models/User');
const Offer = require('../models/Offer'); // Make sure to import the Offer model
const Coupon = require('../models/Coupon'); // Make sure to import the Coupon model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');




// User Management Functions

exports.createUser = async (req, res) => {
   const { name, email, password, role } = req.body;
   try {
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = new User({ name, email, password: hashedPassword, role });
       await user.save();
       res.status(201).json(user);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.listUsers = async (req, res) => {
   try {
       const users = await User.find().select('-password');
       res.status(200).json(users);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.updateUserRole = async (req, res) => {
   const { id } = req.params;
   const { role } = req.body;
   try {
       const user = await User.findByIdAndUpdate(id, { role }, { new: true });
       if (!user) return res.status(404).json({ message: 'User not found' });
       res.status(200).json(user);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.deleteUser = async (req, res) => {
   const { id } = req.params;
   try {
       const user = await User.findByIdAndDelete(id);
       if (!user) return res.status(404).json({ message: 'User not found' });
       res.status(200).json({ message: 'User deleted successfully' });
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

// Offer Management Functions

exports.createOffer = async (req, res) => {
   const { title, discount, criteria } = req.body;
   try {
       const offer = new Offer({ title, discount, criteria });
       await offer.save();
       res.status(201).json(offer);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.listOffers = async (req, res) => {
   try {
       const offers = await Offer.find();
       res.status(200).json(offers);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.updateOffer = async (req, res) => {
   const { id } = req.params;
   const { title, discount, criteria } = req.body;
   try {
       const offer = await Offer.findByIdAndUpdate(id, { title, discount, criteria }, { new: true });
       if (!offer) return res.status(404).json({ message: 'Offer not found' });
       res.status(200).json(offer);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.deleteOffer = async (req, res) => {
   const { id } = req.params;
   try {
       const offer = await Offer.findByIdAndDelete(id);
       if (!offer) return res.status(404).json({ message: 'Offer not found' });
       res.status(200).json({ message: 'Offer deleted successfully' });
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

// Coupon Management Functions

exports.createCoupon = async (req, res) => {
   const { code, discount } = req.body;
   try {
       const coupon = new Coupon({ code, discount });
       await coupon.save();
       res.status(201).json(coupon);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.listCoupons = async (req, res) => {
   try {
       const coupons = await Coupon.find();
       res.status(200).json(coupons);
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.deleteCoupon = async (req, res) => {
   const { id } = req.params;
   try {
       const coupon = await Coupon.findByIdAndDelete(id);
       if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
       res.status(200).json({ message: 'Coupon deleted successfully' });
   } catch (error) {
       res.status(500).json({ message: error.message });
   }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,  // Ensure this secret is set correctly
            { expiresIn: '1h' }
        );
        

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFlashSale = async (req, res) => {
    const { title, discount, validCategories, validUserTypes, expiresAt } = req.body;

    try {
        const flashSale = new Offer({
            title,
            discount,
            isFlashSale: true,
            validCategories,
            validUserTypes: validUserTypes || 'all',
            expiresAt,
        });

        await flashSale.save();
        res.status(201).json(flashSale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.listFlashSales = async (req, res) => {
    try {
        const currentDate = new Date();
        const flashSales = await Offer.find({
            isFlashSale: true,
            expiresAt: { $gte: currentDate },
        });

        res.status(200).json(flashSales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
