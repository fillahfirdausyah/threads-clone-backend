const mongoose = require('mongoose');

const NotificationsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['follow', 'like', 'comment'],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Notifications =
  mongoose.models.Notifications ||
  mongoose.model('Notifications', NotificationsSchema);

module.exports = Notifications;
