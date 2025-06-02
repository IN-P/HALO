const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/unread', chatController.getUnreadMessages);
router.get('/test', chatController.testController);

module.exports = router;
