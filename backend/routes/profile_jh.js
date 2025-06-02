const express = require("express");
const router = express.Router();
const { User, Achievements, Badge, UserInfo } = require("../models");


// 닉네임으로 특정 사용자 정보 가져오기
router.get("/:nickname", async (req, res, next) => {
  try {
    const fullUser = await User.findOne({
      where: { nickname: req.params.nickname },
      attributes: ["nickname", "profile_img", "theme_mode", "is_private"],
      include: [
        { model: User, as: "Followings", attributes: ["id"] },
        { model: User, as: "Followers", attributes: ["id"] },
        { model: UserInfo, attributes: ["introduce"] },
        {
          model: Achievements,
          attributes: ["id", "title"],
          through: { attributes: ["createdAt"] },
        },
        {
          model: Badge,
          attributes: ["id", "title", "img"],
          through: { attributes: ["createdAt"] },
        },
      ],
    });
    if (fullUser) {
      const data = fullUser.toJSON();
      data.Posts = data.Posts.length;
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;
      data.user_achievements = data.user_achievements.length;
      data.user_badges = data.user_badges.length;
      res.status(200).json(data);
      console.log(nickname+" info : ", data);
    } else {
      res.status(404).json("존재하지 않는 계정입니다")
    }

  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
