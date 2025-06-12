// routes/log.js
const express = require('express');
const router = express.Router();
const { Log, User } = require('../models'); // models/index.js에 Log, User 등록돼 있어야 함
const isAdmin = require('../middlewares/isAdmin'); // 관리자 권한 체크 미들웨어

// 관리자용 로그 조회 (최신 100개)
router.get('/logs', isAdmin, async (req, res) => {
  try {
    const logs = await Log.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'nickname', 'role'] },
        { model: User, as: 'targetUser', attributes: ['id', 'email', 'nickname', 'role'] }
      ],
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '로그 조회 중 오류 발생' });
  }
});

module.exports = router;
