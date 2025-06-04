// routes/resetPassword.js
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { sendMail } = require('../utils/mail'); 
const { v4: uuidv4 } = require('uuid');

router.post('/reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    const tempPassword = uuidv4().substring(0, 10);
    const hashed = await bcrypt.hash(tempPassword, 12);

    if (user) {
      await user.update({ password: hashed });
    }

    await sendMail({
      to: email,
      subject: '[HALO] 비밀번호 재발급 안내',
      text: `임시 비밀번호: ${tempPassword}\n로그인 후 반드시 변경해주세요.`,
    });

    return res.status(200).json({ message: '임시 비밀번호를 이메일로 전송했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
