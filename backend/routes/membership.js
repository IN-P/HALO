// routes/membership.js

const express = require('express');
const router = express.Router();
const { Membership, User, sequelize } = require('../models');


// 📌 [GET] 멤버십 전체 조회
router.get('/list', async (req, res) => {
  try {
    const memberships = await Membership.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'price'], // 필요시 선택적으로 필드 제한
    });
    return res.status(200).json({ success: true, memberships });
  } catch (err) {
    console.error('[멤버십 목록 오류]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// 📌 [POST] 멤버십 구매
router.post('/purchase', async (req, res) => {
  const { userId, membershipId } = req.body;

  try {
    // 유저 찾기
    const user = await User.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });

    // 멤버십 찾기
    const membership = await Membership.findOne({ where: { id: membershipId } });
    if (!membership) return res.status(404).json({ message: '멤버십 정보를 찾을 수 없습니다.' });

    // 이미 보유 중인지 확인
    if (user.membership_id === membershipId) {
      return res.status(400).json({ message: '이미 보유 중인 멤버십입니다.' });
    }

    // 잔액 부족 확인
    if (user.balance < membership.price) {
      return res.status(400).json({ message: '잔액이 부족합니다.' });
    }

    // 트랜잭션으로 잔액 차감 + 등급 업데이트
    await sequelize.transaction(async (t) => {
      await user.update(
        {
          balance: user.balance - membership.price,
          membership_id: membership.id,
        },
        { transaction: t }
      );
    });

    return res.status(200).json({ success: true, message: '멤버십 구매 완료' });
  } catch (err) {
    console.error('[멤버십 구매 오류]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
