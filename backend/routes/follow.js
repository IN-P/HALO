const express = require('express');
const router = express.Router();
const { Follow, User, ActiveLog, Notification } = require('../models'); // ActiveLog, Notification 준혁 추가
const { where } = require('sequelize');
const { isLoggedIn } = require('./middlewares');

const { sendNotification } = require('../notificationSocket'); // 준혁추가 실시간 알림

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

    // 준혁 추가
    // 활동 내역 생성
    await ActiveLog.create({
      action: "CREATE",
      target_id: toUserId,
      users_id: fromUserId,
      target_type_id: 3,
    });
    // 알림 생성
    const fromUserName = await User.findOne({
      where: { id : fromUserId },
      attributes: [ "nickname" ],
    });
    await Notification.create({
      content: `${fromUserName.nickname}`,
      users_id: toUserId,
      target_type_id: 3
    });
    // 소켓 푸시
    sendNotification(toUserId, {
      type: 'FOLLOW',
      message: '팔로워가 생겼습니다',
    });
    //

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

    // 준혁 : 활동 내역
    await ActiveLog.create({
      action: "DELETE",
      target_id: toUserId,
      users_id: fromUserId,
      target_type_id: 3,
    });
    //

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

    // 준혁 : 활동 내역 생성
    await ActiveLog.create({
      action: "DELETE",
      target_id: fromUserId,
      users_id: toUserId,
      target_type_id: 3,
    });
    //

    res.status(200).json({ message: '해당 팔로워를 제거했습니다.' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로잉 목록조회 http://localhost:3065/follow/followings
router.get('/followings', async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const followings = await Follow.findAll({
      where: { from_user_id: fromUserId },
      include: [{
        model: User,
        as: 'Followers', // ✅ "to_user_id" 기준으로 '내가 팔로우한 대상'을 가져오려면
        attributes: ['id', 'nickname', 'profile_img'],
      }],
    });
    res.status(200).json(followings.map(f => f.Followers)); // ✅ "팔로우 대상"
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
        as: 'Followings', // ✅ "from_user_id" 기준으로 '나를 팔로우한 사람'을 가져오려면
        attributes: ['id', 'nickname', 'profile_img'],
      }],
    });
    res.status(200).json(followers.map(f => f.Followings)); // ✅ "팔로워"
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 닉네임으로 팔로워 목록 조회
router.get('/followers/nickname/:nickname', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { nickname: req.params.nickname } });
    if (!user) return res.status(404).json({ message: '사용자 없음' });

    const followers = await Follow.findAll({
      where: { to_user_id: user.id },
      include: [{
        model: User,
        as: 'Followings', // from_user_id = 나를 팔로우한 사람
        attributes: ['id', 'nickname', 'profile_img'],
      }],
    });

    res.status(200).json(followers.map(f => f.Followings));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 닉네임으로 팔로잉 목록 조회
router.get('/followings/nickname/:nickname', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { nickname: req.params.nickname } });
    if (!user) return res.status(404).json({ message: '사용자 없음' });

    const followings = await Follow.findAll({
      where: { from_user_id: user.id },
      include: [{
        model: User,
        as: 'Followers', // to_user_id = 내가 팔로우한 대상
        attributes: ['id', 'nickname', 'profile_img'],
      }],
    });

    res.status(200).json(followings.map(f => f.Followers));
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
