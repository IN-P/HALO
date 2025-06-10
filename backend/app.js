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
const path = require('path'); //## 인
const postRouter = require('./routes/post'); //## 인
const postsRouter = require('./routes/posts'); //## 인
const hashtagRouter = require('./routes/hashtag'); //## 인
const commentRouter = require('./routes/comment'); //## 인
const followRouter = require('./routes/follow');//## 율비
const blockRouter = require('./routes/block');//## 율비
const reportRouter = require('./routes/report');//## 율비
const inquiryRouter = require('./routes/inquiry');//## 율비
const profile = require("./routes/profile"); //## n준혁
const notification = require("./routes/notification"); //## 준혁
const activeLog = require("./routes/active_log"); //## 준혁
const quizRouter = require('./routes/quiz');  //## 경미
const adminQuizRouter = require('./routes/adminQuiz');  //## 경미 
const playerDrawRouter = require('./routes/playerDraw');   //## 경미
const adminPlayerRouter = require('./routes/adminPlayer');   //## 경미
const weatherRouter = require('./routes/weather'); //## 재원
const chatRouter = require('./routes/chat') //## 재원
const userSearchRouter = require('./routes/userSearch'); // ## 재원
const resetPasswordRouter = require('./routes/resetPassword'); //윤기
const authRouter = require('./routes/auth'); // 윤기 간편 로그인 라우터 추가
const achievements = require('./routes/achievements'); // 준혁
const badges = require('./routes/badges'); // 준혁
const kakaopayRouter = require('./routes/kakaopay'); //윤기
const adminRouter = require('./routes/useradmin');
const advertisementRouter = require('./routes/advertisement'); // 재원

// .env 적용
dotenv.config();

app.use('/img', express.static(path.join(__dirname, 'uploads'))); //##윤기 추가
app.use('/advertisement_uploads', express.static('advertisement_uploads')); // 재원 광고 이미지


// 미들웨어
app.use(morgan('dev'));
app.use(cors({                      //## 윤기
  origin: 'http://localhost:3000',
  credentials: true,
}));    //## 윤기 여기까지
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', //  추가됨
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //  추가됨
  },
}));

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //## 인
app.use('/user', userRouter); //## 윤기
app.use('/post', postRouter); //## 인
app.use('/posts', postsRouter); //## 인
app.use('/hashtag', hashtagRouter); //## 인
app.use('/comment', commentRouter); //## 인
app.use('/follow', followRouter); //## 율비
app.use('/block', blockRouter); //## 율비
app.use('/report', reportRouter); //## 율비
app.use('/inquiry',inquiryRouter); //## 율비
app.use("/profile", profile); //## 준혁
app.use("/notification", notification); //## 준혁
app.use("/log", activeLog); //## 준혁
app.use("/achievements", achievements) // ## 준혁
app.use("/badges", badges) // ## 준혁

app.use('/event/quizzes', quizRouter);  //## 경미
app.use('/event/admin', adminQuizRouter);  //## 경미
app.use('/store/draw', playerDrawRouter);   //## 경미
app.use('/store/admin', adminPlayerRouter);   //## 경미
app.use('/api/chat', chatRouter); //## 재원
app.use('/api/weather', weatherRouter); //## 재원 날씨
app.use('/userSearch', userSearchRouter); // 재원 유저검색
app.use('/user/reset-password', resetPasswordRouter); //윤기 비번재발급
app.use('/auth', authRouter); //윤기추가 /auth/google, /auth/google/callback 용
app.use('/pay', kakaopayRouter); //윤기추가
app.use('/api/admin', adminRouter);
app.use('/advertisement', advertisementRouter); // 재원 광고 라우터

module.exports = app;

