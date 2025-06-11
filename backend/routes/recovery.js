const express = require('express');
const router = express.Router();
const { User, deleted_users: DeletedUser, email_verification: EmailVerification } = require('../models');
const { sendVerificationCode } = require('../utils/email/sendVerification');
const { sequelize } = require('../models');

// 📌 [1] 인증 코드 발송
router.post('/code', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json({ message: '인증 메일 전송됨' }); // 존재 여부 숨김

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 1000 * 60 * 5); // 5분 유효

    await EmailVerification.destroy({ where: { users_id: user.id } }); // 기존 삭제
    await EmailVerification.create({ code, expired_at: expiredAt, users_id: user.id });

    await sendVerificationCode(email, code);
    return res.status(200).json({ message: '인증 메일 전송됨' });
  } catch (err) {
    console.error('[인증코드 발송 오류]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// 📌 [2] 인증 코드 검증 + 계정 복구 포함
// 📌 [2] 인증 코드 검증 (인증 성공 시 상태 복구)
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: '유효하지 않은 요청입니다.' });

    const verification = await EmailVerification.findOne({
      where: { users_id: user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!verification || verification.code !== code) {
      return res.status(401).json({ message: '인증번호가 일치하지 않습니다.' });
    }

    if (new Date() > verification.expired_at) {
      return res.status(410).json({ message: '인증번호가 만료되었습니다.' });
    }

    await EmailVerification.destroy({ where: { id: verification.id } });

    // ✅ 여기서 계정 상태를 복구
    if (user.user_status_id === 2 || user.user_status_id === 4) {
      await user.update({ user_status_id: 1 }); // NORMAL
    }

    return res.status(200).json({
      success: true,
      message: '계정 복구가 완료되었습니다.',
      userStatus: 1,
    });
  } catch (err) {
    console.error('[인증 검증 오류]', err);
    return res.status(500).json({ message: '서버 오류' });
  }
});


// 📌 [3, 4] 백업용 복구 API (현재 미사용, 향후 관리자용 등으로 사용 가능)
router.post('/restore-deleted', async (req, res) => {
  return res.status(403).json({ message: '해당 기능은 사용되지 않습니다. 이메일 인증을 통해 복구해주세요.' });
});

router.post('/restore-dormant', async (req, res) => {
  return res.status(403).json({ message: '해당 기능은 사용되지 않습니다. 이메일 인증을 통해 복구해주세요.' });
});

module.exports = router;
