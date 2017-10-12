const session    = require('express-session');
const mongoose   = require('mongoose');
const mongoStore = require('connect-mongo')(session);

// Local connection
let mongoConnectionLocal = {	
	'url': `mongodb://${process.env.MongoDBLocalUser}:${process.env.MongoDBLocalPassword}@127.0.0.1:27017/ChatProject`
};

// Local connection
let mongoConnectionOnline = {	
	'url': `mongodb://${process.env.MLabDBUser}:${process.env.MLabDBPassword}@ds149724.mlab.com:49724/ChatProject`
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Session storage and database configuration 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.pickEnv = (env, app) => {
	mongoose.Promise = global.Promise;
	switch (env) {
		case 'local':
	    	app.set('port', process.env.PORT || 4000);
	        mongoose.connect(mongoConnectionLocal.url, {auth:{authdb:"admin"}},  
	        	err => { if(err) { console.log(err); }});
			break;
		case 'dev':
    		app.set('port', process.env.PORT || 4000);
    	    mongoose.connect(mongoConnectionOnline.url, 
    	    	err => { if(err) { console.log(err); }}); 
    	    break;
	};

	// Set session and cookie max life, store session in mongo database
	app.use(session({
		secret : process.env.sessionKey,    
		resave : true,
	  	saveUninitialized: false, 
		store  : new mongoStore({ mongooseConnection: mongoose.connection }),
		cookie : { maxAge: 60 * 60 * 1000}
	}));
};
