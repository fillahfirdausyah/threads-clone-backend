const mongoose = require('mongoose');

const UserScheme = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: [true, 'Email address already exists'],
  },
  fullname: {
    type: String,
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    match: [
      /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
      'Username invalid, it should contain 8-20 alphanumeric letters and be unique!',
    ],
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
});

const User = mongoose.models.User || mongoose.model('User', UserScheme);

module.exports = User;
