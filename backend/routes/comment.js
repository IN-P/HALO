// routes/comment.js
const express = require('express');
const router = express.Router();
const { Comment, CommentPath, User, Post } = require('../models');
const { isLoggedIn } = require('./middlewares');

// 1. 기본 댓글 등록: POST /comment/post/:postId
router.post('/post/:postId', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');

    const comment = await Comment.create({
      content: req.body.content,
      post_id: post.id,
      user_id: req.user.id,
    });

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{ model: User, attributes: ['id', 'nickname'] }],
    });

    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 2. 대댓글 등록: POST /comment/:commentId/reply
router.post('/:commentId/reply', isLoggedIn, async (req, res, next) => {
  try {
    const parent = await Comment.findByPk(req.params.commentId);
    if (!parent) return res.status(404).send('부모 댓글이 존재하지 않습니다.');

    const reply = await Comment.create({
      content: req.body.content,
      post_id: parent.post_id,
      user_id: req.user.id,
      parent_id: parent.id,
    });

    await CommentPath.create({ upper_id: reply.id, lower_id: reply.id, depth: 0 });

    const ancestors = await CommentPath.findAll({ where: { lower_id: parent.id } });
    const paths = ancestors.map((a) => ({
      upper_id: a.upper_id,
      lower_id: reply.id,
      depth: a.depth + 1,
    }));
    paths.push({ upper_id: parent.id, lower_id: reply.id, depth: 1 });
    await CommentPath.bulkCreate(paths);

    res.status(201).json(reply);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 3. 트리형 댓글 조회: GET /comment/post/:postId/tree
router.get('/post/:postId/tree', async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: { post_id: req.params.postId },
      include: [{ model: User, attributes: ['id', 'nickname'] }],
      order: [['id', 'ASC']],
    });

    const commentMap = {}, roots = [];

    comments.forEach(c => commentMap[c.id] = { ...c.toJSON(), replies: [] });
    comments.forEach(c => {
      if (c.parent_id) {
        commentMap[c.parent_id]?.replies.push(commentMap[c.id]);
      } else {
        roots.push(commentMap[c.id]);
      }
    });

    res.status(200).json(roots);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
