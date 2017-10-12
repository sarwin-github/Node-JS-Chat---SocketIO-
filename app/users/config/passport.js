const passport      = require('passport');
const mongoose      = require('mongoose');
const Users         = require('../model/user');
const LocalStrategy = require('passport-local').Strategy;

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Passport Strategy for creating new user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.use('local.user.signup', new LocalStrategy({
    // Get the username field and password field on req.body
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // This is the Backend Validation using express-validator
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Invalid Credentials, Please check email.').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required.').notEmpty();
    req.checkBody('password', 'Password should atleast contain more than six characters.').isLength({min:6});

    // Validate Error
    let errors = req.validationErrors();
    // If there's error push the error to messages[index] = error array
    if (errors) {
        let messages = [];
        errors.forEach((error) => {
           messages.push(error.msg);
        });

        // If there's error, create an alert that there's error, if you want to modify flash messages
        // set flash messages error info: req.flash('error', "Invalid Credentials, Please check username or password")
        return done(null, false, req.flash('error', messages));
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // A query that will search for an existing user in the mongo database
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Users.findOne({$or: [{'username': username}, {'email': req.body.email}]}, (err, users)  => {
        if (err) {
            return done(err);
        } console.log(users)
        if (users) {
            return done(null, false, {message: 'That email or username is already taken!'});
        }

        let user = new Users();

        user.username = username;
        user.email    = req.body.email;
        user.password = user.generateHash(password);
        
        user.save((err, result)  => {
            if (err) {
                return done(err);
            } 
            return done(null, user);
        });
    });
}));


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Passport Strategy for Logging a user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
passport.use('local.user.login', new LocalStrategy({
    // Get the username field and password field on req.body
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // Check if username or password is empty, then validate error using the express-validator module
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    req.checkBody('username', 'Invalid Credentials, Please check username.').notEmpty();
    req.checkBody('password', 'Invalid Credentials, Please check password').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        let messages = [];
        errors.forEach((error) => {
            messages.push(error.msg);
        });

    // If there's error, create an alert that there's error, if you want to modify flash messages
    // set flash messages error info: req.flash('error', "Invalid Credentials, Please check username or password")  
    return done(null, false, req.flash('error', messages));
    }

    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // A query that will search for an existing user in the mongo database
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Users.findOne({$or: [{'username': username}, {'email': username}]}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'The user does not exist. Click sign up to register.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Password is invalid, Please check your password and try again.'});
        }
        return done(null, user);
    });
}));