const express = require('express');
const router = express.Router();
const { ReportResult, Report, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

// 정지 처리 API
// POST /report-result
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { reportId, user_id, duration } = req.body;

    // 이미 정지 처리된 경우 중복 저장 방지
    const exists = await ReportResult.findOne({ where: { id: reportId } });
    if (exists) {
      return res.status(400).json({ message: '이미 처리된 신고입니다.' });
    }

    const resultText = `${duration}일 정지 처리`;

    const result = await ReportResult.create({
      id: reportId,       // 신고 ID
      user_id,            // 정지 대상 유저
      result: resultText, // 처리 결과
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('정지 처리 실패:', error);
    next(error);
  }
});

module.exports = router;
