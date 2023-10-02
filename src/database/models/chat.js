const mongoose = require('mongoose');

const ChatsScheme = new mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  chats: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      message: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Chat = mongoose.models.Chat || mongoose.model('Chats', ChatsScheme);

module.exports = Chat;
