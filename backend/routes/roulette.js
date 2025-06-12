// routes/roulette.js

const express = require('express');
const router = express.Router();
const { UserPoint, PointLogs, Roulette, User } = require('../models');
const { isLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');

// ✅ 메모리에 rewards 저장
let rewards = [10, 20, 50, 100];

// ✅ 관리자 체크
const isAdmin = (req, res, next) => {
  if (req.user?.role === 1 || req.user?.role === 3) return next();
  return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
};

// ✅ 룰렛 돌리기
router.post('/spin', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const alreadySpun = await Roulette.findOne({
      where: {
        users_id: userId,
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    if (alreadySpun) {
      return res.status(400).json({ message: '오늘은 이미 룰렛을 돌렸습니다.' });
    }

    // ✅ 메모리에 있는 rewards 사용
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    let userPoint = await UserPoint.findOne({ where: { users_id: userId } });
    if (!userPoint) {
      userPoint = await UserPoint.create({ users_id: userId, total_points: 0 });
    }

    userPoint.total_points += reward;
    await userPoint.save();

    await PointLogs.create({
      type: 1,
      source: 'ROULETTE',
      users_id: userId,
    });

    await Roulette.create({
      reward_value: reward,
      users_id: userId,
    });

    return res.status(200).json({ message: '룰렛 성공', point: reward });
  } catch (error) {
    console.error('🎯 룰렛 에러:', error);
    return res.status(500).json({ message: '서버 오류' });
  }
});


// ✅ 현재 rewards 확인
router.get('/rewards', isLoggedIn,  (req, res) => {
  res.json(rewards);
});

// ✅ rewards 수정
router.put('/rewards', isLoggedIn,  (req, res) => {
  const { newRewards } = req.body;
  if (!Array.isArray(newRewards) || newRewards.length === 0) {
    return res.status(400).json({ message: '배열 형태의 newRewards가 필요합니다.' });
  }
  rewards = newRewards.map(v => parseInt(v)).filter(v => !isNaN(v));
  res.json({ message: '보상 배열이 수정되었습니다.', rewards });
});

module.exports = router;
