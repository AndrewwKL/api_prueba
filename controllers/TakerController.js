const Course = require('../models/Course');
const Message = require('../models/Message'); 
const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

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

exports.applyCoupon = async (req, res) => {
    const { code } = req.body;

    try {
        // Fetch the authenticated user's cart
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Validate the coupon
        const coupon = await Coupon.findOne({ code, isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or inactive" });
        }

        // Apply the discount to the cart
        cart.discount = coupon.discount;
        await cart.save();

        res.status(200).json({ message: "Coupon applied successfully", discount: coupon.discount });
    } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.checkout = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart || cart.courses.length === 0) {
            return res.status(400).json({ message: "Your cart is empty. Please add courses to your cart before checking out." });
        }

        // Calcular el total
        const total = cart.courses.reduce((acc, item) => acc + item.price, 0);
        const totalWithDiscount = total - (total * (cart.discount / 100));

        // Marcar el carrito como "comprado"
        cart.courses = cart.courses.map(course => ({
            ...course,
            purchased: true // Añadimos una bandera para identificar los cursos comprados
        }));

        await cart.save();

        res.status(200).json({ message: "Checkout successful", total: totalWithDiscount });
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

exports.filterCoursesByCategory = async (req, res) => {
    const { category } = req.query;

    try {
        // Ensure the category query parameter is provided
        if (!category) {
            return res.status(400).json({ message: "Category is required for filtering." });
        }

        // Fetch courses based on the category
        const courses = await Course.find({ category });

        res.status(200).json(courses);
    } catch (error) {
        console.error("Error filtering courses by category:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.viewCourse = async (req, res) => {
    const { id: courseId } = req.params;

    try {
        // Convertir el ID del curso al formato ObjectId
        const courseObjectId = new mongoose.Types.ObjectId(courseId);

        // Buscar si el curso está en el carrito del usuario
        const cart = await Cart.findOne({
            userId: new mongoose.Types.ObjectId(req.user.id),
            "courses.courseId": courseObjectId
        });

        // Si el curso no está en el carrito
        if (!cart) {
            return res.status(403).json({ message: "You do not have access to this course." });
        }

        // Obtener el curso completo
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Enviar el contenido del curso
        res.status(200).json(course);
    } catch (error) {
        console.error("Error accessing course:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getPurchasedCourses = async (req, res) => {
    try {
        // Buscar el carrito del usuario autenticado
        const cart = await Cart.findOne({ userId: req.user.id }).populate('courses.courseId');

        if (!cart || cart.courses.length === 0) {
            return res.status(404).json({ message: "You have not purchased any courses yet." });
        }

        // Filtrar los cursos comprados
        const purchasedCourses = cart.courses
            .filter(course => course.purchased)
            .map(course => ({
                courseId: course.courseId._id,
                title: course.courseId.title,
                description: course.courseId.description,
                price: course.courseId.price,
                category: course.courseId.category
            }));

        if (purchasedCourses.length === 0) {
            return res.status(404).json({ message: "You have not purchased any courses yet." });
        }

        res.status(200).json(purchasedCourses);
    } catch (error) {
        console.error("Error fetching purchased courses:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.viewCart = async (req, res) => {
    try {
        // Buscar el carrito del usuario autenticado
        const cart = await Cart.findOne({ userId: req.user.id }).populate('courses.courseId');

        if (!cart || cart.courses.length === 0) {
            return res.status(404).json({ message: "Your cart is empty." });
        }

        // Formatear los datos del carrito
        const cartDetails = cart.courses.map(course => ({
            courseId: course.courseId._id,
            title: course.courseId.title,
            description: course.courseId.description,
            price: course.price,
            purchased: course.purchased || false // Mostrar si el curso ya fue comprado
        }));

        res.status(200).json(cartDetails);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: error.message });
    }
};