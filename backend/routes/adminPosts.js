// backend/routes/adminPosts.js
const express = require('express');
const router = express.Router();
const { Post, User, Image, Comment, Hashtag, Notification } = require('../models');
const isAdmin = require('../middlewares/isAdmin');

// [1] 전체 포스트 리스트 (관리자 전용, 댓글수 포함)
router.get('/posts', isAdmin, async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: Image },
        { model: Comment, attributes: ['id'] }, // 댓글 id만 (댓글수 세려고)
        { model: Hashtag, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 댓글수 붙여서 보내주기 (프론트에서 바로 씀)
    const postsWithCount = posts.map(post => {
      // toJSON()으로 plain object로 만들어줘야 배열길이 등 오류 안남
      const plain = post.toJSON();
      plain.commentCount = Array.isArray(plain.Comments) ? plain.Comments.length : 0;
      return plain;
    });

    res.json(postsWithCount);
  } catch (error) {
    next(error);
  }
});

// [2] 단일 포스트 상세 (댓글, 이미지, 유저 다 포함)
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

// [3] 포스트 삭제 (관리자 전용, soft delete)
router.delete('/post/:id', isAdmin, async (req, res, next) => {
  try {
    await Post.update({ is_deleted: true }, { where: { id: req.params.id } });
    res.send('ok');
  } catch (error) {
    next(error);
  }
});

// [4] 수정 권고 알림 (관리자 전용)
router.post('/post/:id/warn', isAdmin, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).send('Not Found');
    await Notification.create({
      users_id: post.user_id,
      content: '관리자가 게시글 수정을 권고했습니다.',
      target_type_id: 1,
    });
    res.send('ok');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
