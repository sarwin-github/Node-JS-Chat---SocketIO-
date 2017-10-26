const ChatHistoryModel = require('../model/chat-history');
const mongoose         = require('mongoose');
const ChatHistory      = mongoose.model('ChatHistory');

let connectedUsers     = {};
let userInRoom         = [];
let room;

module.exports.initializeSocketIO = io => {
	io.on('connection', socket => { 
		room = socket.handshake.query;

		let updateUserlist = () => {
			io.to(socket.room).emit('userlist', Object.keys(connectedUsers));
		};

		// This will load chat from history to database
		let reloadChatHistory = () => {
			let query = ChatHistory.find({'room': socket.room}).select({'__v': 0});
			query.exec((err,chat) => {
				if(err) throw err;
				socket.emit('loadChatHistory', chat);
			});
		};

		// This will save the chat to database
		let saveToChatHistory = (from, msg) => {
			let newMessage = new ChatHistory({ 
				message: msg, 
				from: from, 
				room: socket.room
			});

			newMessage.save(err => {
				if(err) throw err;
				io.to(socket.room).emit('chatMessage', from, msg);
				io.of('/index').to(socket.room).emit('chatMessage', from, msg);
				//console.log(`Message From: ${from} \n ${msg}`);
			});
		};

		// On connect Join a room
		socket.on('subscribe', room => {
			userInRoom.push(connectedUsers[socket.username]);

			socket.room = room;
			socket.join(room); 
		});

		//everytime a user connect - flash it to screen
		socket.on('connectedUser', users => {
			socket.username       = users;
			connectedUsers[users] = users;


			console.log('userInRoom: ' + userInRoom.map(val => val));
			console.log(connectedUsers);

			io.to(socket.room).emit('connectedUser', users);
			io.to(socket.room).emit('subscribe', console.log(`\n${socket.username} has joined the room: ${socket.room}`));
			
			// Get chat history
			reloadChatHistory();
			updateUserlist();
		});

		// on chat message, store the messages to the database
		socket.on('chatMessage', (from, msg) => {
			let socketID = Object.keys(connectedUsers);
			saveToChatHistory(from,msg);
		});

		// broadcast currently typing user
		socket.on('showTypingUser', user => {
			socket.broadcast.to(socket.room).emit('showTypingUser', user);
		});

		socket.on('disconnect', user => {
			delete connectedUsers[socket.username];
			io.to(socket.room).emit('disconnect', user);

			userInRoom.splice(userInRoom.indexOf({username: socket.username}), 1);
			updateUserlist();

			socket.leave(socket.room);
			//console.log(`\n- ${socket.username} has leave the room: ${socket.room}. -`);
		});
	});
};
