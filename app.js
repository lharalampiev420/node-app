const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/usersRoutes');

const app = express();

const requestsLimiter = rateLimit({
  max: 120,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests! Wait an hour !',
});

// GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Standard security module for node
app.use(helmet());
// Set max API calls per IP address
app.use('/api', requestsLimiter);
// Body parser
app.use(express.json({ limit: '10kb' }));
// Enable static files render
app.use(express.static('./public'));
// Data sanitization against NoSQL query injection (must be after express.json in order to work)
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'ratingQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

// ROUTES MOUNTING
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);

// JSON.parse() is used to parse json object to javascript object
// JSON.stringify() is the opposite

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
