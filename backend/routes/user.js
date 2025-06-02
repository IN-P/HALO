// 모든 테스트는 포스트맨에서 실행
// 선생님과 했던 실습 그대로 하시면 됩니다 (쿠키 넣을 파트는 쿠키 넣으시고)
// 딜리트 해도 소프트딜리트라 바로 삭제 안됨 30일 기다리세요! 아니면 음... cmd에서 삭제 ㄱㄱ
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); // 로그인 여부 체크 미들웨어
const userService = require('../services/userService'); //소프트 딜리트
const db = require('../models');

/*회원가입    ★테스트 성공
- URL: http://localhost:3065/user
- Method: POST
- Body (raw - JSON):
{
  "email": "test1@example.com",
  "nickname": "테스트1",
  "password": "1234"
}
*/
router.post('/', async (req, res, next) => { 
  try {
    const { email, nickname, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(403).send('이미 사용 중인 이메일입니다.');
    }
    if (!email || !nickname || !password) {
      return res.status(400).send('필수 항목이 누락되었습니다.');
    }
    if (!email.includes('@')) {
      return res.status(400).send('올바른 이메일 형식이 아닙니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    let rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (rawIp.includes(',')) {
      rawIp = rawIp.split(',')[0]; // 프록시 체인일 경우 첫 번째 IP 사용
    }
    const ip = rawIp === '::1' ? '127.0.0.1' : rawIp.trim();

    await User.create({
      email,
      nickname,
      password: hashedPassword,
      role: 0, // 일반회원 (default 제거했으므로 명시), 일반회원을 0으로 두고, 1마스터 2유저관리자 이렇게 하는게 좀 늘리기 편한듯? 5로 두니까 애매함
      email_chk: 0,
      is_private: 0,
      balance: 0,
      profile_img: 'https://i.pinimg.com/originals/2f/55/97/2f559707c3b04a1964b37856f00ad608.jpg',
      user_status_id: 1,    // 일반계정
      membership_id: 1,     // 브론즈
      myteam_id: 1,         // "응원팀 없음"
      social_id: 1,         // 간편로그인 안한양반으로 디폴트
      ip,   //ip저장
    });

    res.status(201).send('회원가입 성공');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/*로그인    ★테스트 성공
- URL: http://localhost:3065/user/login
- Method: POST
- Body (raw - JSON):
{
  "email": "test1@example.com",
  "password": "1234"  // 실제로 회원가입 시 사용한 비번
}
*/
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }

    if (info) {
      return res.status(401).send('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인하세요.');
    }

    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      await User.update(
        { last_active: new Date() },
        { where: { id: user.id } }
      );

      const fullUser = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ['password'] },
      });

      res.status(200).json(fullUser);
    });
  })(req, res, next);
});

/* 로그아웃   ★테스트 성공
- URL: http://localhost:3065/user/logout
- Method: POST
- Body: 없음 (None)
*/
router.post('/logout', isLoggedIn, (req, res, next) => {
  req.logout(err => {
    if (err) {
      console.error(err);
      return next(err);
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' }); // 선택: 쿠키도 제거
      res.status(200).send('로그아웃 완료');
    });
  });
});

/*내정보보기 마이페이지       ★테스트 성공
- URL: http://localhost:3065/user/
- Method: GET
- Body: 없음 (None) 로그인이랑 비슷하게 뜨면 성공
*/
router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    // 1. 로그인 여부는 isLoggedIn 미들웨어에서 검증됨
    // 2. 로그인한 유저의 ID를 기반으로 정보 조회
    const fullUser = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] }, // 비밀번호는 제거
      // include: [ ... ] ← 추후 게시글, 팔로우 정보 등 필요 시 추가
    });

    if (!fullUser) {
      return res.status(404).send('사용자 정보를 찾을 수 없습니다.');
    }

    res.status(200).json(fullUser);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/* 마이페이지 정보 수정 (닉네임, 테마모드, 공개여부 등)   ★테스트 성공
- URL: http://localhost:3065/user/
- Method: PATCH
- 쿠키!
- Body (raw - JSON): 수정하고 싶은 필드만
{
  "nickname": "수정된닉네임",
  "theme_mode": "dark",
  "is_private": true,
  "profile_img": "https://example.com/updated.jpg",
  "phone": "010-9999-9999",
  "introduce": "윈터는 신이에요"
}
*/
router.patch('/', isLoggedIn, async (req, res, next) => {
  try {
    const {
      nickname, theme_mode, is_private, profile_img,
      phone, introduce // userinfos 테이블 필드
    } = req.body;

    const updateUserFields = {};
    const updateUserinfoFields = {};

    // users 테이블
    if (nickname) updateUserFields.nickname = nickname;
    if (theme_mode) updateUserFields.theme_mode = theme_mode;
    if (typeof is_private !== 'undefined') updateUserFields.is_private = is_private;
    if (profile_img) updateUserFields.profile_img = profile_img;

    // userinfos 테이블
    if (phone) updateUserinfoFields.phone = phone;
    if (introduce) updateUserinfoFields.introduce = introduce;

    // 둘 다 비어 있으면 요청 거부
    if (
      Object.keys(updateUserFields).length === 0 &&
      Object.keys(updateUserinfoFields).length === 0
    ) {
      return res.status(400).send('수정할 항목이 없습니다.');
    }

    // 유효성 검사 (기존처럼 nickname 등 체크 추가 가능)

    // 수정 실행
    if (Object.keys(updateUserFields).length > 0) {
      await User.update(updateUserFields, { where: { id: req.user.id } });
    }

    if (Object.keys(updateUserinfoFields).length > 0) {
      const [userinfo, created] = await db.UserInfo.findOrCreate({
        where: { users_id: req.user.id },
        defaults: {
          users_id: req.user.id,
        },
      });

      await userinfo.update(updateUserinfoFields);
    }

    // 최신 정보 반환 (users + userinfo 포함)
    const updatedUser = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
      include: [{ model: db.UserInfo, attributes: ['phone', 'introduce'] }],
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/*탈퇴 (소프트딜리트 형식임 db상에서 즉시삭제 안될꺼에요)   ★테스트 성공 
!!!! 아직 30일 지나면(상태 변경 되었을 때) 자동삭제, 1년지나면 휴먼계정 그 코드 없음... 삭제 안됨 사실상 빠르게 추가할 예정
- URL: http://localhost:3065/user/withdraw
- Method: DELETE
- Body: 없음 (None)
- 쿠키!
*/
router.delete('/withdraw', isLoggedIn, async (req, res, next) => {
  try {
    await userService.deactivateUser(req.user.id);

    // 로그아웃 처리 + 세션 정리
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return res.status(200).send('탈퇴 완료');
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

module.exports = router;



/*
// 회원가입할 때
{
  "email": "test5@example.com",
  "nickname": "테스트5",
  "password": "1234"
}

// 로그인할 때
// {
//   "email": "test1@example.com",
//   "password": "1234"  // 실제로 회원가입 시 사용한 비번
// }

// 수정할 때
// {
//   "nickname": "수정된닉네임",
//   "theme_mode": "dark",
//   "is_private": true,
//   "profile_img": "https://example.com/updated.jpg",
//   "phone": "010-9999-9999",
//   "introduce": "윈터는 신이에요"
// }

*/