const express = require('express');
const csrf    = require('csurf');
const router  = express();

const chatController = require('../controller/chat-controller');
const chatMiddleware = require('../middleware/user-middleware');

const csrfProtection = csrf();
router.use(csrfProtection);

router.route('/').get(chatController.getChatHome);
router.route('/home').get(chatController.getChatHome);

router.route('/rooms/create').get(chatMiddleware.isLoggedIn, 
								chatController.getCreateChatRoomForm)
							 .post(chatMiddleware.isLoggedIn, 
							 	chatController.postCreateChatRoomForm);

router.route('/rooms/:room').get(//chatMiddleware.isLoggedIn, 
								chatController.getChatRoom);

module.exports = router;
