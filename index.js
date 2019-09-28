

'use strict';

/*!
 * Module dependencies
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const responseTime = require('response-time');
const responsePoweredBy = require('response-powered-by');
const passport = require('passport');
const http = require('http');
const flash = require('connect-flash');
const morgan = require('morgan');
const path = require('path');
const serveStatic = require('express').static;
const serveFavicon = require('serve-favicon');
const bodyParser = require('body-parser');

const app = express();
require('./lib/conn');
// Set express server port
app.set('port', process.env.PORT || 5000);
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(serveFavicon(path.join(__dirname, 'public/favicon.ico')));
app.use(bodyParser.urlencoded({extended: false, inflate: true}));
app.use(bodyParser.json({strict: true, inflate: true}));


// Set the cookie parser middleware
app.use(cookieParser("nicknaso-secret-cookie-key"));

// Set the session middleware

// Option for session
let sessOpts = {
    secret: "nicknaso-secret-session-cookie-key",
    name: "NickNaso.SID",
    resave: true,
    saveUninitialized: false,
    cookie: {
        "secure": false,
        "maxAge": 3600000
    }
};
app.use(session(sessOpts));

// Set connect flash middleware
app.use(flash());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


////////////////////////////////////////////////////////////////////////////////
// Attach cutom passport configuration
require('./lib/passport-config');

////////////////////////////////////////////////////////////////////////////////

/**
 * Routes for the application
 */


app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', {user: req.user});
    } else {
        res.redirect('/login');
    }
});

////////////////////////////////////////////////////////////////////////////////

app.get('/login', (req, res) => {
    res.render('login', {error: req.flash("error")});
});


// Options for authentication route
let authOpts = {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}

// Authentication route
app.post('/login', passport.authenticate(authOpts));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

////////////////////////////////////////////////////////////////////////////////

// Create http server and attach express app on it
http.createServer(app).listen(app.get('port'), '0.0.0.0', () => {
    console.log("Server started at http://localhost:" + app.get('port') + "/");
});
