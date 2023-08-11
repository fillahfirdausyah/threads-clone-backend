const connectToDatabase = require('../database/database');
const User = require('../database/models/user');
const Notifications = require('../database/models/notifications');

const getAllNotifications = async (req, res) => {
  await connectToDatabase();

  const { user_id } = req.query;

  try {
    const notifications = await Notifications.find({
      user_id: user_id,
    }).populate('data', ['username', 'image']);

    return res.json({
      message: 'Success Get All Notifications',
      data: notifications,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotifications,
};
