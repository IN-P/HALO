const express = require('express');
const router = express.Router();
const {
  getTopLikedUsers,
  getTopRetweetedPosts,
} = require('../services/adminAnalyticsService');
const isAdmin = require('../middlewares/isAdmin');

// 좋아요 많이 받은 유저
router.get('/top-liked-users', isAdmin, async (req, res) => {
  try {
    const result = await getTopLikedUsers();
    res.status(200).json(result);
  } catch (err) {
    console.error('top-liked-users 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 리트윗 많이 된 게시글
router.get('/top-retweeted-posts', isAdmin, async (req, res) => {
  try {
    const result = await getTopRetweetedPosts();
    res.status(200).json(result);
  } catch (err) {
    console.error('top-retweeted-posts 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
