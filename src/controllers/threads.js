const connectToDatabase = require('../database/database');
require('../database/models/user');
const Thread = require('../database/models/thread');
const ThreadLikes = require('../database/models/threadsLikes');
const Notifications = require('../database/models/notifications');

/**
 * Function to handle request get all threads
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getThreads = async (req, res) => {
  const { username } = req.query;
  await connectToDatabase();

  if (username) {
    try {
      const threads = await Thread.find({})
        .sort({ timestamp: -1 })
        .populate('creator');

      const filteredThreads = threads.filter((thread) => {
        return thread.creator.username === username;
      });

      // check if threads has been liked by session user user
      const threadsWithLikes = await Promise.all(
        filteredThreads.map(async (thread) => {
          const checkLike = await ThreadLikes.findOne({
            thread_id: thread._id,
            liker_id: req.query.sessionUserId,
          });

          if (checkLike) {
            return {
              ...thread._doc,
              isLiked: true,
            };
          }

          return {
            ...thread._doc,
            isLiked: false,
          };
        })
      );

      return res.json({
        message: 'Success',
        status: 200,
        data: threadsWithLikes,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }
  }
  //   get all threads from newest to oldest
  const threads = await Thread.find({})
    .sort({ timestamp: -1 })
    .populate('creator');

  // check if threads has been liked by user
  const threadsWithLikes = await Promise.all(
    threads.map(async (thread) => {
      const checkLike = await ThreadLikes.findOne({
        thread_id: thread._id,
        liker_id: req.query.sessionUserId,
      });

      if (checkLike) {
        return {
          ...thread._doc,
          isLiked: true,
        };
      }

      return {
        ...thread._doc,
        isLiked: false,
      };
    })
  );

  return res.json({
    message: 'Success',
    status: 200,
    data: threadsWithLikes,
  });
};

/**
 * Function to handle request get thread by id
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getThreadById = async (req, res) => {
  const { id } = req.params;
  const { sessionUserId } = req.query;

  try {
    await connectToDatabase();
    const thread = await Thread.findById(id).populate('creator');

    if (!thread) {
      return res.status(404).json({
        message: 'Thread not found',
      });
    }

    // check if threads has been liked by user
    const checkLike = await ThreadLikes.findOne({
      thread_id: thread._id,
      liker_id: sessionUserId,
    });

    if (checkLike) {
      return res.status(200).json({
        message: 'Success get thread',
        data: {
          ...thread._doc,
          isLiked: true,
        },
      });
    }

    return res.status(200).json({
      message: 'Success get thread',
      data: {
        ...thread._doc,
        isLiked: false,
      },
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
 * Function to handle request create thread
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createThread = async (req, res) => {
  const { userId, thread } = req.body;

  if (req.files) {
    try {
      const { image } = req.files;
      const fileName = `${Date.now()}-${image.name}`;
      const path = `./public/images/${fileName}`;

      await image.mv(path);

      await connectToDatabase();
      const newThread = new Thread({
        creator: userId,
        thread,
        image: fileName,
      });

      await newThread.save();

      return res.json({
        message: 'Thread created',
        status: 200,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
      });
    }
  }

  try {
    await connectToDatabase();
    const newThread = new Thread({
      creator: userId,
      thread,
    });

    await newThread.save();

    return res.json({
      message: 'Thread created',
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

/**
 * Function to handle request delete thread
 * @param {*} req
 * @param {*} res
 * @returns
 */
const deleteThread = async (req, res) => {
  const { id } = req.params;

  try {
    await connectToDatabase();
    await Thread.findByIdAndDelete(id);

    return res.json({
      message: 'Thread deleted',
      status: 200,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
};

/**
 * Function to handle request like thread
 * @param {*} req
 * @param {*} res
 * @returns
 */
const likeThread = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const socket = req.app.get('socketio');

  try {
    await connectToDatabase();
    const thread = await Thread.findById(id);

    if (!thread) {
      return res.status(404).json({
        message: 'Thread not found',
      });
    }

    const checkLike = await ThreadLikes.findOne({
      thread_id: id,
      liker_id: userId,
    });

    if (checkLike) {
      return res.status(400).json({
        message: 'You already like this thread',
      });
    }

    const newLike = new ThreadLikes({
      thread_id: id,
      liker_id: userId,
      is_like: true,
    });

    // update thread total likes
    await Thread.findByIdAndUpdate(id, {
      totalLikes: thread.totalLikes + 1,
    });

    await newLike.save();

    // Check the notification
    const checkNotification = await Notifications.findOne({
      user_id: thread.creator,
      data: id,
    });

    if (checkNotification === null) {
      // Create and save notifications
      const newNotifications = new Notifications({
        user_id: thread.creator,
        type: 'like',
        data: id,
        is_read: false,
        actionUser: userId,
      });

      await newNotifications.save();
      if (userId !== thread.creator.toString()) {
        socket.emit(`likesNotifications:${thread.creator._id}`, newLike);
      }
    } else {
      const notifications = await Notifications.updateOne(
        {
          user_id: thread.creator,
          type: 'like',
          data: id,
          actionUser: userId,
        },
        { action_at: new Date() }
      );
      if (userId !== thread.creator.toString()) {
        socket.emit(`likesNotifications:${thread.creator._id}`, notifications);
      }
    }

    return res.status(200).json({
      message: 'Success like thread',
      data: newLike,
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
 * Function to handle request unlike thread
 * @param {*} req
 * @param {*} res
 * @returns
 */
const unlikeThread = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await connectToDatabase();
    const thread = await Thread.findById(id);

    if (!thread) {
      return res.status(404).json({
        message: 'Thread not found',
      });
    }

    const checkLike = await ThreadLikes.findOne({
      thread_id: id,
      liker_id: userId,
    });

    if (!checkLike) {
      return res.status(400).json({
        message: 'You already unlike this thread',
      });
    }

    // update thread total likes
    await Thread.findByIdAndUpdate(id, {
      totalLikes: thread.totalLikes - 1,
    });

    const unlike = await ThreadLikes.findByIdAndDelete(checkLike._id);

    return res.status(200).json({
      message: 'Success unlike thread',
      data: unlike,
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
 * Function to handle request get likes thread
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getLikesThread = async (req, res) => {
  const { id } = req.params;

  try {
    await connectToDatabase();
    const thread = await Thread.findById(id);

    if (!thread) {
      return res.status(404).json({
        message: 'Thread not found',
      });
    }

    const likes = await ThreadLikes.find({ thread_id: id }).populate(
      'liker_id'
    );

    return res.status(200).json({
      message: 'Success get likes thread',
      data: likes,
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
  getThreads,
  createThread,
  deleteThread,
  likeThread,
  unlikeThread,
  getLikesThread,
  getThreadById,
};
