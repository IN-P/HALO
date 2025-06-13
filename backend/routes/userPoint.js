const express = require('express');
const router = express.Router();
const { User, UserPoint, PointLogs } = require("../models");
const { isLoggedIn } = require('./middlewares');

// POINT 로그(총 포인트, 내역) 가져오기
router.get('/log/:userId', isLoggedIn, async (req, res, next) => {
  try {
    // 유저 식별
    const { userId } = req.params;

    if (String(req.user.id) !== String(userId)) { return res.status(403).json("본인의 정보만 조회할 수 있습니다"); }

    const existUser = await User.findByPk(userId);
    if (!existUser) { return res.status(404).json("존재하지 않는 유저입니다"); }

    const fullUser = await User.findOne({
      where: { id: userId },
      include: [
        { model: UserPoint },
        { model: PointLogs },
      ],
    })

    if (fullUser) {
      const data = fullUser.toJSON();
      return res.status(200).json(data);
    } else {
      return res.status(404).json("유저 정보를 찾을 수 없습니다");
    }

  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;