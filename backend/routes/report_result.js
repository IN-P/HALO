const express = require('express');
const router = express.Router();
const { ReportResult, Report, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

// ✅ 관리자 권한 확인 함수
const isReportAdmin = (user) => user.role === 1 || user.role === 3;

// POST /report-result - 정지 처리
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { reportId, user_id, duration } = req.body;

    if (!isReportAdmin(req.user)) {
      return res.status(403).json({ message: '신고 관리자만 정지 처리할 수 있습니다.' });
    }

    const resultText = `${duration}일 정지 처리`;
    const now = new Date();
    const releaseTime = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    // ✅ 이미 있으면 덮어쓰기 (create or update)
    const [result, created] = await ReportResult.upsert({
      id: reportId,
      user_id,
      result: resultText,
      createdAt: now,
      updatedAt: releaseTime,
    });

    // ✅ 유저 상태 정지 처리
    await User.update(
      { user_status_id: 3 },
      { where: { id: user_id } }
    );
    // ✅ 신고 상태도 '처리됨'으로 변경
    await Report.update(
      { status: '처리됨' },
      { where: { id: reportId } }
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('정지 처리 실패:', error);
    next(error);
  }
});

module.exports = router;
