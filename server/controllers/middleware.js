// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//     const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the header
//     if (!token) return res.sendStatus(401); // If no token, unauthorized

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403); // If token is invalid, forbidden
//         req.user = user; // Attach the user information to the request
//         next(); // Proceed to the next middleware or route handler
//     });
// };

// module.exports = { authenticateToken };