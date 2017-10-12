const mongoose       = require('mongoose');
const Users          = require('../model/user');
const csrf           = require('csurf');
const async          = require('async');
const passport       = require('passport');
const csrfProtection = csrf();


// get list of users
module.exports.getListOfUsers = (req, res) => {
	let query = Users.find({}).select({'__v': 0, 'password': 0});

	query.exec((err, users) => {
		if(err){
			return res.status(500).json({ 
				sucess  : false, 
				error   : err, 
				message : 'Server error.'
			});
		} if(!users){
			return res.status(404).json({
				sucess  : false,
				message : 'A list of users does not exist.'
			});
		}

		res.render('users/users-list.ejs',
		{
			success   : true, 
			message   : 'Successfully fetched the list of users.',
			messages  : req.flash('message'),
			users     : users,
			csrfToken : req.csrfToken() //anti csurf token
		});
	});
};

// create new user
module.exports.getCreateUserForm = (req, res) => {
	res.render('users/user-signup.ejs', 
	{
		error         : req.flash('error'),
		csrfToken     : req.csrfToken() //anti csurf token
	});
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will execute HTTP post for creating a new user
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// To create a user user without stripe validation, use this instead
module.exports.postCreateUserForm = (req, res, next) => {
  	// A middleware for signup
  	// Authenticate signup using passport local
  	passport.authenticate('local.user.signup', (err, user, info) => {
	  	// If there's error, set the error message then execute the next error
	  	if (err) { 
	  	    req.flash('error', err);
	  	    return next(err); 
	  	} 
	  	// If there's error in user
	  	if (!user) {
	  		// If there's error message, set the error message from info.messages
	  	    if(!!info){
	  	        req.flash('error', info.message);     
	  	    }
	  	    return res.redirect('/users/signup');
	    } 
  		// If there's no error with the sign up
	  	req.login(user, err => {
  		  	if (!err){
  		    	req.flash('message', 'Registration successful. Thank you for using our product.');
  		    	return res.redirect('/chat/home');  
  		  	}
  	    });
  	})(req, res, next);  	
}; 

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will render the Login Page
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/* This is the start for login functions */
module.exports.getLoginUserForm = (req, res) => {
	res.render('users/user-login.ejs',
	{ 
        error     : req.flash('error'),
        csrfToken : req.csrfToken()
    });
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will autenticate center login
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.postLoginUserForm = (req, res, next) => {
	passport.authenticate('local.user.login', (err, user, info) => {
	    if (err) { 
	        req.flash('error', err);
	        return next(err); 
	    } 
	    if (!user) {
	        if(!!info){
	            req.flash('error', info.message);    
	        }
	        return res.redirect('/users/login'); 
	    }
	    // If there's no error with the sign up
	  	req.login(user, err => {
  		  	if (!err){
  		    	return res.redirect('/chat/home');  
  		  	}
  	    });
	})(req, res, next);
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will destroy the session and call logout function from passport
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.getLogout = (req, res) => {
	req.logout();
	req.session.destroy();
	res.redirect('/chat/home');
};

/*
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will autenticate center login
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.postLogin = (req, res, next) => {
	passport.authenticate('local.center.login', (err, user, info) => {
	    if (err) { 
	        req.flash('error', err);
	        return next(err); 
	    } 
	    if (!user) {
	        if(!!info){
	            req.flash('error', info.message);    
	        }
	        return res.redirect('/center/login'); 
	    }
	    req.logIn(user, err => {
	    	loginErrorRedirect(req, res, next, err);
	    });
	})(req, res, next);
};

// http post for creating new random name
module.exports.postCreateRandomName = (req, res) => {
	let person = new People();

	person.name = req.body.name;
	person.country = req.body.country

	person.save((err) => {
		if(err){
		    return res.status(500).json({success: false, message: 'Something went wrong.'});
		}
		req.flash('message', 'Successfully added a random person.');
		res.redirect('/random/name/list');
	});
};

// get the form for editing a person
module.exports.getEditRandomName = (req, res) => {
	let query = People.findById({ _id: req.params.id }).select({'__v': 0});

	query.exec((err, person) => {
		if(err){
			return res.status(500).json({ 
				sucess  : false, 
				error   : err, 
				message : 'Server error.'
			});
		} if(!person){
			return res.status(404).json({
				sucess  : false,
				message : 'The person you are looking for does not exist.'
			});
		}

		res.render('people/edit-random-people.ejs', {
			person    : person,
			csrfToken : req.csrfToken() //anti csurf token
		});
	});
};

// http put for updating a person
module.exports.putEditRandomName = (req, res) => {
	async.waterfall([
		// find person by id
	    (callback) => {
	      	let query = People.findById({ _id: req.params.id }).select({'__v': 0});

  	      	query.exec((err, person) => {
  		        if(!person){
        			return res.status(404).json({
        				sucess  : false,
        				message : 'The person you are looking for does not exist.'
        			});
        		}

  		        callback(err, person);
  	      	});
	    }, 
	    // update person
	    (person, callback) => {
	    	person.name     = req.body.name;
	    	person.country  = req.body.country;
	    	person.address  = req.body.address;
	    	person.birthday = req.body.birthday;
	    	person.age      = req.body.age;

	    	person.save(err => {
	    		callback(err, person);
	    	});
	    }], (err) => {
		    if(err) {
		    	return res.status(500).json({ 
		    		sucess  : false, 
		    		error   : err, 
		    		message : 'Server error.'
		    	});
		    }
		    req.flash('message', 'Successfully updated a person');
		    res.redirect('/random/name/list');
	});
};

// get the form for editing a person
module.exports.getDetailsRandomName = (req, res) => {
	let query = People.findById({ _id: req.params.id }).select({'__v': 0});

	query.exec((err, person) => {
		if(err){
			return res.status(500).json({ 
				sucess  : false, 
				error   : err, 
				message : 'Server error.'
			});
		} if(!person){
			return res.status(404).json({
				sucess  : false,
				message : 'The person you are looking for does not exist.'
			});
		}

		res.render('people/details-random-people.ejs', {
			person : person
		});
	});
};

// delete a person
module.exports.deleteRandomName = (req, res) => {
	let query = People.findOneAndRemove({ _id: req.params.id });

	query.exec((err, person) => {
		if(err){
			return res.status(500).json({ 
				sucess  : false, 
				error   : err, 
				message : 'Server error.'
			});
		} if(!person){
			return res.status(404).json({
				sucess  : false,
				message : 'The person you are looking for does not exist.'
			});
		}

		req.flash('message', 'Person has been successfully deleted.');
		res.redirect('/random/name/list');
	});
};

*/