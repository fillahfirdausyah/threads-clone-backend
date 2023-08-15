const express = require('express');
const router = express.Router();

const threadsController = require('../controllers/threads');

router.get('/threads', threadsController.getThreads);
router.post('/threads', threadsController.createThread);

router.get('/threads/:id', threadsController.getThreadById);
router.delete('/threads/:id', threadsController.deleteThread);

router.get('/threads/:id/likes', threadsController.getLikesThread);
router.post('/threads/:id/likes', threadsController.likeThread);
router.delete('/threads/:id/likes', threadsController.unlikeThread);

router.get('/threads/:id/comments', threadsController.getCommentsThread);
router.post('/threads/:id/comments', threadsController.createCommentThread);

module.exports = router;
