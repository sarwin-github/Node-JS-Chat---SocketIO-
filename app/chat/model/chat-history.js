const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const chatHistorySchema = mongoose.Schema({
	room 			: 	String,
    message       	: 	String,
    from		  	: 	String,
    to 				:  	String,
    dateCreated 	: 	{ type: Date, default: Date.now }, // 
});

module.exports = mongoose.model( 'ChatHistory', chatHistorySchema );