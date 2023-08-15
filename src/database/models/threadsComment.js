const mongoose = require('mongoose');

const ThreadsCommentSchema = new mongoose.Schema({
  commenter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thread_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threads',
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  action_at: {
    type: Date,
    default: Date.now,
  },
});

const ThreadsComment =
  mongoose.models.ThreadsComment ||
  mongoose.model('ThreadsComment', ThreadsCommentSchema);

module.exports = ThreadsComment;
