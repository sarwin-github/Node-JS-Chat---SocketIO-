const ChatHistoryModel = require('../model/chat-history');
const mongoose         = require('mongoose');
const ChatHistory      = mongoose.model('ChatHistory');

let connectedUsers   = {};
let room;

module.exports.initializeSocketIO = io => {
	let indexConnection = io.of('/index');
	indexConnection.on('connection', socket => { 

		let updateUserlist = () => {
			indexConnection.emit('userlist', Object.keys(connectedUsers));
		};

		// on subscribe, join the room
		socket.on('subscribe', (room) => {
			socket.room = room;
			socket.join(room);
		});

		//everytime a user connect - flash it to screen
		socket.on('connectedUser', users => {
			socket.username       = users;
			connectedUsers[users] = users;
			
			indexConnection.emit('connectedUser', users);
			updateUserlist();
			//reloadChatHistory();
			console.log(`Connected User: ${connectedUsers[users]}`);
		});

		// on disconnect, leave the room and update the list of users
		socket.on('disconnect', user => {
			delete connectedUsers[socket.username];
			updateUserlist();
			socket.leave(socket.room);
			console.log(`Connected User: ${connectedUsers} has leave the room: ${socket.room}`);
		});
	});
};