const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middlewares");
const { User, Block, Achievement, Badge, UserInfo, Follow, Myteam, Post, UserPoint, UserPayment, ActiveLog } = require("../models");


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
    attributes: ["id", "nickname", "profile_img", "theme_mode", "is_private", "myteam_id", "role", "email"],
    include: [
      { model: UserInfo },
      { model: Post },
      { model: Follow, as: 'Followings', include: [
        { model: User, as: 'Followers', attributes: ['id', 'nickname', 'profile_img'], }
      ], },
      { model: Follow, as: 'Followers', include: [
        { model: User, as: 'Followings', attributes: ['id', 'nickname', 'profile_img'], },
        
      ], },
      { model: Post, as: 'BookmarkedPosts', attributes: ['id', 'content', 'createdAt'], through: { attributes: [] }, },
      { model: Achievement, attributes: ['id', 'name', 'description'], through: { attributes: ['createdAt', 'updatedAt'], }, },
      { model: Badge, attributes: ['id', 'name', 'img', 'description'], through: { attributes: ['createdAt', 'updatedAt'], }, },
      { model: Myteam, attributes: ['id', 'teamname', 'teamcolor', 'region'], },
      { model: Block, as: 'Blockeds', include: [
        { model: User, as: 'Blocked', attributes: ['id', 'nickname', 'profile_img'], } ] },
      { model: ActiveLog },
      // 민감한 정보
      { model: UserPoint },
      { model: UserPayment },
    ],
  })

  // 계정 비공개 상태일 시 정보 접근 제한
  if (fullUser.is_private==1) {
    res.status(403).json("접근이 제한된 계정입니다"); }

  if (fullUser) {
    const data = fullUser.toJSON();
    res.status(200).json(data);
  } else {
    res.status(404).json("존재하지 않는 계정입니다") }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 사용자 정보 통합 수정
router.patch("/update", isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { nickname, email, is_private, profile_img, myteam_id, theme_mode, } = req.body; 
    const { introduce, phone } = req.body;

    // 수정 필드 모음
    const userFields = {};
    if (nickname !== undefined) userFields.nickname = nickname;
    if (email !== undefined) userFields.email = email;
    if (is_private !== undefined) userFields.is_private = is_private;
    if (profile_img !== undefined) userFields.profile_img = profile_img;
    if (myteam_id !== undefined) userFields.myteam_id = myteam_id;
    if (theme_mode !== undefined) userFields.theme_mode = theme_mode;

    // User 테이블 업데이트
    if (Object.keys(userFields).length > 0) {
      await User.update(userFields, { where: { id: userId } });
    }

    // UserInfo 테이블 업데이트할 필드 모음
    const userInfoFields = {};
    if (introduce !== undefined) userInfoFields.introduce = introduce;
    if (phone !== undefined) userInfoFields.phone = phone;

    // UserInfo 테이블 업데이트
    if (Object.keys(userInfoFields).length > 0) {
      await UserInfo.update(userInfoFields, { where: { users_id: userId } });
    }

    res.status(200).json({ message: "사용자 정보가 성공적으로 변경되었습니다." });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
