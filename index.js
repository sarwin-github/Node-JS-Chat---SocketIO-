const express        = require('express');
const app            = express();
const auth           = require('basic-auth');
const http           = require('http').Server(app);
const io             = require('socket.io')(http);
const session        = require('express-session');
const validator      = require('express-validator');
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const flash          = require('connect-flash');
const morgan         = require('morgan');
const passport       = require('passport');
const methodOverride = require('method-override');
const helmet         = require('helmet');
const dotEnv         = require('dotenv').config();

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Set database connection
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const databaseConfig = require('./config/mongo-db-context');
const env = process.env.NODE_EN || 'dev';
console.log(`NODE_EN: ${env}`);
databaseConfig.pickEnv(env, app, io, passport);
		
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Set view engine and session
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.use(morgan('short')); ///morgan is use for development to test what are the request and response that's being handle
//set helmet
app.disable('x-powered-by');
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'The Force' }));
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.noSniff());
app.use(helmet.frameguard());

app.use(cookieParser());
app.use(validator()); ///validator is a backend validator by express 
app.use(flash()); ///flash can be use to store messages or notification on session

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs'); ///Set the view engine to EJS
app.set('views', __dirname + '/views'); ///Set the views directory
app.use(express.static(__dirname));

///Get the bootstrap, jquery, and font-awesome inside the node_module 
app.use('/js'     , express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js'     , express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css'    , express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/fonts/' , express.static(__dirname + '/node_modules/bootstrap/dist/fonts'));
app.use('/fonts/' , express.static(__dirname + '/node_modules/font-awesome/fonts'));
app.use('/css/'   , express.static(__dirname + '/node_modules/font-awesome/css'));

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Set and Initialize Passport and Authentication
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  res.locals.login   = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.title   = "Chat Project";
  next();
});

//Serialize Users
require('./config/passport-serialize-users');

///Set passport config
require('./app/users/config/passport');

app.use((req, res, next) => {
	req.io = io;
	next();
}); 

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Set and Initialize Routes
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const setRoutes = require('./config/routes-initialization');
setRoutes.initializeRoutes(app);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Socket IO config
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const chat = require('./app/chat/socket/chat.js');
const chatIndex = require('./app/chat/socket/chat-index.js');
chat.initializeSocketIO(io);
chatIndex.initializeSocketIO(io);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Set Error Handler
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
app.use((req, res, next) => {
	let err    = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error   = req.app.get('NODE_EN') === 'dev' || 'local' ? err: {};

	res.status(err.status || 500);
	res.render('error/error.ejs');
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Create Server
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
http.listen(app.get('port'), () => {
	console.log(`Server Listening to Port: ${app.get('port')}`);
});