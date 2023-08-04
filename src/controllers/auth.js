const connectToDatabase = require('../database/database');
const User = require('../database/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { fullname, email, username, password } = req.body;

  try {
    await connectToDatabase();
    bcrypt.hash(password, 10).then(async (hash) => {
      const newUser = new User({
        email,
        fullname,
        username,
        password: hash,
      });

      await newUser.save();

      return res.json({
        message: 'SignUp Success',
        status: 200,
        profile: newUser,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

const signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    await connectToDatabase();

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    bcrypt.compare(password, user.password).then((match) => {
      if (!match) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials',
        });
      }
      let accessToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.SECRET_KEY
      );
      return res.json({
        ...user._doc,
        accessToken,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  signup,
  signin,
};
