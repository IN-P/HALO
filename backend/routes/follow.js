const express = require('express');
const router = express.Router();
const { Follow, User, ActiveLog, Notification } = require('../models'); // ActiveLog, Notification 준혁 추가
const { where } = require('sequelize');
const { isLoggedIn } = require('./middlewares');

// 팔로우하기 http://localhost:3065/follow
router.post('/',isLoggedIn, async (req, res, next) => {
  console.log('📥 follow 요청 도착');
  console.log('📦 req.body:', req.body);
  console.log('👤 req.user:', req.user);
  console.log('......req.body:', req.body);

  try {
    const { toUserId } = req.body;
    const fromUserId = req.user.id;

    const existing = await Follow.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: '이미 팔로우한 사용자입니다.' });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신은 팔로우할 수 없습니다.' });
    }
    const follow = await Follow.create({
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });

    // 활동 내역 생성 - 준혁 추가
    await ActiveLog.create({
      action: "FOLLOW",
      target_id: toUserId,
      users_id: fromUserId,
      target_type_id: 3,
    });
    // 준혁 추가

    // 알림 생성 - 준혁 추가
    const fromUserName = await User.findOne({
      where: { id : fromUserId },
      attributes: [ "nickname" ],
    });

    await Notification.create({
      content: `${fromUserName.nickname} 님이 당신을 팔로우 했습니다`,
      users_id: toUserId,
      target_type_id: 3
    });
    // 준혁 추가

    res.status(201).json(follow);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로우 삭제 http://localhost:3065/following/2
router.delete('/following/:toUserId', async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = parseInt(req.params.toUserId, 10);

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신을 언팔로우 할 수 없습니다.' });
    }

    const existing = await Follow.findOne({
      where: { from_user_id: fromUserId, to_user_id: toUserId },
    });

    if (!existing) {
      return res.status(404).json({ message: '팔로우 관계가 존재하지 않습니다.' });
    }

    await existing.destroy();

    // 활동 내역 변경 - 준혁 추가
    const log = await ActiveLog.findOne({
      where: {
        action: "FOLLOW",
        target_id: toUserId,
        users_id: fromUserId,
        target_type_id: 3,
      },
    });
    if (!log) { return res.status(403).send("해당되는 기록이 없습니다"); }
    await log.update({ action: "UNFOLLOW" });
    // 준혁 추가

    res.status(200).json({ message: '팔로우가 취소되었습니다' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로워 삭제 http://localhost:3065/api/follower/1
router.delete('/follower/:fromUserId', async (req, res, next) => {
  try {
    const toUserId = req.user.id;
    const fromUserId = parseInt(req.params.fromUserId, 10);

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신을 제거할 수 없습니다' });
    }

    const existing = await Follow.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });
    if (!existing) {
      return res.status(404).json({ message: '해당 사용자는 당신을 팔로우 하고 있지 않습니다.' });
    }

    await existing.destroy();

    // 활동 내역 추가 - 준혁 추가
    await ActiveLog.create({
      action: "REMOVE_FOLLOWER",
      target_id: fromUserId,
      users_id: toUserId,
      target_type_id: 3,
    });
    // 활동 내역 변경
    const log = await ActiveLog.findOne({
      where: {
        action: "FOLLOW",
        target_id: toUserId,
        users_id: fromUserId,
        target_type_id: 3,
      },
    });
    if (!log) { return res.status(403).send("해당되는 기록이 없습니다"); }
    await log.update({ action: "REMOVED_FOLLOW" });
    // 준혁 추가

    res.status(200).json({ message: '해당 팔로워를 제거했습니다.' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로잉 목록조회 http://localhost:3065/api/followings
router.get('/followings', async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const followings = await Follow.findAll({
      where: { from_user_id: fromUserId },
      include: [
        {
          model: User,
          as: 'Followings',
          attributes: ['id', 'nickname'],
        },
      ],
    });
    res.status(200).json(followings.map(f => f.Followings));
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로워 목록조회 http://localhost:3065/api/followers
router.get('/followers', async (req, res, next) => {
  try {
    const toUserId = req.user.id;

    const followers = await Follow.findAll({
      where: { to_user_id: toUserId },
      include: [{
        model: User,
        as: 'Followers',
        attributes: ['id', 'nickname'],
      }],
    });
    res.status(200).json(followers.map(f => f.Followers));
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로우 체크
router.get('/check/:toUserId', async (req, res, next) => {
  try {
    const fromUserId = req.user?.id;
    const toUserId = parseInt(req.params.toUserId, 10);

    const existing = await Follow.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });

    res.status(200).json({ isFollowing: !!existing });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
