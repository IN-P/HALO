const { User, Badge, sequelize } = require('../../models');

module.exports = {
  assignBadgeIfNotExists: async (userId, badgeId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    return await sequelize.transaction(async (t) => {
      const badge = await Badge.findByPk(badgeId, { transaction: t });
      if (!badge) return false;

      const hasBadge = await user.hasBadge(badge, { transaction: t });
      if (!hasBadge) {
        await user.addBadge(badge, { transaction: t });
      }

      return true;
    });
  }
};
