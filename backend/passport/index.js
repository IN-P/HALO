//serialize/deserialize 등 기본 설정
//Passport 설정의 핵심 파일이자, 로그인 인증의 "엔진 시동" 같은 역할
//전체 Passport 인증의 초기화 및 구성 등록을 담당. 즉, Passport 설정의 중심 컨트롤러


const passport = require('passport');
const local = require('./local'); // local strategy 정의
const google = require('./google'); //윤기추가
const { User, Membership } = require('../models'); //dbsrlcnrk
const kakao = require('./kakao'); //윤기추가

module.exports = () => {
  //  로그인 시: user.id만 세션에 저장
  passport.serializeUser((user, done) => {
    done(null, user.id); // 세션에 저장되는 값: { id: 1 }
  });

  //  요청마다: 세션에서 id를 꺼내 DB 조회 후 req.user로 복구
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ['password'] }, // 비번은 제거
        include: [{ model: Membership }],
      });
      done(null, user); // req.user에 담김
    } catch (err) {
      console.error(err);
      done(err);
    }
  });

  
  local(); // local 전략 실행 (passport.use(localStrategy) 등록)
  google(passport); //윤기추가
  kakao(passport); //윤기추가
};
