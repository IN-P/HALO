const {
  User, UserInfo, DeleteUser, Notification, ActiveLog, Report,
  Inquiry, UserPayment, Post, Comment, Block, Follow, Mention,
  ChatMessage, ChatRoom, Checkin, Roulette, UserPoint,
  PointLogs, PlayerDraw, UsersQuiz
} = require('../../models');

const { Op } = require('sequelize');
const { sequelize } = require('../../models');

(async () => {
  const t = await sequelize.transaction();
  try {
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const expiredUsers = await DeleteUser.findAll({
      where: { deleted_at: { [Op.lt]: thirtyDaysAgo } },
    });

    for (const record of expiredUsers) {
      const userId = record.users_id;

      // 연관 테이블 전부 삭제
      await Promise.all([
        Notification.destroy({ where: { users_id: userId }, transaction: t }),
        ActiveLog.destroy({ where: { users_id: userId }, transaction: t }),
        Report.destroy({ where: { users_id: userId }, transaction: t }),
        Inquiry.destroy({ where: { users_id: userId }, transaction: t }),
        UserInfo.destroy({ where: { users_id: userId }, transaction: t }),
        DeleteUser.destroy({ where: { users_id: userId }, transaction: t }),
        UserPayment.destroy({ where: { users_id: userId }, transaction: t }),
        Post.destroy({ where: { user_id: userId }, transaction: t }),
        Comment.destroy({ where: { user_id: userId }, transaction: t }),
        Block.destroy({
          where: {
            [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }],
          },
          transaction: t,
        }),
        Follow.destroy({
          where: {
            [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }],
          },
          transaction: t,
        }),
        Mention.destroy({
          where: {
            [Op.or]: [{ senders_id: userId }, { receiver_id: userId }],
          },
          transaction: t,
        }),
        ChatMessage.destroy({ where: { sender_id: userId }, transaction: t }),
        ChatRoom.destroy({
          where: {
            [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
          },
          transaction: t,
        }),
        Checkin.destroy({ where: { users_id: userId }, transaction: t }),
        Roulette.destroy({ where: { users_id: userId }, transaction: t }),
        UserPoint.destroy({ where: { users_id: userId }, transaction: t }),
        PointLogs.destroy({ where: { users_id: userId }, transaction: t }),
        PlayerDraw.destroy({ where: { users_id: userId }, transaction: t }),
        UsersQuiz.destroy({ where: { users_id: userId }, transaction: t }),
      ]);

      await User.destroy({ where: { id: userId }, force: true, transaction: t });

      console.log(`🗑️ 완전 삭제 완료: User ID ${userId}`);
    }

    await t.commit();
    console.log(`[${new Date().toISOString()}] 전체 삭제 완료 (${expiredUsers.length}명)`);
    process.exit();
  } catch (err) {
    if (!t.finished) await t.rollback();
    console.error('❌ 자동삭제 실패:', err);
    process.exit(1);
  }
})();
