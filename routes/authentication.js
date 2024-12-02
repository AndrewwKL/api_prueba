const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User"); // Make sure the User model is defined

// Signup route
router.post("/signup", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Create a new user with hashed password
        const user = new User({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: role || "user"
        });

        await user.save();

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ auth: true, token });
    } catch (error) {
        console.error("Error during signup:", error); // For debugging
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Verify that email and password are not undefined or empty
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Compare the entered password with the stored one
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid password" });

        // Generate a JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ auth: true, token });
    } catch (error) {
        console.error("Authentication error:", error); // For debugging
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
