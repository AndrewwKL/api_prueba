const Course = require('../models/Course');
const Message = require('../models/Message'); 
const Cart = require('../models/Cart');
const mongoose = require('mongoose');

exports.filterCourses = async (req, res) => {
    const { category, minPrice, maxPrice, minRating } = req.query;
    try {
        const query = {};

        if (category) query.category = category;
        if (minPrice || maxPrice) query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        if (minRating) query.ratings = { $gte: parseFloat(minRating) };

        const courses = await Course.find(query);
        const currentDate = new Date();
        const flashSales = await Offer.find({
            isFlashSale: true,
            expiresAt: { $gte: currentDate },
        });
        const userOffers = await Offer.find({
            validUserTypes: { $in: ['all', userType] },
            isActive: true,
            expiresAt: { $gte: currentDate },
        });

        const updatedCourses = courses.map(course => {
            const applicableFlashSale = flashSales.find(sale =>
                (!sale.validCategories.length || sale.validCategories.includes(course.category))
            );

            if (applicableFlashSale) {
                course.price = course.price - (course.price * (applicableFlashSale.discount / 100));
            }

            const applicableOffer = userOffers.find(offer =>
                (!offer.validCategories || offer.validCategories.includes(course.category))
            );

            if (applicableOffer) {
                course.price = course.price - (course.price * (applicableOffer.discount / 100));
            }
            return course;
        });

        res.status(200).json(updatedCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToCart = async (req, res) => {
    const { courseId } = req.body;

    try {
        // Validate the course exists
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Convert user ID to ObjectId
        const userId = new mongoose.Types.ObjectId(req.user.id);

        console.log("Authenticated User ID:", userId); // Debugging log

        // Find or create a cart for the user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, courses: [] }); // Ensure userId is set as ObjectId
        }

        // Check if the course is already in the cart
        const courseExists = cart.courses.some(item => item.courseId.toString() === courseId);
        if (courseExists) {
            return res.status(400).json({ message: "Course is already in the cart." });
        }

        // Add the course to the cart
        cart.courses.push({ courseId, price: course.price });
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error adding course to cart:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.removeFromCart = async (req, res) => {
    const { courseId } = req.body;
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.courses = cart.courses.filter(item => item.courseId.toString() !== courseId);
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const Coupon = require('../models/Coupon');

exports.applyCoupon = async (req, res) => {
    const { code } = req.body;
    try {
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found or inactive' });

        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.discount = coupon.discount;
        await cart.save();

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.checkout = async (req, res) => {
    const { cardNumber, expiryDate, cvv } = req.body;

    try {
        // Fetch the cart for the authenticated user
        const cart = await Cart.findOne({ userId: req.user.id }).populate('courses.courseId');
        if (!cart || cart.courses.length === 0) {
            return res.status(400).json({ message: "Your cart is empty. Please add courses to your cart before checking out." });
        }

        // Simulate payment details (no validation)
        console.log("Simulated Payment Details:");
        console.log(`Card Number: ${cardNumber}`);
        console.log(`Expiry Date: ${expiryDate}`);
        console.log(`CVV: ${cvv}`);

        // Calculate total price with optional discount
        const subtotal = cart.courses.reduce((sum, item) => sum + item.price, 0);
        const total = subtotal - (subtotal * (cart.discount / 100));

        // Simulate payment success
        console.log(`Payment successful. Total charged: $${total.toFixed(2)}`);

        // Clear the cart after checkout
        await Cart.findByIdAndDelete(cart._id);

        res.status(200).json({
            message: "Checkout successful",
            total: total.toFixed(2),
        });
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.contactInstructor = async (req, res) => {
    const { courseId, message } = req.body;

    try {
        const course = await Course.findById(courseId).populate('creatorId', 'name email');
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const instructor = course.creatorId;

        // Save the message in the database
        const savedMessage = await Message.create({
            courseId,
            instructorId: instructor._id,
            takerId: req.user.id,
            message,
        });

        res.status(200).json({
            message: "Message sent successfully",
            instructor: {
                name: instructor.name,
                email: instructor.email,
            },
            savedMessage,
        });
    } catch (error) {
        console.error("Error sending message to instructor:", error);
        res.status(500).json({ message: error.message });
    }
};
