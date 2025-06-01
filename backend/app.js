// backend/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./models');

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
