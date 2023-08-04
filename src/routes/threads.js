const express = require('express');
const router = express.Router();

const threadsController = require('../controllers/threads');

router.get('/threads', threadsController.getThreads);
router.post('/threads', threadsController.createThread);
router.delete('/threads/:id', threadsController.deleteThread);

module.exports = router;
