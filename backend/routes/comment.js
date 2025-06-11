// routes/comment.js
const express = require('express');
const router = express.Router();
const { Comment, CommentPath, User, Post, ActiveLog, Notification } = require('../models'); // ActiveLog 준혁 추가
const { isLoggedIn } = require('./middlewares');
const { sendNotification } = require('../notificationSocket'); // 준혁추가 실시간 알림   

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
      include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }],
    });

    // 댓글 등록 후 최신 댓글 카운트도 같이 응답!
    const totalComments = await Comment.count({ where: { post_id: post.id, } });

    // 준혁 추가
    // 활동 내역 생성
    await ActiveLog.create({
      action: "COMMENT",
      target_id: comment.id,
      users_id: req.user.id,
      target_type_id: 2,
    } );
    // 알림 생성
    // 댓글이 달린 포스트의 내용과 user id 추출
    const commentedPost = await Post.findOne({
      where: { id: post.id },
      attributes: [ "content", "user_id" ],
    });
    // 포스트 작성한 user id와 댓글을 단 user id가 다를 경우에만 알림 생성
    if (commentedPost.user_id !== req.user.id) {
      await Notification.create({
        content: `${commentedPost.content}`,
        users_id: commentedPost.user_id,
        target_type_id: 2,
      })
      // 소켓 푸시
      sendNotification(commentedPost.user_id, {
        type: 'COMMENT',
        message: '댓글이 달렸습니다',
      });
      //
    }
    //

    res.status(201).json({
      comment: fullComment,
      postId: post.id,
      commentCount: totalComments, // ← 추가
    });
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

    const keySet = new Set();
    const uniquePaths = [];
    for (const row of paths) {
      const key = `${row.upper_id}-${row.lower_id}`;
      if (!keySet.has(key)) {
        uniquePaths.push(row);
        keySet.add(key);
      }
    }

    await CommentPath.bulkCreate(uniquePaths);

    // 대댓글 등록 후 최신 댓글 카운트도 같이 응답!
    const totalComments = await Comment.count({ where: { post_id: parent.post_id, } });

    // 준혁 추가
    // 활동 내역 생성
    await ActiveLog.create({
      action: "REPLY",
      target_id: reply.id,
      users_id: req.user.id,
      target_type_id: 2,
    } );
    // 알림 생성
    // 원본 내용과 작성자 id 추출
    const RepliedComment = await Comment.findOne({
      where: { id: parent.id },
      attributes: [ "content", "user_id" ],
    })
    // 해당 포스트 정보 가져오기 (포스트 주인 알림용)
    const post = await Post.findOne({
      where: { id: parent.post_id },
      attributes: ["user_id", 'content'],
    });
    // 포스트 주인에게 알림 생성 (댓글 단 유저가 포스트 주인이 아닐 경우)
    if (post.user_id !== req.user.id && post.user_id !== RepliedComment.user_id) {
      await Notification.create({
        content: `${post.content}`,
        users_id: post.user_id,
        target_type_id: 2,
      });
      sendNotification(post.user_id, {
        type: 'COMMENT',
        message: '포스트에 새로운 댓글이 달렸습니다',
      });
    }
    // 원본 댓글 유저 id와 작성자 id가 다를경우 알림 생성
    if ( RepliedComment.user_id !== req.user.id ) {
      await Notification.create({
        content: `${RepliedComment.content}`,
        users_id: RepliedComment.user_id,
        target_type_id: 4,
      })
      // 소켓 푸시
      // 답장이 달린 댓글의 유저
      sendNotification(RepliedComment.user_id, {
        type: 'REPLY',
        message: '답장이 달렸습니다',
      });
    }
    //

    res.status(201).json({
      comment: reply,
      postId: parent.post_id,
      commentCount: totalComments, // ← 추가
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 3. 트리형 댓글 조회: GET /comment/post/:postId/tree
router.get('/post/:postId/tree', async (req, res, next) => {
  try {
    //윫추가
    const { Block } = require('../models');
    const { Op } = require('sequelize');

    let blockedUserIds = [];

    if (req.user) {
      const blocks = await Block.findAll({
        where: {
          [Op.or]: [
            { from_user_id: req.user.id },
            { to_user_id: req.user.id },
          ]
        }
      });

      // 윫 나를 차단했거나 내가 차단한 사람 모두 필터링
      blockedUserIds = blocks.map(b =>
        b.from_user_id === req.user.id ? b.to_user_id : b.from_user_id
      );
    }

    //////
    const comments = await Comment.findAll({
      where: {
        post_id: req.params.postId,
        user_id: {
          [Op.notIn]: blockedUserIds, // 윫 추가
        },
      },
      include: [
        { model: User, attributes: ['id', 'nickname', 'profile_img'] },
        { model: Comment, as: 'Parent', include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }] }
      ],
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

    // 삭제된 댓글은 content를 대체
    const cleanComment = (comment) => {
      if (comment.is_deleted) {
        comment.content = '삭제된 댓글입니다.';
      }
      if (comment.replies) {
        comment.replies = comment.replies.map(cleanComment);
      }
      return comment;
    };

    const cleanedTree = roots.map(cleanComment);
    res.status(200).json(cleanedTree);
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

    // 준혁 추가
    // 활동 내역 변경
    const log = await ActiveLog.findOne({
      where: {
        target_id: comment.id,
        users_id: req.user.id,
        target_type_id: 2, 
      }
    });
    if (!log) { return res.status(403).send("해당되는 기록이 없습니다"); }
    if (log.action !== "UPDATE") { await log.update({ action: "UPDATE" });
    // 강제 업데이트
    } else { log.changed('updatedAt', true); await log.save(); }
    //

    res.status(200).json({ CommentId: comment.id, content: req.body.content });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 댓글 삭제 (실제 삭제 or soft delete 방식)
router.delete('/:commentId', isLoggedIn, async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).send('댓글이 존재하지 않습니다.');
    if (comment.user_id !== req.user.id) return res.status(403).send('삭제 권한이 없습니다.');

    await comment.update({ is_deleted: true });

    // 삭제 후 최신 댓글 카운트도 같이 응답!
    const totalComments = await Comment.count({ where: { post_id: comment.post_id,} });

    // 활동 내역 생성 - 준혁 추가
    await ActiveLog.create({
      action: "DELETE",
      target_id: comment.id,
      users_id: req.user.id,
      target_type_id: 2,
    } );

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
