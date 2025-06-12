const { User, Badge, sequelize } = require('../../models');

module.exports = {
  id: 0,
  name: '응원팀 뱃지 일괄 관리',
  assignTeamBadge: async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const teamId = user.myteam_id;
    const validTeamBadgeIds = Array.from({ length: 10 }, (_, i) => i + 2); // [2,3,...,11]

    return await sequelize.transaction(async (t) => {
      // 유저가 가진 팀 관련 뱃지 가져오기
      const badgesOwned = await user.getBadges({
        where: { id: validTeamBadgeIds },
        transaction: t,
      });

      if (teamId === 1) {
        // teamId가 0이면 모든 팀 뱃지 제거
        if (badgesOwned.length > 0) {
          await user.removeBadges(badgesOwned, { transaction: t });
        }
        return true;
      }

      // teamId가 2~11 사이가 아닐 경우 아무 작업 안 함
      if (teamId < 2 || teamId > 11) return false;

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

      return true;
    });
  },
};
