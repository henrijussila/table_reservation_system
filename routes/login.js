const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Path to the users JSON file
const usersFilePath = path.join(__dirname, '../users.json');

// Route to serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Route to serve the login page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Route to handle the login form submission
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Read the users JSON file
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users file:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        const users = JSON.parse(data);
        // Check if the user exists
        const user = users.find(user => user.email === email);

        if (!user) {
            // User not found
            return res.status(401).json({ success: false, message: 'Username not found' });
        }

        // Check if the password matches
        if (user.password !== password) {
            // Incorrect password
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Create a session for the user
        req.session.user = { email: user.email };

        // Redirect to the homepage after successful login
        res.redirect('/main');
    });
});

module.exports = router;
