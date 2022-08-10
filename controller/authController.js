//const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({ status: 'success', token, data: { user: newUser } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({ status: 'success', token });
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //checks if user is logged
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      [, token] = req.headers.authorization.split(' ');
    }
    if (!token) {
      return next(new AppError('You are not logged in !', 401));
    }

    // verify jwt token
    //const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exist (might be deleted from db)
    const freshUser = await User.findById(decoded.id);

    if (!freshUser) {
      return next(new AppError('User does not exist !', 401));
    }

    // check if password has been changed
    if (freshUser.changedPassword(decoded.iat)) {
      return next(
        new AppError('Password has been changed! Please log in again !', 401)
      );
    }

    // Attach the user to the req object in otder to use it in the next middleware in the stack
    req.user = freshUser;
    console.log(req.user);

    next();
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission for this action !', 401)
      );
    }
    next();
  };

exports.forgotPassword = async (req, res, next) => {
  // Create a reset password token
  const user = await User.findOne({ email: req.body.email });

  try {
    if (!user) {
      return next(
        new AppError('There is no user with this email address !', 404)
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email with the reset token
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api//v1/users/resetPassword/${resetToken}`;

    const text = `Submit a PATCH request with your new password and password confirm to ${url}`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(10min valid)',
      text,
    });

    res.status(400).json({ status: 'success', user });
  } catch (err) {
    user.passwordResetToken = 1;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
    //res.status(400).json({ status: 'fail', message: err });
  }
};

exports.resetPassword = async (req, res, next) => {};
