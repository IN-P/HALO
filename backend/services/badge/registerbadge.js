const { User, Badge, sequelize } = require('../../models');

module.exports = {
  id: 1,
  name: '회원가입 지급 뱃지',
  registerBadge: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    return await sequelize.transaction(async (t) => {
      const badge = await Badge.findByPk(1, { transaction: t });
      if (!badge) return false;

      const hasBadge = await user.hasBadge(badge, { transaction: t });
      if (!hasBadge) {
        await user.addBadge(badge, { transaction: t });
      }
      return true;
    });
  }
};
