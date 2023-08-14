const mongoose = require('mongoose');

const ThreadsLikesSchema = new mongoose.Schema({
  liker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threads',
    required: true,
  },
  is_like: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ThreadsLikes =
  mongoose.models.ThreadsLikes ||
  mongoose.model('ThreadsLikes', ThreadsLikesSchema);

module.exports = ThreadsLikes;
