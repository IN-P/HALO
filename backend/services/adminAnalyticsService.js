const { Sequelize, sequelize } = require('../models');

// ✅ 좋아요 많은 유저 Top 10
const getTopLikedUsers = async () => {
  const result = await sequelize.query(`
    SELECT u.id, u.nickname, COUNT(*) AS likeCount
    FROM users u
    JOIN posts p ON u.id = p.user_id
    JOIN \`like\` l ON l.PostId = p.id
    GROUP BY u.id
    ORDER BY likeCount DESC
    LIMIT 10
  `, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return result;
};

// ✅ 리트윗 많이 된 게시글 Top 10
const getTopRetweetedPosts = async () => {
  const result = await sequelize.query(`
    SELECT p.id, p.content, COUNT(r.id) AS retweetCount
    FROM posts p
    JOIN posts r ON r.regram_id = p.id
    GROUP BY p.id
    ORDER BY retweetCount DESC
    LIMIT 10
  `, {
    type: Sequelize.QueryTypes.SELECT,
  });

  return result;
};

module.exports = {
  getTopLikedUsers,
  getTopRetweetedPosts,
};
