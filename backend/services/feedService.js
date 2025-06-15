// services/feedService.js
const { Op } = require('sequelize');
const { Post, User, Comment, Follow, Block, Image, Hashtag } = require('../models');
const shuffleArray = require('../utils/shuffle');

function calculateScore(post, isFollowing) {
  const minutes = (Date.now() - new Date(post.createdAt).getTime()) / 60000;
  return (
    (isFollowing ? 100 : 0) +
    (post.Likers?.length || 0) * 3 +
    (post.Comments?.length || 0) * 2.5 +
    (post.Bookmarkers?.length || 0) * 2 +
    (post.Regrams?.length || 0) * 2 -
    minutes * 0.01
  );
}

async function getBlockedUserIds(userId) {
  const blocks = await Block.findAll({
    where: {
      [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }],
    },
  });
  return blocks.map(b => (b.from_user_id === userId ? b.to_user_id : b.from_user_id));
}

async function getFeedSet(userId, excludeIds = []) {
  const blockedIds = await getBlockedUserIds(userId);
  const excludeAll = [...excludeIds];

  // 1. vvip 2개 랜덤
  const vvipPosts = await Post.findAll({
    where: {
      id: { [Op.notIn]: excludeAll },
      user_id: { [Op.notIn]: blockedIds },
    },
    include: [
      { model: User, where: { membership_id: 4 } },
      { model: User, as: 'Likers' },
      { model: User, as: 'Bookmarkers' },
      { model: Comment },
      { model: Post, as: 'Regrams' },
    ],
    limit: 10,
  });
  const pickedVVIP = shuffleArray(vvipPosts).slice(0, 2);
  excludeAll.push(...pickedVVIP.map(p => p.id));

  // 2. gold 1개 랜덤
  const goldPosts = await Post.findAll({
    where: {
      id: { [Op.notIn]: excludeAll },
      user_id: { [Op.notIn]: blockedIds },
    },
    include: [
      { model: User, where: { membership_id: 3 } },
      { model: User, as: 'Likers' },
      { model: User, as: 'Bookmarkers' },
      { model: Comment },
      { model: Post, as: 'Regrams' },
    ],
    limit: 10,
  });
  const pickedGold = shuffleArray(goldPosts).slice(0, 1);
  excludeAll.push(...pickedGold.map(p => p.id));

  const paidTotal = pickedVVIP.length + pickedGold.length;

  // 3. 일반 추천 포스트
  const generalPosts = await Post.findAll({
    where: {
      id: { [Op.notIn]: excludeAll },
      user_id: { [Op.notIn]: blockedIds },
    },
    include: [
      { model: User },
      { model: User, as: 'Likers' },
      { model: User, as: 'Bookmarkers' },
      { model: Comment },
      { model: Post, as: 'Regrams' },
    ],
    limit: 50,
  });

  const follows = await Follow.findAll({ where: { from_user_id: userId } });
  const followSet = new Set(follows.map(f => f.to_user_id));

  const scoredGeneral = generalPosts.map(p => ({ post: p, score: calculateScore(p, followSet.has(p.user_id)) }));

  const neededFromGeneral = 10 - paidTotal;
  const topN = scoredGeneral.sort((a, b) => b.score - a.score).slice(0, neededFromGeneral).map(e => e.post);

  return [...pickedVVIP, ...pickedGold, ...topN];
}

module.exports = getFeedSet;
