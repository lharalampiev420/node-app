const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/usersRoutes');

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('./public'));

app.use((req, res, next) => {
  //console.log(req.headers);
  next();
});

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
