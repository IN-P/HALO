// routes/feed.js
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');
const { Post, User, Image, Comment, Hashtag, Block } = require('../models');
const getFeedSet = require('../services/feedService');

// GET /feeds?excludePostIds=1,2,3
router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const excludeIds = (req.query.excludePostIds || '')
      .split(',')
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));

    const myId = req.user.id;

    // ✨ 추천 피드 가져오기
    let posts = await getFeedSet(myId, excludeIds);

    // ✅ 차단 정보 (댓글, 리그램용)
    const blocks = await Block.findAll({
      where: { [Op.or]: [{ from_user_id: myId }, { to_user_id: myId }] },
    });
    const blockedUserIds = blocks.map(b =>
      b.from_user_id === myId ? b.to_user_id : b.from_user_id
    );

    // ✅ full include로 게시글 재조회 + 댓글 필터 + 리그램 필터
    posts = await Promise.all(
      posts.map(async (p) => {
        const fullPost = await Post.findOne({
          where: { id: p.id },
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img', 'last_active', 'is_private'] },
            { model: Image },
            { model: Hashtag, attributes: ['id', 'name'] },
            {
              model: Comment,
              include: [{ model: User, attributes: ['id', 'nickname', 'profile_img', 'last_active'] }],
            },
            { model: User, as: 'Likers', attributes: ['id'] },
            { model: User, as: 'Bookmarkers', attributes: ['id'] },
            {
              model: Post,
              as: 'Regram',
              include: [
                { model: User, attributes: ['id', 'nickname', 'profile_img', 'last_active'] },
                { model: Image },
              ],
            },
            {
              model: Post,
              as: 'Regrams',
              include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }],
            },
          ],
        });

        // 🔒 댓글 차단 필터
        if (fullPost?.Comments) {
          fullPost.Comments = fullPost.Comments.filter(
            (c) => !blockedUserIds.includes(c.User?.id)
          );
        }

        // 🔒 리그램 원본 유저 차단 필터
        if (
          fullPost?.Regram?.User?.id &&
          blockedUserIds.includes(fullPost.Regram.User.id)
        ) {
          return null; // 필터링
        }

        return fullPost;
      })
    );

    // null 제거
    posts = posts.filter(p => p !== null);

    res.status(200).json({
      posts,
      hasMorePosts: posts.length === 10,
    });
  } catch (error) {
    console.error('🚨 /feeds 오류:', error);
    next(error);
  }
});

module.exports = router;
