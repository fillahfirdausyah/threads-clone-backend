const connectToDatabase = require('../database/database');
const User = require('../database/models/user');
const Chat = require('../database/models/chat');
const createChatroomIdentifier = require('../utils/createChatroomIdentifier');

exports.getChat = async (req, res) => {
  try {
    const { chatRoomId } = req.params;

    if (!chatRoomId) {
      return res.status(400).json({ error: 'Chat room is required' });
    }

    const chatRoomIdArr = chatRoomId.split('&');
    const newChatRoomId = createChatroomIdentifier(
      chatRoomIdArr[0],
      chatRoomIdArr[1]
    );

    await connectToDatabase();
    const chats = await Chat.findOne({ chatRoomId: newChatRoomId });

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
    const { chatRoomId } = req.params;
    const { message } = req.body;
    const socket = req.app.get('socketio');

    const chatRoomIdArr = chatRoomId.split('&');
    const newChatRoomId = createChatroomIdentifier(
      chatRoomIdArr[0],
      chatRoomIdArr[1]
    );

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

    const chatRoom = await Chat.findOne({ chatRoomId: newChatRoomId });

    const userReceiver = await User.findOne({ username: chatRoomIdArr[1] });

    if (!userReceiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!chatRoom) {
      const newRoom = new Chat({
        chatRoomId: newChatRoomId,
        users: [userId],
        chats: [
          {
            user_id: userId,
            message: message,
          },
        ],
      });

      await newRoom.save();

      socket.emit(`chat:${userReceiver._id}`, {
        userId: userId,
        message: message,
      });

      return res.status(200).json({ message: 'Message sent' });
    }

    const newChat = {
      user_id: userId,
      message: message,
    };

    await Chat.findOneAndUpdate(
      { chatRoomId: newChatRoomId },
      { $push: { chats: newChat } }
    );

    socket.emit(`chat:${userReceiver._id}`, {
      userId: userId,
      message: message,
    });

    return res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
