const connectToDatabase = require('../database/database');
const Followers = require('../database/models/followers');
const User = require('../database/models/user');
const Notifications = require('../database/models/notifications');

/**
 * Function to handle request follow user
 @param req
 @param res
 */
const followUser = async (req, res) => {
  // Connect to DB
  await connectToDatabase();
  // Get socket io object
  const socketio = req.app.get('socketio');

  try {
    const { username } = req.params;
    const { userId } = req.body;

    const userWillFollow = await User.findOne({
      username,
    });

    if (!userWillFollow) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const follower = await Followers.findOne({
      user_id: userWillFollow._id,
      follower_user_id: userId,
    });

    if (follower) {
      return res.status(400).json({
        message: 'You already follow this user',
      });
    }

    const newFollower = new Followers({
      user_id: userWillFollow._id,
      follower_user_id: userId,
    });

    await newFollower.save();

    const checkNotifications = await Notifications.find({
      user_id: userWillFollow._id,
      data: userId,
    });

    if (checkNotifications.length === 0) {
      const newNotifications = new Notifications({
        user_id: userWillFollow._id,
        type: 'follow',
        data: userId,
      });
      await newNotifications.save();
      // Trigger event follow that contain in index.js
      socketio.emit(`notification:${userWillFollow._id}`, newNotifications);
    } else {
      const notifications = await Notifications.updateOne(
        { user_id: userWillFollow._id, type: 'follow', data: userId },
        { created_at: new Date() }
      );
      socketio.emit(`notification:${userWillFollow._id}`, notifications);
    }

    return res.status(200).json({
      message: 'Success follow user',
      data: newFollower,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

/**
 * Function to handle request get Followers by username
 @param req
 @param res
 */
const getFollowersByUsername = async (req, res) => {
  await connectToDatabase();
  const { username } = req.params;
  const { sessionUserId } = req.query;

  try {
    const user = await User.findOne({
      username,
    });
    const followerUser = await Followers.find({ user_id: user._id }).populate(
      'follower_user_id'
    );

    const sessionUserFollowing = await Followers.find({
      follower_user_id: sessionUserId,
    });

    const sessionUserFollowingSet = new Set(
      sessionUserFollowing.map((item) => {
        return item.user_id._id.toString();
      })
    );

    const followersWithFollowingStatus = followerUser.map((item) => {
      return {
        ...item.toObject(),
        isFollowing: sessionUserFollowingSet.has(
          item.follower_user_id._id.toString()
        ),
      };
    });

    return res.status(200).json({
      message: 'Success get followers',
      data: followersWithFollowingStatus,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

/**
 * Function to handle request get Following by username
 @param req
 @param res
 */
const getFollowingByUsername = async (req, res) => {
  await connectToDatabase();
  const { username } = req.params;
  const { sessionUserId } = req.query;
  try {
    const user = await User.findOne({
      username,
    });

    const followingUser = await Followers.find({
      follower_user_id: user._id,
    }).populate('user_id');

    const sessionUserFollowing = await Followers.find({
      follower_user_id: sessionUserId,
    });

    const sessionUserFollowingSet = new Set(
      sessionUserFollowing.map((item) => {
        return item.user_id._id.toString();
      })
    );

    const followingWithFollowingStatus = followingUser.map((item) => {
      return {
        ...item.toObject(),
        isFollowing: sessionUserFollowingSet.has(item.user_id._id.toString()),
      };
    });

    return res.status(200).json({
      message: 'Success get following',
      data: followingWithFollowingStatus,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

/**
 * Function to handle request unfollow user
 @param req
 @param res
 */
const unfollowUser = async (req, res) => {
  await connectToDatabase();
  try {
    const { username } = req.params;
    const { userId } = req.body;

    const userWillUnfollow = await User.findOne({
      username,
    });

    if (!userWillUnfollow) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const follower = await Followers.findOne({
      user_id: userWillUnfollow._id,
      follower_user_id: userId,
    });

    if (!follower) {
      return res.status(400).json({
        message: 'You not follow this user',
      });
    }

    await Followers.findByIdAndDelete(follower._id);

    return res.status(200).json({
      message: 'Success unfollow user',
      data: follower,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  followUser,
  getFollowersByUsername,
  getFollowingByUsername,
  unfollowUser,
};
