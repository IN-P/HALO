const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',      // req.body.email
        passwordField: 'password',   // req.body.password
      },
      async (email, password, done) => {
        try {
          // 1. 이메일로 유저 찾기
          const user = await User.findOne({ where: { email } });

          // 2. 유저가 없으면 실패
          if (!user) {
            return done(null, false, { reason: '존재하지 않는 이메일입니다.' });
          }

          // 3. 비밀번호 비교
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            return done(null, user); // 성공 → user 객체 반환
          }

          // 4. 비밀번호 불일치
          return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );
};
