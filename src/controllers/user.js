const connectToDatabase = require('../database/database');
const User = require('../database/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
  const { fullname, email, username, password } = req.body;

  console.log(req.body);

  //   await connectToDatabase();

  //   try {
  //     bcrypt.hash(password, 10).then(async (hash) => {
  //       const newUser = new User({
  //         email,
  //         fullname,
  //         username,
  //         password: hash,
  //       });

  //       await newUser.save();

  //       let accessToken = jwt.sign(
  //         { id: newUser._id, email: newUser.email },
  //         process.env.SECRET_KEY
  //       );

  //       return res.json({
  //         message: 'Signup success',
  //         status: 200,
  //         data: {
  //           ...newUser._doc,
  //           accessToken,
  //         },
  //       });
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       status: 'error',
  //       message: 'Internal Server Error',
  //     });
  //   }
};

module.exports = {
  createUser,
};
