
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async(req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const isNewUser = user.createdAt > oneMonthAgo;
        req.user = decoded,isNewUser;

        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};




