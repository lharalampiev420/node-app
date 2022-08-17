const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(
    'UNCAUGHT EXCEPTION ... EXITING THE SERVER',
    err.name,
    err.message,
    err.stack
  );
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(console.log('DB connection alright !'));

// SERVER
const server = app.listen(3000, () => {
  console.log('Server running on port 3000');
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED ERROR ... EXITING THE SERVER', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
