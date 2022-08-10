const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data imported!');
  } catch (err) {
    console.log(err);
  }
  mongoose.disconnect();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted!');
  } catch (err) {
    console.log(err);
  }
  mongoose.disconnect();
};

process.argv.forEach((value, _) => {
  if (value === '--import') {
    importData();
  } else if (value === '--delete') {
    deleteData();
  }
});

console.log(process.argv);
