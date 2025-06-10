const express = require('express');
const router = express.Router();
const { User } = require('../models');

// 전체 유저 목록 조회 (채팅, 검색용)
router.get('/all', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nickname', 'profile_img'],
    });

    res.status(200).json(users);
  } catch (err) {
    console.error('GET /userSearch/all 에러', err);
    res.status(500).send('서버 오류');
  }
});

module.exports = router;
