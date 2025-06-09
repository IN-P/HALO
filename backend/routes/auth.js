const express = require('express');
const passport = require('passport');

const router = express.Router();

// [1] 구글 로그인 요청
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// [2] 구글 로그인 콜백
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('http://localhost:3000');
  }
);

// [3] 카카오 로그인 요청
router.get('/kakao', passport.authenticate('kakao'));

// [4] 카카오 로그인 콜백
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('http://localhost:3000');
  }
);

module.exports = router;
