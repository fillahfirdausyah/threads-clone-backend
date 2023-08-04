const mongoose = require('mongoose');

let isConnected = false;

const connectToDatabase = async () => {
  mongoose.set('strictQuery', false);
  if (isConnected) {
    console.log('Using existing database connection');
    return Promise.resolve();
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      dbName: 'threadsclone',
    });
    isConnected = true;
    console.log('Using new database connection');
  } catch (error) {
    console.log('Error connecting to database: ', error);
  }
};

module.exports = connectToDatabase;
