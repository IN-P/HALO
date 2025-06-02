// backend/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./models');

const followRouter = require('./routes/follow');//조율비
const blockRouter = require('./routes/block');//조율비
//const inquiryRouter = require('./routes/inquiry');//조율비
//const reportRouter = require('./routes/report');//조율비

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

// DB 연결
db.sequelize.sync()
  .then(() => console.log('DB 연결 성공'))
  .catch(console.error);

// 라우터 연결 (나중에 추가 예정)

app.use('/api', followRouter);//조율비
app.use('/api', blockRouter);//조율비
//app.use('/api/inquiry',inquiryRouter);//조율비
//app.use('/api/report', reportRouter);//조율비

app.listen(3065, () => {
  console.log('🚀 서버 실행 중! http://localhost:3065');
});
