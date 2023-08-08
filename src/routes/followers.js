const express = require('express');
const router = express.Router();

const followersController = require('../controllers/followers');

router.get('/followers/:username', followersController.getFollowersByUsername);
router.get('/following/:username', followersController.getFollowingByUsername);
router.post('/follow/:username', followersController.followUser);
router.delete('/unfollow/:username', followersController.unfollowUser);

module.exports = router;
