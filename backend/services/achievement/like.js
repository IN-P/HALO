const { User, Achievement, sequelize } = require('../../models');

module.exports = {
  checkAndAssignLikeAchievements: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    // 좋아요 누른 게시글의 누적 좋아요 수 구하기
    // 여기서는 user가 좋아요 누른 게시글 수를 기준으로 업적 부여한다고 가정
    const likedCount = await user.countLiked();

    const achievementMap = [
      { id: 5000001, count: 1 },
      { id: 5000002, count: 10 },
      { id: 5000003, count: 100 },
    ];

    return await sequelize.transaction(async (t) => {
      for (const { id, count } of achievementMap) {
        if (likedCount >= count) {
          const achievement = await Achievement.findByPk(id, { transaction: t });
          if (!achievement) continue;

          const hasAchievement = await user.hasAchievement(achievement, { transaction: t });
          if (!hasAchievement) {
            await user.addAchievement(achievement, { transaction: t });
          }
        }
      }
      return true;
    });
  }
};
