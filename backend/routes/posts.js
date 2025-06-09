const express = require('express');
const router = express.Router();
const { Post, User, Image, Comment } = require('../models');
const { Op } = require('sequelize');
const { Block } = require('../models'); //윫 추가

// GET /posts?lastId=10
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (parseInt(req.query.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) }; // lastId보다 작은 게시글만
    }

    const posts = await Post.findAll({
      where,
      limit: 10,
      order: [
        ['createdAt', 'DESC'],
        [Image, 'id', 'ASC'],
        [{ model: Post, as: 'Regram' }, Image, 'id', 'ASC'],
        [Comment, 'createdAt', 'DESC'],
      ],
      include: [
        { model: User, attributes: ['id', 'nickname', 'profile_img'] },
        { model: Image },
        {
          model: Comment,
          include: [
            { model: User, attributes: ['id', 'nickname'] },
          ],
        },
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regrams',
          include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }], // ★ 이거!
        },
        {
          model: Post,
          as: 'Regram',
          include: [
            { model: User, attributes: ['id', 'nickname'] },
            { model: Image },
            { model: User, as: 'Likers', attributes: ['id'] },
            { model: User, as: 'Bookmarkers', attributes: ['id'] },
            {
              model: Post,
              as: 'Regrams',
              include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }],
            },
          ],
        },
      ],
    });
    // 윫추가 차단된 유저의 댓글 숨기기 로직 추가
    if (req.user) {
      const myId = req.user.id;

      // 윫추가 나와 관련된 차단 관계 조회
      const blockedRelations = await Block.findAll({
        where: {
          [Op.or]: [
            { from_user_id: myId },
            { to_user_id: myId },
          ],
        },
      });

      // 윫추가 차단된 유저 ID 목록 추출
      const blockedUserIds = blockedRelations.map((b) =>
        b.from_user_id === myId ? b.to_user_id : b.from_user_id
      );

      // 윫추가 게시글에 달린 댓글 중 차단 유저의 댓글은 제외
      for (const post of posts) {
        if (post.Comments) {
          post.Comments = post.Comments.filter(
            (c) => !blockedUserIds.includes(c.User?.id)
          );
        }
      }
    }

    // 무한스크롤을 위해 10개 채웠으면 hasMorePosts true, 아니면 false
    res.status(200).json({
      posts,
      hasMorePosts: posts.length === 10,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
