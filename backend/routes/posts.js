const express = require('express');
const router = express.Router();
const { Post, User, Image, Comment } = require('../models');
const { Op } = require('sequelize');

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
        [Comment, 'createdAt', 'DESC'],
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'nickname', 'profile_img'],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'nickname'],
            },
          ],
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
        {
          model: Post,
          as: 'Retweet',
          include: [
            {
              model: User,
              attributes: ['id', 'nickname'],
            },
            {
              model: Image,
            },
          ],
        },
      ],
    });

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
