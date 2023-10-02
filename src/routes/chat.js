const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat');

router.get('/chat/:chatRoomId', chatController.getChat);
router.post('/chat/:chatRoomId', chatController.sendChat);

module.exports = router;
