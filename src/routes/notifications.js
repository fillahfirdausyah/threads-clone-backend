const express = require('express');
const router = express.Router();

const notificationsController = require('../controllers/notifications');

router.get('/notifications', notificationsController.getAllNotifications);

module.exports = router;
