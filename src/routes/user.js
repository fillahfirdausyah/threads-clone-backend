const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/users/:username', userController.getUserDetailsByUsername);
router.patch('/users/:username', userController.saveSettingUser);

module.exports = router;
