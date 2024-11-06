// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Extract the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Log the token and JWT secret for debugging
    console.log("Token received:", token);
    console.log("JWT Secret:", process.env.JWT_SECRET);

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

console.log("JWT Secret:", process.env.JWT_SECRET); 


