const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
//const { promisify } = require('util');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
    cookieOptions.samesite = 'strict';
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

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

    createSendToken(newUser, 201, res);
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

    createSendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //check if user is logged
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
    )}/api/v1/users/resetPassword/${resetToken}`;

    const text = `Submit a PATCH request with your new password and password confirm to ${url}`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(10min valid)',
      text,
    });

    res
      .status(400)
      .json({ status: 'success', message: 'Token has been sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
    //res.status(400).json({ status: 'fail', message: err });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // Check If there is no user
    if (!user) {
      return next(new AppError('Token is invalid or has expired !', 404));
    }

    // Update
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Log the user in, send JWT
    createSendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', err });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.passwordCurrent))) {
      return next(new AppError('Your current password is wrong !', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
