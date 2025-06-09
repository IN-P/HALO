const express = require("express");
const router = express.Router();
const { Notification, User, TargetType } = require("../models");
const { isLoggedIn } = require("./middlewares");

// 현재 알림에 sender_id가 존재하지 않아 중복 검증 어려움
// 가능하면 content 내부의 ${} 값은 폰트색을 다르게 만들기

/* FOLLOW
to user 알림 생성
──────────────────────────
const fromUserName = await User.findOne({
  where: { id : fromUserId },
  attributes: [ "nickname" ],
});

await Notification.create({
  content: `${fromUserName.nickname} 님이 당신을 팔로우 했습니다`,
  users_id: toUserId,
  target_type_id: 3
});
──────────────────────────
*/

/* LIKE
좋아요 시 해당 게시글 작성자 알림 생성
──────────────────────────
const likedPost = await Post.findOne({
  where: { id: post.id },
  attributes: [ "content", "users_id" ],
});

await Notification.create({
  content: `${likedPost.content} 좋아요를 받았습니다`
  users_id: likedPost.users_id,
  target_type_id: 3,
})
──────────────────────────
*/

/* COMMENT
댓글 시 해당 게시글 작성자 알림 생성

const commentedPost = await Post.findOne({
  where: { id: post.id },
  attributes: [ "content", "users_id" ],
});

await Notification.create({
  content: `${commentedPost.content} 댓글이 달렸습니다`,
  users_id: commentedPost.users_id,
  target_type_id: 3,
})
*/

/* 

*/

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
    const notification = await Notification.findOne({
      where: { id: req.params.id },
    });
    if(!notification) return res.status(404).send("알림이 존재하지 않습니다");

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ message: "읽음처리됨", notification});
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/readall/:userId', async (req, res, next) => {
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

    res.status(200).json(notifications); // 수정된 알림 목록 반환
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;