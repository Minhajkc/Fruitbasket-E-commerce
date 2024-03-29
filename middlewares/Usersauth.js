const jwt = require('jsonwebtoken');
const User = require('../models/UserModel')

// Secret key for signing JWT tokens
const JWT_SECRET = 'your_secret_key';

// Function to generate a JWT token
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
}


// Middleware function to verify JWT token
function verifyToken(req, res, next) {
    const token = req.cookies.token; // Retrieve token from cookies

    if (!token) {
        return res.status(403).json({ message: 'Token is required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
}


function verifyToken1(req, res, next) {
    const token = req.cookies.token; // Retrieve token from cookies
    if (!token) {
            next();
    } else {
        return res.redirect('/home')
    }
}

function checkLoggedIn(req, res, next) {
    if (req.cookies.token) {
        return res.redirect('/home');
    }
    next(); // Proceed to the next middleware or route handler
}


module.exports = {
    generateToken,
    verifyToken,
    verifyToken1,
    checkLoggedIn
};
