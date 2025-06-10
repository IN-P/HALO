// /utils/email/sendVerification.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// 인증코드 전송용 트랜스포터
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 인증코드 전송 함수
const sendVerificationCode = async (to, code) => {
  console.log('🟡 [메일 발송 시작]', to, code); // 시작 로그
try {
    const info = await transporter.sendMail({
      from: `"HALO Support" <${process.env.MAIL_USER}>`,
      to,
      subject: '[HALO] 비밀번호 재설정 인증번호',
      html: `
        <div style="font-family:Arial,sans-serif">
          <p>아래 인증번호를 입력해주세요:</p>
          <h2 style="color:#2980b9">${code}</h2>
          <p>인증번호는 <strong>5분간만 유효</strong>합니다.</p>
        </div>
      `,
    });

    console.log('🟢 [메일 발송 성공]', info.messageId); // 성공 로그
  } catch (err) {
    console.error('🔴 [메일 발송 실패]', err); // 실패 로그
  }
};

module.exports = { sendVerificationCode };
