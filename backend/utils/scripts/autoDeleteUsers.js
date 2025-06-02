// 소프트딜리트

const { User, UserInfo, DeleteUser } = require('../../models');
const { Op } = require('sequelize');

(async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

    const expired = await DeleteUser.findAll({
      where: {
        deleted_at: {
          [Op.lt]: thirtyDaysAgo,
        },
      },
    });

    for (const record of expired) {
      const userId = record.users_id;

      await UserInfo.destroy({ where: { users_id: userId } });
      await User.destroy({ where: { id: userId } });
      await DeleteUser.destroy({ where: { users_id: userId } });

      console.log(` [삭제 완료] User ID: ${userId}`);
    }

    console.log(`[${new Date().toISOString()}] 전체 삭제 작업 완료 (${expired.length}명)`);
    process.exit();
  } catch (err) {
    console.error(' 자동삭제 실패:', err);
    process.exit(1);
  }
})();
