const express = require('express');
const router = express.Router();
const { Post, User, Image, Comment, Hashtag, Notification } = require('../models'); // 준혁 : Notification
const isAdmin = require('../middlewares/isAdmin');

const { sendNotification } = require('../notificationSocket'); // 준혁 : 알림소켓

// [1] 전체 포스트 리스트 (관리자 전용, 댓글수 포함)
router.get('/posts', isAdmin, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: Image },
        { model: Comment, attributes: ['id'] },
        { model: Hashtag, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    const postsWithCount = posts.map(post => {
      const plain = post.toJSON();
      plain.commentCount = Array.isArray(plain.Comments) ? plain.Comments.length : 0;
      return plain;
    });
    res.json(postsWithCount);
  } catch (error) {
    next(error);
  }
});

// [2] 단일 포스트 상세
router.get('/post/:id', isAdmin, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: Image },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'nickname'] }],
          order: [['id', 'ASC']],
        },
        { model: Hashtag, attributes: ['id', 'name'] },
      ],
      order: [
        [Image, 'id', 'ASC'],
        [Comment, 'id', 'ASC'],
      ],
    });
    if (!post) return res.status(404).send('Not Found');
    res.json(post);
  } catch (error) {
    next(error);
  }
});

// [3] 포스트 삭제 (관리자 전용, 하드 삭제)
router.delete('/post/:id', isAdmin, async (req, res, next) => {
  try {
    const postId = req.params.id;
    // 준혁 : 알림 정보를 위해 미래 정보 추출
    let originPost = await Post.findByPk(postId);
    // 해당 포스트의 리그램 아이디가 NULL이 나올 때까지 반복
    while (originPost.regram_id !== null) {
    originPost = await Post.findOne({ where: { id: originPost.regram_id } });
      if (!originPost) { throw new Error('원본 게시물을 찾을 수 없습니다.'); } }
    // 리그램글, 댓글, 이미지 먼저 삭제
    const regrams = await Post.findAll({ where: { regram_id: postId } });
    for (const rg of regrams) {
      await Comment.destroy({ where: { post_id: rg.id } });
      await Image.destroy({ where: { post_id: rg.id } });
    }
    await Post.destroy({ where: { regram_id: postId } });
    await Comment.destroy({ where: { post_id: postId } });
    await Image.destroy({ where: { post_id: postId } });
    await Post.destroy({ where: { id: postId } });

    // 준혁 알림 생성
    await Notification.create({
      content: originPost.content,
      users_id: originPost.user_id,
      target_type_id : 10,
    })
    sendNotification(originPost.user_id, {
      type: "RESTRICT",
      message: '관리자가 삭제했습니다'
    });

    res.send('ok');
  } catch (error) {
    next(error);
  }
});

// [4] 포스트 수정 권고 (알림 미구현/추후 연결)
router.post('/post/:id/warn', isAdmin, async (req, res, next) => {
  try {
    // 준혁 알림 생성
    const warnedPost = await Post.findByPk(req.params.id)
    if (!warnedPost) { return res.status(404).send('해당 게시물을 찾을 수 없습니다.'); }
    await Notification.create({
      content: warnedPost.content,
      users_id: warnedPost.user_id,
      target_type_id : 9,
    })
    sendNotification(warnedPost.user_id, {
      type: "WARN",
      message: '관리자가 경고했습니다'
    });
    res.send('ok');
  } catch (error) {
    next(error);
  }
});

// [5] 댓글 삭제 (관리자 전용, 소프트 삭제)
router.delete('/comment/:id', isAdmin, async (req, res, next) => {
  try {
    await Comment.update({ is_deleted: true }, { where: { id: req.params.id } });
    res.send('ok');
  } catch (error) {
    next(error);
  }
});

// [6] 댓글 수정 권고 (알림 미구현/추후 연결)
router.post('/comment/:id/warn', isAdmin, async (req, res, next) => {
  try {
    // TODO: 알림 기능 팀원 구현 예정
    res.send('ok');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
