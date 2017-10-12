const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const chatRoomSchema = mongoose.Schema({
	chatroom 		: 	String,
    username       	: 	{ type: Schema.Types.ObjectId, ref: 'User'},
    dateCreated 	: 	{ type: Date, default: Date.now }, // 
});

module.exports = mongoose.model( 'ChatRoom', chatRoomSchema );