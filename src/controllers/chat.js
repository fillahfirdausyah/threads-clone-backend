const connectToDatabase = require('../database/database');
const User = require('../database/models/user');
const Chat = require('../database/models/chat');

exports.getChat = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    await connectToDatabase();
    const chatRoomIdArr = chatRoomId.split('&');
    const chats = await Chat.findOne({
      $or: [
        { chatRoomId: `${chatRoomIdArr[0]}&${chatRoomIdArr[1]}` },
        { chatRoomId: `${chatRoomIdArr[1]}&${chatRoomIdArr[0]}` },
      ],
    });

    if (!chats) {
      return res.status(404).json({
        error: 'Chat room not found',
        chatRoomId: chatRoomId,
      });
    }

    return res.status(200).json({
      chatRoomId: chats._id,
      users: chats.users,
      chats: chats.chats,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.sendChat = async (req, res) => {
  try {
    const { userId } = req.query;
    // const { chatRoomId } = req.params;
    const { message, chatRoomId } = req.body;

    await connectToDatabase();

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!chatRoomId) {
      return res.status(400).json({ error: 'Chat room is required' });
    }

    const chatRoom = await Chat.findOne({ chatRoomId: chatRoomId });

    if (!chatRoom) {
      const newRoom = new Chat({
        chatRoomId: chatRoomId,
        users: [userId],
        chats: [
          {
            user_id: userId,
            message: message,
          },
        ],
      });

      await newRoom.save();
    }

    const newChat = {
      user_id: userId,
      message: message,
    };

    await Chat.findOneAndUpdate(
      { chatRoomId: chatRoomId },
      { $push: { chats: newChat } }
    );

    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
