const { User, Badge, sequelize } = require('../../models');

module.exports = {
  id: 1,
  name: '회원가입 지급 뱃지',
  registerBadge: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    return await sequelize.transaction(async (t) => {
      // 이미 해당 뱃지를 갖고 있는지 확인
      const hasBadge = await user.hasBadge(1, { transaction: t });
      if (!hasBadge) {
        const badge = await Badge.findByPk(1, { transaction: t });
        if (badge) {
          await user.addBadge(badge, { transaction: t });
        }
      }
    });
  }
};

module.exports = {
  id: 0,
  name: '응원팀 뱃지 일괄 관리',
  assignTeamBadge: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const teamId = user.myteam_id;
    if (!teamId || teamId < 2 || teamId > 11) return false; // 범위 확인

    return await sequelize.transaction(async (t) => {
      const validTeamBadgeIds = Array.from({ length: 10 }, (_, i) => i + 2); // [2, 3, ..., 11]

      // 유저가 가진 팀 관련 뱃지 가져오기
      const badgesOwned = await user.getBadges({
        where: { id: validTeamBadgeIds },
        transaction: t,
      });

      // 현재 팀 뱃지를 제외한 나머지 제거
      const badgesToRemove = badgesOwned.filter(badge => badge.id !== teamId);

      if (badgesToRemove.length > 0) {
        await user.removeBadges(badgesToRemove, { transaction: t });
      }

      // 팀 뱃지가 없으면 추가
      const hasTeamBadge = badgesOwned.some(badge => badge.id === teamId);
      if (!hasTeamBadge) {
        const teamBadge = await Badge.findByPk(teamId, { transaction: t });
        if (teamBadge) {
          await user.addBadge(teamBadge, { transaction: t });
        }
      }
    });
  },
};
