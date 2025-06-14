const { User, Achievement, sequelize } = require('../../models');
const { assignBadgeIfNotExists } = require('../badge/postbadge'); // 경로는 프로젝트 구조에 따라 조정

module.exports = {
  checkAndAssignPostAchievements: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const postCount = await user.countPosts();

    const achievementMap = [
      { id: 1000001, count: 1 },
      { id: 1000002, count: 10 },
      { id: 1000003, count: 100 }, // ← 이 업적 달성 시 뱃지 지급
    ];

    return await sequelize.transaction(async (t) => {
      for (const { id, count } of achievementMap) {
        if (postCount >= count) {
          const achievement = await Achievement.findByPk(id, { transaction: t });
          if (!achievement) continue;

          const hasAchievement = await user.hasAchievement(achievement, { transaction: t });
          if (!hasAchievement) {
            await user.addAchievement(achievement, { transaction: t });

            // 🎖️ 뱃지는 1000003 업적 달성 시에만 지급
            if (id === 1000003) {
              await assignBadgeIfNotExists(userId, id);
            }
          }
        }
      }
      return true;
    });
  }
};
