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
    required: true,
  },
  actionUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
  action_at: {
    type: Date,
    default: Date.now,
  },
});

NotificationsSchema.methods.getDataModel = function () {
  switch (this.type) {
    case 'follow':
      return 'User';
    case 'like':
      return 'Thread';
    case 'comment':
      return 'Comment';
    default:
      return null;
  }
};

const Notifications =
  mongoose.models.Notifications ||
  mongoose.model('Notifications', NotificationsSchema);

module.exports = Notifications;
