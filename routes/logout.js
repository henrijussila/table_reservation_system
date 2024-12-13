const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
    // Destroy the session and redirect to the login page
    console.log('Logging out user:', req.session);
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Failed to logout' });
        }
        // Clear the session cookie
        res.clearCookie('connect.sid');  // Default cookie name for express-session
        res.redirect('/login');
    });
});

module.exports = router;