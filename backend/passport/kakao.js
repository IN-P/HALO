const { Strategy: KakaoStrategy } = require('passport-kakao');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
require('dotenv').config();

//  IP 추출 (IPv4 전용, AWS 프록시 대응)
const getRealIp = (req) => {
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    '0.0.0.0';

  if (rawIp.startsWith('::ffff:')) return rawIp.replace('::ffff:', '');
  if (rawIp === '::1') return '127.0.0.1';
  return rawIp;
};

module.exports = (passport) => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        callbackURL: process.env.KAKAO_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          //  카카오에서 받은 이메일 (필수 동의로 설정되어 있다고 가정)
          const email = profile._json.kakao_account.email;
          const kakaoId = profile.id;

          //  기존 사용자 존재 여부 확인
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            //  기존 유저: 마지막 접속 업데이트
            await exUser.update({ last_active: new Date() });
            return done(null, exUser);
          }

          //  새 유저 생성
          const randomPassword = uuidv4().slice(0, 12);
          const hashedPassword = await bcrypt.hash(randomPassword, 12);
          const ip = getRealIp(req);

          const newUser = await User.create({
            email,
            nickname: profile.username || profile.display_name || '카카오유저',
            password: hashedPassword,
            social_id: 3, // 3: 카카오
            email_chk: true,
            user_status_id: 1,
            role: 0,
            theme_mode: 'light',
            is_private: false,
            profile_img: '/img/profile/default.jpg',
            ip,
            myteam_id: 1,
            membership_id: 1,
            last_active: new Date(), //  즉시 기록
            // kakao_id: kakaoId, // 원하면 추가 저장 가능
          });

          console.log(`[Kakao] 신규 계정 생성: ${email} / IP: ${ip} / PW: ${randomPassword}`);
          return done(null, newUser);
        } catch (error) {
          console.error('[Kakao 로그인 오류]', error);
          return done(error);
        }
      }
    )
  );
};
