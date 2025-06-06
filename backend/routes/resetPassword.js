// routes/resetPassword.js
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sendResetPassword } = require('../utils/email/sendEmail');
const { v4: uuidv4 } = require('uuid');
const { email_verification: EmailVerification } = require('../models'); //## 윤기추가
const { sendVerificationCode } = require('../utils/email/sendVerification'); //## 윤기추가

router.post('/reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const tempPassword = uuidv4().substring(0, 10);
      const hashed = await bcrypt.hash(tempPassword, 12);
      await user.update({ password: hashed });

      await sendResetPassword(email, tempPassword);
    }

    return res.status(200).json({
      message: '임시 비밀번호를 이메일로 전송했습니다.',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

// 인증코드 발급 및 이메일 전송
router.post('/code', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: '인증 이메일을 발송했습니다.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 1000 * 60 * 5);

    console.log('🐞 [유저 확인]', user.id, email); // ✅ 디버그용 로그
    console.log('🐞 [코드 생성]', code);

    await EmailVerification.destroy({ where: { users_id: user.id } });

    try {
      await EmailVerification.create({
        code,
        expired_at: expiredAt,
        users_id: user.id,
      });
      console.log('🟢 인증코드 DB 저장 성공'); // ✅ 추가
    } catch (err) {
      console.error('🔴 인증코드 저장 실패:', err); // ✅ 추가
    }

    await sendVerificationCode(email, code);
    console.log('📧 인증메일 전송됨');

    return res.status(200).json({ message: '인증번호를 이메일로 전송했습니다.' });
  } catch (err) {
    console.error('🔴 전체 오류', err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '유효하지 않은 요청입니다.' });
    }

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

    return res.status(200).json({ success: true, message: '인증 성공' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
