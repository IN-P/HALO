// backend/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport'); //##윤기 추가
require('./passport')(); //##윤기 추가
const db = require('./models');
const userRouter = require('./routes/user'); //##윤기 추가됨 깃충돌 무조건 나니까 조심
const initUserStatus = require('./utils/init/initUserStatus'); //## 윤기 추가
const initMembership = require('./utils/init/initMembership');  //## 윤기 추가
const initMyTeam = require('./utils/init/initMyTeam'); // ##윤기 추가
const initSocials = require('./utils/init/initSocials') //##윤기 추가
require('./utils/scheduler/autoDeleteScheduler')(); //## 윤기추가 - 계정 삭제 스케줄려
require('./utils/scheduler/autoDormantScheduler')(); //## 윤기 추가 - 휴면 전환 스케줄러
const weatherRouter = require('./routes/weather'); // ## 재원 날씨


// .env 적용
dotenv.config();

// 미들웨어
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: { httpOnly: true, secure: false },
}));
app.use('/api/chat', require('./routes/chat')); // 재원
app.use('/api/weather', weatherRouter); // 재원 날씨

// 반드시 session 뒤에 호출! 이것도 추가입니다
app.use(passport.initialize());  //##윤기 <-- 이거 꼭 넣어야 req.isAuthenticated가 생김
app.use(passport.session()); //##윤기

// DB 연결 ##윤기 추가
db.sequelize.sync()
  .then(async () => {
    console.log('DB 연결 성공');

    await initUserStatus();   //## 윤기 추가
    await initMembership();    //## 윤기 추가
    await initMyTeam();     //## 윤기 추가
    await initSocials();     //## 윤기 추가
    console.log('기본 데이터 초기화 완료'); //## 윤기 추가
  })
  .catch(console.error); //## 윤기 추가

// 라우터 연결 (나중에 추가 예정)
app.use('/user', userRouter); //## 윤기
module.exports = app;