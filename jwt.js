const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    // Check if the request headers contain Authorization
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ error: 'Token not found' });
    }

    // Extract the JWT token from the Authorization header
    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        next(); // Call next() to pass control to the next middleware or route handler
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Function to generate token
const generateToken = (userData) => {
    // Generate a JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' }); // Add expiration for better security
};

module.exports = { jwtAuthMiddleware, generateToken };
