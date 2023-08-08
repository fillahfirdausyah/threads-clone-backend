const mongoose = require('mongoose');

const FollowersScheme = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  follower_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Follower User ID is required'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Followers =
  mongoose.models.Followers || mongoose.model('Followers', FollowersScheme);

module.exports = Followers;
