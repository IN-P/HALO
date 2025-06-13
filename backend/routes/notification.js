const express = require("express");
const router = express.Router();
const { Notification, User, TargetType } = require("../models");
const { isLoggedIn } = require("./middlewares");
const { Op } = require('sequelize');

// userId(users의 id)로 알림 불러오기
router.get('/:userId', isLoggedIn, async (req, res, next) => {
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

router.patch('/read/:userId', isLoggedIn, async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { users_id: req.params.userId } }
    );

    // 읽음 처리 후, 다시 전체 알림 조회
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
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/delete/:userId/:notificationId', async (req, res) => {
  const { userId, notificationId } = req.params;

  try {
    if (notificationId === 'all') {
      // 전체 삭제 (단, target_type_id 9, 10 제외)
      await Notification.destroy({
        where: {
          users_id: userId,
          target_type_id: {
            [Op.notIn]: [9, 10],
          },
        },
      });
    } else {
      // 개별 삭제
      await Notification.destroy({
        where: {
          id: notificationId,
          users_id: userId,
        },
      });
    }

    return res.status(200).json({ message: '삭제 완료' });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

module.exports = router;