const express   = require('express');
const csrf      = require('csurf');
const router    = express();

const userController = require('../controller/user-controller');

const csrfProtection = csrf();
router.use(csrfProtection);

// get all users
//router.route('/').get(userController.getListOfUsers);
//router.route('/list').get(userController.getListOfUsers);

//signup
router.route('/signup').get(userController.getCreateUserForm)
					   .post(userController.postCreateUserForm);

//login
router.route('/login').get(userController.getLoginUserForm)
					   .post(userController.postLoginUserForm);	

//logout
router.route('/logout').get(userController.getLogout);

/*
// create new random people
router.route('/create').get(randomNameGeneratorController.getCreateRandomName)
					   .post(randomNameGeneratorController.postCreateRandomName);

// edit a generated random person
router.route('/edit/:id').get(randomNameGeneratorController.getEditRandomName)
						 .put(randomNameGeneratorController.putEditRandomName);

// get details of generated random person
router.route('/detail/:id').get(randomNameGeneratorController.getDetailsRandomName);


// delete a generated random person
router.route('/delete/:id').delete(randomNameGeneratorController.deleteRandomName);
*/
module.exports = router;