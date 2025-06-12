const { User, Achievement, sequelize } = require('../../models');

module.exports = {
  checkAndAssignPostAchievements: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    // 게시글 개수 조회
    const postCount = await user.countPosts();

    // 부여할 업적 ID 목록과 기준 개수 맵핑
    const achievementMap = [
      { id: 1000001, count: 1 },
      { id: 1000002, count: 10 },
      { id: 1000003, count: 100 },
    ];

    return await sequelize.transaction(async (t) => {
      for (const { id, count } of achievementMap) {
        if (postCount >= count) {
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
