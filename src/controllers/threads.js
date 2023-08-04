const connectToDatabase = require('../database/database');
require('../database/models/user');
const Thread = require('../database/models/thread');

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

      return res.json({
        message: 'Success',
        status: 200,
        data: filteredThreads,
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
  return res.json({
    message: 'Success',
    status: 200,
    data: threads,
  });
};

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

module.exports = {
  getThreads,
  createThread,
  deleteThread,
};
