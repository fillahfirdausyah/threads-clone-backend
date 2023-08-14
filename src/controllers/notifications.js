const connectToDatabase = require('../database/database');
const User = require('../database/models/user');
const Thread = require('../database/models/thread');
const Notifications = require('../database/models/notifications');

const getAllNotifications = async (req, res) => {
  await connectToDatabase();

  const { user_id } = req.query;

  try {
    const notifications = await Notifications.find({
      user_id: user_id,
    });

    const notificationsByType = {
      follow: [],
      like: [],
      comment: [],
    };

    notifications.forEach((notification) => {
      notificationsByType[notification.type].push(notification);
    });

    for (const type in notificationsByType) {
      const dataModel = type === 'like' ? 'Thread' : 'User'; // Ganti dengan model yang sesuai
      if (dataModel) {
        await Notifications.populate(notificationsByType[type], {
          path: 'data',
          model: dataModel,
        });

        // Populate creator untuk semua jenis notifikasi
        await Notifications.populate(notificationsByType[type], {
          path: 'data.creator',
          model: 'User',
        });

        if (type === 'like') {
          await Notifications.populate(notificationsByType[type], {
            path: 'actionUser',
            model: 'User',
          });
        }
      }
    }

    const formattedNotifications = {
      follow: notificationsByType.follow,
      like: notificationsByType.like,
      comment: notificationsByType.comment,
    };

    return res.json({
      message: 'Success Get All Notifications',
      data: formattedNotifications,
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
