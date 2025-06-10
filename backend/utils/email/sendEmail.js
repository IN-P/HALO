const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendResetPassword = async (to, tempPassword) => {
  await transporter.sendMail({
    from: `"HALO Support" <${process.env.MAIL_USER}>`,
    to,
    subject: '[HALO] 임시 비밀번호 안내',
    html: `
      <div style="font-family:Arial,sans-serif">
        <p>요청하신 임시 비밀번호는 다음과 같습니다:</p>
        <h2 style="color:#2c3e50">${tempPassword}</h2>
        <p>해당 비밀번호로 로그인 후 반드시 마이페이지에서 변경해주세요.</p>
      </div>
    `,
  });
};
