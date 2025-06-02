// 휴먼계정

const { User } = require('../../models');
const { Op } = require('sequelize');

(async () => {
  try {
    const oneYearAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);

    const dormantUsers = await User.findAll({
      where: {
        last_active: {
          [Op.lt]: oneYearAgo,
        },
        user_status_id: 1, // 1 = 정상 유저만 대상
      },
    });

    for (const user of dormantUsers) {
      await User.update(
        { user_status_id: 3 }, // 3 = 휴면 상태
        { where: { id: user.id } }
      );

      console.log(`[휴면 전환] User ID: ${user.id}`);
    }

    console.log(`[${new Date().toISOString()}] 전체 휴면 전환 완료 (${dormantUsers.length}명)`);
    process.exit();
  } catch (err) {
    console.error(' 휴면 전환 실패:', err);
    process.exit(1);
  }
})();
