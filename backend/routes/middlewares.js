// 로그인이냐 아니냐

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send('로그인이 필요합니다.');
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(403).send('이미 로그인된 상태입니다.');
};
