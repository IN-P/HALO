const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middlewares");
const { User, Achievement, Badge, UserInfo, Follow, Myteam, Post, UserPoint, UserPayment, ActiveLog } = require("../models");


// nickname으로 userId 값 불러온 후 정보 가져오기
router.get("/:nickname", async (req, res, next) => {
  const { nickname } = req.params;
  try {
    const user = await User.findOne({
      where: { nickname },
      attributes: ['id'],
    });
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }
    const userId = user.id;

    const fullUser = await User.findOne({
    where: { id: userId },
    attributes: ["nickname", "profile_img", "theme_mode", "is_private", "myteam_id"],
    include: [
      { model: UserInfo },
      { model: Post },
      { model: Follow, as: 'Followings', include: [
        { model: User, as: 'Following', attributes: ['id', 'nickname', 'profile_img'], },
      ], },
      { model: Follow, as: 'Followers', include: [
        { model: User, as: 'Follower', attributes: ['id', 'nickname', 'profile_img'], },
      ], },
      { model: Achievement, attributes: ['id', 'name', 'description'], through: { attributes: ['createdAt', 'updatedAt'], }, },
      { model: Badge, attributes: ['id', 'name', 'description'], through: { attributes: ['createdAt', 'updatedAt'], }, },
      { model: Myteam, attributes: ['id', 'teamname', 'teamcolor', 'region'], },

      // 민감한 정보
      { model: UserPoint },
      { model: UserPayment },
    ],
  })

  // 계정 비공개 상태일 시 정보 접근 제한
  if (fullUser.is_private==1) {
    res.status(403).json("접근이 제한된 계정입니다"); }

  // 팔로우 데이터 숫자로 변환
  if (fullUser) {
    const data = fullUser.toJSON();
    data.Followers = data.Followers.length;
    data.Followings = data.Followings.length;
    data.Achievements = user.Achievements?.length || 0;
    res.status(200).json(data);
  } else {
    res.status(404).json("존재하지 않는 계정입니다") }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 계정 상태 공개/비공개
router.patch("/private", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      { is_private: req.body.is_private },
      { where: { id: req.user.id }, },
    );
    res.status(200).json({ is_private: req.body.is_private });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 닉네임 변경
router.patch("/nickname", isLoggedIn, async (req, res, next)=> {
  try {
    await User.update(
      { nickname: req.body.nickname,},
      { where: { id:req.user.id }, }
    );
    res.status(200).json({ nickname: req.body.nickname });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 프로필 사진 변경
router.patch("/image", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      { profile_img: req.body.profile_img,},
      { where: {id:req.user.id}, }
    );
    res.status(200).json({ profile_img: req.body.profile_img });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 소개문 변경
router.patch("/introduce", isLoggedIn, async (req, res, next) => {
  try {
    await UserInfo.update(
      { introduce : req.body.introduce, },
      { where: { users_id: req.user.id }, }
    );
    res.status(200).json({ introduce: req.body.introduce });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 전화번호 변경
router.patch("/phone", isLoggedIn, async (req, res, next) => {
try {
    await UserInfo.update(
      { phone : req.body.phone, },
      { where: { users_id: req.user.id }, }
    );
    res.status(200).json({ phone: req.body.phone });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 응원팀 변경
router.patch("/myteam", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      { myteam_id : req.body.myteam_id, },
      { where: { id: req.user.id }, }
    );
    res.status(200).json({ myteam_id: req.body.myteam_id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 테마 변경
router.patch("/theme", isLoggedIn, async (req, res, next) => {
  try {
    await User.update(
      { theme_mode : req.body.theme_mode, },
      { where: { id: req.user.id }, }
    );
    res.status(200).json({ theme_mode: req.body.theme_mode });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
