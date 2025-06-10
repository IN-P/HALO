// middlewares/isAdminUserManager.js
const { UserRole } = require('../security/role');

module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  if (req.user.role === UserRole.MASTER_ADMIN || req.user.role === UserRole.USER_MANAGER) {
    return next();
  }

  return res.status(403).json({ message: '접근 권한이 없습니다.' });
};
