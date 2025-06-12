const { User, Achievement, Follow, sequelize } = require('../../models');

module.exports = {
  checkAndAssignFollowAchievements: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    // 팔로워 수 조회
    const followerCount = await Follow.count({ where: { to_user_id: userId } });
    // 팔로잉 수 조회
    const followingCount = await Follow.count({ where: { from_user_id: userId } });

    // 팔로워 + 팔로잉 합산
    const totalFollowCount = followerCount + followingCount;

    const achievementMap = [
      { id: 3000001, count: 1 },
      { id: 3000002, count: 10 },
      { id: 3000003, count: 50 },
    ];

    return await sequelize.transaction(async (t) => {
      for (const { id, count } of achievementMap) {
        if (totalFollowCount >= count) {
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
  },
};
