// backend/middlewares/isAdmin.js

const { UserRole } = require('../security/role');

// 관리자 이상만 접근 가능 (일반회원 차단)
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  // role: 1~10 (관리자들만 허용), 0은 일반회원
  if (req.user.role >= 1 && req.user.role <= 10) {
    return next();
  }

  return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
};

module.exports = isAdmin;
