const express = require('express');
const router = express.Router();
const { Follow } = require('../models');

router.post('/follow', async (req, res, next) => {
  try {
    const { toUserId } = req.body;
    const fromUserId = 1;

    const existing = await Follow.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: '이미 팔로우한 사용자입니다.' })
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신은 팔로우할 수 없습니다.' });
    }
    const follow = await Follow.create({
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });
    res.status(201).json(follow);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;