const express = require('express');
const usersController = require('../controller/usersController');
const authController = require('../controller/authController');

const router = express.Router();

router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);

router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/deleteMe')
  .delete(authController.protect, usersController.deleteMe);

router
  .route('/updateData')
  .patch(authController.protect, usersController.updateData);

router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);

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
