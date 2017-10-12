const mongoose = require('mongoose');
const ChatRoom = require('../model/chat-room');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will get the chat room based on a parameter
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.getChatHome = (req, res) => {
	let query = ChatRoom.find({}).sort('chatroom');

	query.exec((err, chatrooms) => {
		if(err){
			return res.render('error/error.ejs', { success: false, error: err, message: "Something went wrong." });
		} if(!chatrooms){
			return res.render('error/error.ejs', { success: false, error: '404: Not Found!', 
				message: "The list of chat room does not exist or empty." });
		}

		res.render('chat/chat-home.ejs', 
		{
			chatrooms: chatrooms
		});
	});
};

module.exports.getCreateChatRoomForm = (req, res) => {
	res.render('chat/chat-room-create.ejs', 
	{
		error     : req.flash('error'),
		csrfToken : req.csrfToken(), //anti csurf token,
		user      : req.user
	});
};

module.exports.postCreateChatRoomForm = (req, res) => {
	let query = ChatRoom.findOne({'chatroom': req.body.chatroom});

	query.exec((err, chatrooms) => {
		if(err){
			return res.render('error/error.ejs', { success: false, error: err, message: "Something went wrong." });
		} if(chatrooms){
			req.flash('error', 'Chat room is already taken.');
			return res.redirect(req.get('referer'));
		} else {
			let rooms = new ChatRoom();

			rooms.chatroom = req.body.chatroom;
			rooms.username = req.user._id;

			rooms.save(err => {
				if(err){
					return res.render('error/error.ejs', { success: false, error: err, message: "Something went wrong." });
				}
				req.flash('message', 'Successfully created a new chat room');
				res.redirect('/chat/home');
			});
		}
	});
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This will get the chat room based on a parameter
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.getChatRoom = (req, res) => {
	let query = ChatRoom.find({}).sort('chatroom');

	query.exec((err, chatrooms) => {
		if(err){
			return res.render('error/error.ejs', { success: false, error: err, message: "Something went wrong." });
		} if(!chatrooms){
			return res.render('error/error.ejs', { success: false, error: '404: Not Found!', 
				message: "The list of chat room does not exist or empty." });
		}

		res.render('chat/chat-room.ejs', 
		{
			chatrooms : chatrooms,
			user      : !!req.user ? req.user.username : undefined
		});
	});
};
