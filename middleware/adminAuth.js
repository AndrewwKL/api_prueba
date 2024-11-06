// middleware/adminAuth.js
module.exports = (req, res, next) => {
    // Check if the user is authenticated and has a role of 'admin'
    if (req.user && req.user.role === 'admin') {
        next(); // Continue if user is admin
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};
