const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
require('dotenv').config();

const getRealIp = (req) => {
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    '0.0.0.0';
  return rawIp === '::1' ? '127.0.0.1' : rawIp;
};

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const ip = getRealIp(req);

                    // 기존 유저라면 last_active 업데이트
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            // 상태 검사 먼저!
            if (exUser.user_status_id === 2) {
              return done(null, false, { message: '탈퇴한 계정입니다.' });
            }
            if (exUser.user_status_id === 3) {
              return done(null, false, { message: '정지된 계정입니다.' });
            }
            if (exUser.user_status_id === 4) {
              return done(null, false, { message: '휴면 계정입니다. 복구 후 로그인 가능합니다.' });
            }

            // 정상 상태면 로그인 처리
            await exUser.update({ last_active: new Date(), ip });
            return done(null, exUser);
          }

          // 신규 유저 생성
          const randomPassword = uuidv4().slice(0, 12);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);

          const newUser = await User.create({
            email,
            nickname: profile.displayName,
            password: hashedPassword,
            social_id: 2,
            email_chk: true,
            user_status_id: 1,
            role: 0,
            theme_mode: 'light',
            is_private: false,
            profile_img: '/img/profile/default.jpg',
            ip,
            myteam_id: 1,
            membership_id: 1,
          });

          // 생성 직후 last_active 추가로 갱신
          await newUser.update({ last_active: new Date() });

          console.log(`[Google] 신규 계정 생성: ${email} / IP: ${ip} / PW: ${randomPassword}`);
          return done(null, newUser);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
