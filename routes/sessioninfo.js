const express = require('express');
const router = express.Router();

// API route to fetch session info
router.get('/session-info', (req, res) => {
    if (req.session && req.session.user) {
        const now = Date.now();
        const expiresAt = req.session.cookie.expires ? req.session.cookie.expires.getTime() : now;
        const remainingTime = expiresAt - now;

        res.json({
            loggedIn: true,
            email: req.session.user.email,
            remainingTime: Math.max(0, remainingTime) // Ensure we don't return a negative value
        });
        
    } else {
        res.json({
            loggedIn: false,
            email: null,
            remainingTime: 0
        });
    }
});

module.exports = router;
