const connectToDatabase = require('../database/database');
const Followers = require('../database/models/followers');
const User = require('../database/models/user');

const followUser = async (req, res) => {
  await connectToDatabase();

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

    // const followersWithFollowingStatus = followerUser.map((item) => {
    //   return {
    //     ...item.toObject(),
    //     isFollowing: sessionUserFollowingSet.has(
    //       item.follower_user_id.toString()
    //     ),
    //   };
    // });

    const followersWithFollowingStatus = followerUser.map((item) => {
      // console.log(
      //   `Followers FillahFirdausyah: ${item.follower_user_id.username} - ID: ${item.follower_user_id._id}`
      // );
      // console.log({
      //   isFollowing: sessionUserFollowingSet.has(
      //     item.follower_user_id._id.toString()
      //   ),
      // });
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

// V1
// const getFollowersByUsername = async (req, res) => {
//   await connectToDatabase();
//   const { username } = req.params;
//   const { userId } = req.query;

//   try {
//     const user = await User.findOne({
//       username,
//     });

//     if (!user) {
//       return res.status(404).json({
//         message: 'User not found',
//       });
//     }

//     const hasFollowed = await Followers.findOne({
//       user_id: user._id,
//       follower_user_id: userId,
//     });

//     // get followers using populate

//     const followers = await Followers.find({
//       user_id: user._id,
//     }).populate('follower_user_id');

//     const followerCount = await Followers.countDocuments({
//       user_id: user._id,
//     });

//     return res.status(200).json({
//       message: 'Success get followers',
//       data: followers,
//       followerCount,
//       isFollowed: hasFollowed ? true : false,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// };

// V1
// const getFollowingByUsername = async (req, res) => {
//   await connectToDatabase();
//   try {
//     const { username } = req.params;

//     const user = await User.findOne({
//       username,
//     });

//     if (!user) {
//       return res.status(404).json({
//         message: 'User not found',
//       });
//     }

//     const following = await Followers.find({
//       follower_user_id: user._id,
//     }).populate('user_id');

//     const followingCount = await Followers.countDocuments({
//       follower_user_id: user._id,
//     });

//     return res.status(200).json({
//       message: 'Success get following',
//       data: following,
//       followingCount,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: 'Internal Server Error',
//       error: error.message,
//     });
//   }
// };

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
