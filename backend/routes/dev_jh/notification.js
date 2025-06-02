const express = require("express");
const router = express.Router();
const { Notification, User, TargetType } = require("../../models");
const { isLoggedIn } = require("../middlewares");


// userId(users의 id)로 알림 불러오기
router.get('/:userId', /*isLoggedIn,*/ async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { users_id: req.params.userId },
      include: [
        {
          model: TargetType,  
          attributes: ['id', 'code'],
        },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 알림의 id 값으로 읽음여부 업데이트하기
router.patch("/:id/read", async( req, res, next) => {
  try{
    const notification = await Notification.findById(req.params.id);
    if(!notification) return res.status(404).send("알림이 존재하지 않습니다");

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ message: "읽음처리됨", notification});
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;