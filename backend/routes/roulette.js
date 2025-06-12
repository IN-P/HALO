const express = require('express');
const router = express.Router();
const { UserPoint, PointLogs, Roulette, User } = require('../models');
const { isLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');

router.post('/spin', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // ✅ 오늘 날짜 기준 범위
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ✅ 오늘 이미 돌렸는지 확인
    // const alreadySpun = await Roulette.findOne({
    //   where: {
    //     users_id: userId,
    //     createdAt: {
    //       [Op.between]: [todayStart, todayEnd],
    //     },
    //   },
    // });

    // if (alreadySpun) {
    //   return res.status(400).json({ message: '오늘은 이미 룰렛을 돌렸습니다.' });
    // }

    // 1. 랜덤 보상 포인트
    const rewards = [10, 20, 50, 100];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    // 2. UserPoint 존재 확인 (없으면 생성)
    let userPoint = await UserPoint.findOne({ where: { users_id: userId } });
    if (!userPoint) {
      userPoint = await UserPoint.create({ users_id: userId, total_points: 0 });
    }

    // 3. 포인트 추가
    userPoint.total_points += reward;
    await userPoint.save();

    // 4. PointLogs 기록
    await PointLogs.create({
      type: 1, // 적립 타입
      source: 'ROULETTE',
      users_id: userId,
    });

    // 5. Roulette 기록
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

module.exports = router;
