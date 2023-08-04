const mongoose = require('mongoose');

const ThreadScheme = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  thread: {
    type: String,
    required: [true, 'Thread is required'],
  },
  image: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadScheme);

module.exports = Thread;
