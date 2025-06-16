const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('./middlewares');
const getFeedSet = require('../services/feedService');

// GET /feeds?excludePostIds=1,2,3
router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const excludeIds = (req.query.excludePostIds || '')
      .split(',')
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
    const feed = await getFeedSet(req.user.id, excludeIds);
    res.status(200).json({ posts: feed });
  } catch (error) {
    console.error('🚨 /feeds 오류:', error);
    next(error);
  }
});

module.exports = router;
