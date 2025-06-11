const express = require("express");
const router = express.Router();
const { ActiveLog, TargetType, User, Post, Comment } = require('../models');
const { isLoggedIn } = require("./middlewares");
const getReportedUserId = require('../utils/report/getReportedUserId');


// userId로 활동 내역 불러오기
router.get("/:userId", isLoggedIn, async (req, res, next) => {
  try {

    // 로그인 된 사용자와 불러오려는 사용자의 id 값 비교
    if (String(req.params.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: "본인의 정보만 조회할 수 있습니다" })
    }

    const personalActiveLogs = await ActiveLog.findAll({
      where: { users_id: req.params.userId },
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


// 최근 활동 참조 테이블 불러오기
router.get("/:target_type_id/:target_id", isLoggedIn, async (req, res, next) => {
  const { target_type_id, target_id } = req.params;
  try {
    // target_type 테이블 code 값 가져오기
    const targetType = await TargetType.findOne({ where: { id: target_type_id } });
    if (!targetType) { return res.status(404).json({ message: 'Target type not found' }); }

    // 2. code 값에 따라 처리 분기
    switch (targetType.code) {
      case 'user':
        const user = await User.findOne({ where: { id: target_id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json(user);

      case 'post':
        const post = await Post.findOne({ where: { id: target_id } });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        return res.json(post);

      case 'comment':
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

// 신고 대상 리소스에서 작성자 ID만 추출하는 전용 라우트
// 경로: /active-log/reported-user/:target_type_id/:target_id
router.get("/reported-user/:target_type_id/:target_id", isLoggedIn, async (req, res, next) => {
  const { target_type_id, target_id } = req.params;
  try {
    const targetType = await TargetType.findOne({ where: { id: target_type_id } });
    if (!targetType) {
      return res.status(404).json({ message: 'Target type not found' });
    }

    let userId = null;

    switch (targetType.code.toLowerCase()) {
      case 'user':
        const user = await User.findOne({ where: { id: target_id } });
        userId = user?.id;
        break;

      case 'chat': // ✅ 'chat'은 target_id = 유저 ID
        userId = parseInt(target_id, 10);
        break;

      case 'post':
        const post = await Post.findOne({ where: { id: target_id } });
        userId = post?.user_id;
        break;

      case 'comment':
        const comment = await Comment.findOne({ where: { id: target_id } });
        userId = comment?.user_id;
        break;

      default:
        return res.status(400).json({ message: 'Unknown target type code' });
    }
    if (!userId) {
      return res.status(404).json({ message: '작성자 유저 ID를 찾을 수 없습니다.' });
    }

    return res.json({ reportedUserId: userId });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;