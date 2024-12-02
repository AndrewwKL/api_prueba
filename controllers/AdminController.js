const User = require('../models/User');
const Offer = require('../models/Offer'); // Make sure to import the Offer model
const Coupon = require('../models/Coupon'); // Make sure to import the Coupon model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Course = require('../models/Course');


// User Management Functions

exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    if (role && !["user", "creator", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided." });
    }

    try {
        // Ensure password and salt rounds are provided
        const hashedPassword = await bcrypt.hash(password, 10); // Add salt rounds explicitly
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.listUsers = async (req, res) => {
    try {

        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const users = await User.find().select("-password").limit(limit).skip(skip);

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

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createFlashSale = async (req, res) => {
    const { title, discount, validCategories, validUserTypes, expiresAt } = req.body;
    if (!title || !discount || !expiresAt) {
        return res.status(400).json({ message: "Title, discount, and expiration date are required" });
    }
    if (discount <= 0 || discount > 100) {
        return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }

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

exports.createUserBasedOffer = async (req, res) => {
    const { title, discount, validUserTypes, expiresAt } = req.body;
    if (!title || !discount || !expiresAt) {
        return res.status(400).json({ message: "Title, discount, and expiration date are required" });
    }
    if (discount <= 0 || discount > 100) {
        return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }

    try {
        const offer = new Offer({
            title,
            discount,
            criteria: 'all',
            validUserTypes: validUserTypes || 'all',
            expiresAt,
            isActive: true,
        });

        await offer.save();
        res.status(201).json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.listUserBasedOffers = async (req, res) => {
    const { userType } = req.query;

    try {
        const currentDate = new Date();
        const offers = await Offer.find({
            validUserTypes: { $in: ['all', userType] },
            isActive: true,
            expiresAt: { $gte: currentDate },
        });

        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminAnalytics = async (req, res) => {
    try {
        // Count users by role
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalCreators = await User.countDocuments({ role: 'creator' });
        const totalTakers = await User.countDocuments({ role: 'user' });

        // Count total courses
        const totalCourses = await Course.countDocuments();

        // Revenue placeholder (if sales tracking exists)
        const totalRevenue = 0; // Replace with actual sales data

        res.status(200).json({
            totalUsers,
            totalAdmins,
            totalCreators,
            totalTakers,
            totalCourses,
            totalRevenue,
        });
    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        res.status(500).json({ message: error.message });
    }
};