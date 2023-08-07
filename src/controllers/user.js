const connectToDatabase = require('../database/database');
const User = require('../database/models/user');

const getUserDetailsByUsername = async (req, res) => {
  const { username } = req.params;

  await connectToDatabase();

  try {
    const user = await User.findOne({ username: username }, { password: 0 });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    return res.json({
      message: 'User Details',
      status: 200,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

const saveSettingUser = async (req, res) => {
  const { userId, bio, link } = req.body;

  await connectToDatabase();

  try {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        bio: bio,
        link: link,
      }
    );

    return res.json({
      message: 'User Details',
      status: 200,
      data: user,
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
  getUserDetailsByUsername,
  saveSettingUser,
};
