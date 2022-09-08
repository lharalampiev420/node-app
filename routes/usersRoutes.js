const express = require('express');
const usersController = require('../controller/usersController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);

router.route('/resetPassword/:token').patch(authController.resetPassword);

//router.use(authController.protect);

router.route('/me').get(usersController.getMe, usersController.getUser);

router.route('/deleteMe').delete(usersController.deleteMe);

router.route('/updateData').patch(usersController.updateData);

router.route('/updateMyPassword').patch(authController.updatePassword);

//router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(usersController.getAllUsers)
  .post(usersController.createUser);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
