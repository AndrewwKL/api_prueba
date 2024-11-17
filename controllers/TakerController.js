// controllers/TakerController.js
const Course = require('../models/Course');
const Message = require('../models/Message'); // Import the Message model

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
const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
    const { courseId } = req.body;
    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        let cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart) {
            cart = new Cart({ userId: req.user.userId, courses: [{ courseId, price: course.price }] });
        } else {
            cart.courses.push({ courseId, price: course.price });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
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
    try {
        const cart = await Cart.findOne({ userId: req.user.userId });
        if (!cart || cart.courses.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const total = cart.courses.reduce((acc, item) => acc + item.price, 0);
        const totalWithDiscount = total - (total * (cart.discount / 100));

        // Aquí podrías integrar una API de pago para procesar el pago real

        // Vaciar el carrito después del pago
        await Cart.findByIdAndDelete(cart._id);

        res.status(200).json({ message: 'Purchase successful', total: totalWithDiscount });
    } catch (error) {
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
