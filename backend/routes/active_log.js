const express = require("express");
const router = express.Router();
const { ActiveLog, TargetType, User, Post, Comment } = require('../models');
const { isLoggedIn } = require("./middlewares");

// userId로 활동 내역 불러오기
router.get("/:userId", isLoggedIn, async (req, res, next) => {
  try {

    // 로그인 된 사용자와 불러오려는 사용자의 id 값 비교
    if (String(req.params.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "본인의 정보만 조회할 수 있습니다" })
    }

    const personalActiveLogs = await ActiveLog.findAll({
      where: { users_id: req.params.userId },
      attributes: ["action", "target_id", "target_type_id", "createdAt", "updatedAt"],
      include: [
        {
          model: TargetType,  
          attributes: ['id', 'code'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    if (personalActiveLogs) {
    res.status(200).json(personalActiveLogs);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 최근 활동 참조용 테이블 불러오기
router.get("/:target_type_id/:target_id", isLoggedIn, async (req, res, next) => {
  const { target_type_id, target_id } = req.params;
  try {
    // 1. target_type 테이블 code 값 가져오기
    const targetType = await TargetType.findOne({ where: { id: target_type_id } });
    if (!targetType) {
      return res.status(404).json({ message: 'Target type not found' });
    }

    // 2. code 값에 따라 처리 분기
    switch(targetType.code) {
      case 'USER':
        const user = await User.findOne({ where: { id: target_id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);

      case 'POST':
        const post = await Post.findOne({ where: { id: target_id } });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        return res.json(post);

      case 'COMMENT':
        const comment = await Comment.findOne({ where: { id: target_id } });
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        return res.json(comment);

      default:
        return res.status(400).json({ message: 'Unknown target type code' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;