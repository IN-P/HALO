const express = require("express");
const router = express.Router();
const { ActiveLog, TargetType, User, Post, Comment } = require('../models');
const { isLoggedIn } = require("./middlewares");

/* POST ( 해당하는 CRUD try 절 내부 res.status(200) 바로 앞에 넣어주세요 )

게시물 create 로그 생성
──────────────────────────
await ActiveLog.create({
  action: "CREATE",
  target_id: post.id,
  users_id: req.user.id,
  target_type: 1
})
──────────────────────────


게시물 update 로그 업데이트
──────────────────────────
const log = await ActiveLog.findOne({
  where: {
    target_id: post.id,
    users_id: req.user.id,
    target_type: 1,
  }
});
if (!log) { return res.status(403).send("해당되는 기록이 없습니다") }

await log.update({ action: "UPDATED" });
──────────────────────────


게시물 delete 로그 생성
──────────────────────────
await ActiveLog.create({
  action: "DELETE",
  target_id: req.params.postId,
  users_id: req.user.id,
  target_type: 1,
});
──────────────────────────


좋아요 생성
──────────────────────────
await ActiveLog.create({
  action: "LIKE",
  target_id: post.id,
  users_id: req.user.id,
  target_type: 1,
});
──────────────────────────


좋아요 취소
──────────────────────────
const log = await ActiveLog.findOne({
  where: {
    target_id: post.id,
    users_id: req.user.id,
    target_type: 1,
});
if (!log) { return res.status(403).send("해당되는 기록이 없습니다");}

await log.update({ action: "UNLIKE" });
──────────────────────────

*/

/* COMMENT ( 해당하는 CRUD try 절 내부 res.status(200) 바로 앞에 넣어주세요 )

댓글 CREATE 시 로그 생성
──────────────────────────
await ActiveLog.create({
  action: "CREATE",
  target_id: comment.id,
  users_id: req.user.id,
  target_type: 2
} );
──────────────────────────


댓글 UPDATE 시 로그 업데이트
──────────────────────────
const log = await ActiveLog.findOne({
  where: {
    target_id: comment.id
    users_id: req.user.id,
    target_type_id: 3, 
} );

if (!log) {
return res.status(403).send("해당되는 기록이 없습니다"); }

await log.update({ action: "UPDATE" });
──────────────────────────


댓글 DELETE 로그 생성
──────────────────────────
await ActiveLog.create({
  action: "DELETE",
  target_id: comment.id,
  users_id: req.user.id,
  target_type: 2,
} );
──────────────────────────

*/

/* FOLLOW ( 해당하는 CRUD try 절 내부 res.status(200) 바로 앞에 넣어주세요 )

유저 FOLLOW 시 로그 생성
──────────────────────────
await ActiveLog.create({
  action: "FOLLOW",
  target_id: toUserId,
  users_id: fromUserId,
  target_type_id: 3,
});
──────────────────────────

유저 UNFOLLOW 시 로그 업데이트
──────────────────────────
const log = await ActiveLog.findOne({
  where: {
    target_id: toUserId,
    users_id: fromUserId,
    target_type_id: 3,
  },
});

if (!log) {
  return res.status(403).send("해당되는 기록이 없습니다"); }

await log.update({ action: "UNFOLLOW" });
──────────────────────────

*/

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