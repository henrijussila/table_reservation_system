const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const indexRoutes = require('./routes/index');
const reservationRoutes = require('./routes/reservations');
const tableRoutes = require('./routes/tables');
const questListRoutes = require('./routes/questlist'); 
const loginRoutes = require('./routes/login');
const sessioninfoRoutes = require('./routes/sessioninfo');
const logoutRoutes = require('./routes/logout');

app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware
app.use(session({
    secret: 'yourSecretKey', // TODO: Replace with a strong, secret key
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 20 } // 20-second expiry
    //cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 } // 1-hour expiry
}));

// Middleware to parse the body of the request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use the login route without authentication
app.use('/', loginRoutes);

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated, proceed to the next middleware or route
        console.log('Session is: ', req.session);
        return next();
    } else {
        // User is not authenticated, redirect to the login page
        res.redirect('/login');
    }
}

// Protect the index, reservation, table, and questlist routes
// Only apply this to the routes that need to be protected
app.use('/', isAuthenticated, indexRoutes); 
app.use('/', isAuthenticated, reservationRoutes);
app.use('/', isAuthenticated, tableRoutes);
app.use('/', isAuthenticated, questListRoutes);
app.use('/', isAuthenticated, sessioninfoRoutes);
app.use('/', isAuthenticated, logoutRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
