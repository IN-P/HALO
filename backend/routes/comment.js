const express = require('express');
const router = express.Router();
const { Comment, User, Post, ActiveLog, Notification, Mention } = require('../models');
const { isLoggedIn } = require('./middlewares');
const { sendNotification } = require('../notificationSocket');
const { checkAndAssignCommentAchievements } = require('../services/achievement/comment');
const { Op } = require('sequelize');

// 댓글 등록
router.post('/post/:postId', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');

    const comment = await Comment.create({
      content: req.body.content,
      post_id: post.id,
      user_id: req.user.id,
    });

    // 멘션 감지
    const mentions = req.body.content.match(/@[^\s@]+/g);
    if (mentions) {
      await Promise.all(mentions.map(async tag => {
        const nickname = tag.slice(1);
        const receiver = await User.findOne({ where: { nickname } });
        if (receiver) {
          await Mention.create({
            senders_id: req.user.id,
            receiver_id: receiver.id,
            target_type: 'COMMENT',
            target_id: comment.id,
            context: req.body.content,
            createAt: new Date(),
          });
          await Notification.create({
            content: req.user.nickname,
            users_id: receiver.id,
            target_type_id: 8,
          });
          sendNotification(receiver.id, {
            type: "MENTION",
            message: "당신을 언급했습니다",
          });
        }
      }));
    }

    // 수동 receiver_id 멘션
    if (req.body.receiver_id) {
      await Mention.create({
        senders_id: req.user.id,
        receiver_id: req.body.receiver_id,
        target_type: 'COMMENT',
        target_id: comment.id,
        context: req.body.content,
        createAt: new Date(),
      });
    }

    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }],
    });

    const totalComments = await Comment.count({ where: { post_id: post.id, is_deleted: false } });

    await ActiveLog.create({
      action: "CREATE",
      target_id: comment.id,
      users_id: req.user.id,
      target_type_id: 2,
    });

    if (post.user_id !== req.user.id) {
      await Notification.create({
        content: `${post.content}`,
        users_id: post.user_id,
        target_type_id: 2,
      });
      sendNotification(post.user_id, {
        type: 'COMMENT',
        message: '댓글이 달렸습니다',
      });
    }

    await checkAndAssignCommentAchievements(req.user.id);

    res.status(201).json({ comment: fullComment, postId: post.id, commentCount: totalComments });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 대댓글 등록
router.post('/:commentId/reply', isLoggedIn, async (req, res, next) => {
  try {
    const parent = await Comment.findByPk(req.params.commentId);
    if (!parent) return res.status(404).send('부모 댓글이 존재하지 않습니다.');
    if (parent.parent_id) return res.status(400).send('2단계(대댓글)까지만 허용');

    const reply = await Comment.create({
      content: req.body.content,
      post_id: parent.post_id,
      user_id: req.user.id,
      parent_id: parent.id,
    });

    const totalComments = await Comment.count({ where: { post_id: parent.post_id, is_deleted: false } });

    await ActiveLog.create({
      action: "CREATE",
      target_id: reply.id,
      users_id: req.user.id,
      target_type_id: 4,
    });

    if (req.body.receiver_id) {
      await Mention.create({
        senders_id: req.user.id,
        receiver_id: req.body.receiver_id,
        target_type: 'COMMENT',
        target_id: reply.id,
        context: req.body.content,
        createAt: new Date(),
      });
    }

    const repliedComment = await Comment.findOne({ where: { id: parent.id }, attributes: ['content', 'user_id'] });
    const post = await Post.findOne({ where: { id: parent.post_id }, attributes: ['user_id', 'content'] });

    if (post.user_id !== req.user.id && post.user_id !== repliedComment.user_id) {
      await Notification.create({ content: post.content, users_id: post.user_id, target_type_id: 2 });
      sendNotification(post.user_id, { type: 'COMMENT', message: '포스트에 새로운 댓글이 달렸습니다' });
    }
    if (repliedComment.user_id !== req.user.id) {
      await Notification.create({ content: repliedComment.content, users_id: repliedComment.user_id, target_type_id: 4 });
      sendNotification(repliedComment.user_id, { type: 'REPLY', message: '답장이 달렸습니다' });
    }

    res.status(201).json({ comment: reply, postId: parent.post_id, commentCount: totalComments });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 트리형 댓글 조회
router.get('/post/:postId/tree', async (req, res, next) => {
  try {
    const { Block } = require('../models');

    let blockedUserIds = [];
    if (req.user) {
      const blocks = await Block.findAll({
        where: {
          [Op.or]: [
            { from_user_id: req.user.id },
            { to_user_id: req.user.id },
          ],
        },
      });
      blockedUserIds = blocks.map(b =>
        b.from_user_id === req.user.id ? b.to_user_id : b.from_user_id
      );
    }

    const comments = await Comment.findAll({
      where: {
        post_id: req.params.postId,
        user_id: { [Op.notIn]: blockedUserIds },
      },
      include: [
        { model: User, attributes: ['id', 'nickname', 'profile_img'] },
        { model: Comment, as: 'Parent', include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }] },
      ],
      order: [['id', 'ASC']],
    });

    const commentMap = {}, roots = [];
    comments.forEach(c => commentMap[c.id] = { ...c.toJSON(), replies: [] });
    comments.forEach(c => {
      if (c.parent_id) commentMap[c.parent_id]?.replies.push(commentMap[c.id]);
      else roots.push(commentMap[c.id]);
    });

    const cleanComment = (comment) => {
      if (comment.is_deleted) comment.content = '삭제된 댓글입니다.';
      if (comment.replies) comment.replies = comment.replies.map(cleanComment);
      return comment;
    };

    res.status(200).json(roots.map(cleanComment));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 댓글 수정
router.patch('/:commentId', isLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).send('댓글이 존재하지 않습니다.');
    if (comment.user_id !== req.user.id) return res.status(403).send('수정 권한이 없습니다.');

    await comment.update({ content: req.body.content });
    await ActiveLog.create({
      action: "UPDATE",
      target_id: comment.id,
      users_id: req.user.id,
      target_type_id: 2,
    });

    res.status(200).json({ CommentId: comment.id, content: req.body.content });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 댓글 삭제
router.delete('/:commentId', isLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).send('댓글이 존재하지 않습니다.');
    if (comment.user_id !== req.user.id) return res.status(403).send('삭제 권한이 없습니다.');

    await comment.update({ is_deleted: true });

    const totalComments = await Comment.count({ where: { post_id: comment.post_id, is_deleted: false } });

    await ActiveLog.create({
      action: "DELETE",
      target_id: comment.id,
      users_id: req.user.id,
      target_type_id: 2,
    });

    res.status(200).json({
      CommentId: comment.id,
      postId: comment.post_id,
      commentCount: totalComments,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
