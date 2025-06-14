const express = require('express');
const router = express.Router();
const {
  User, DeletedUsersBackup, DeleteUser, ActiveLog, Notification, Report,
  Inquiry, UserInfo, UserPayment, Post, Comment, Block, Follow,
  Mention, ChatMessage, ChatRoom, Checkin, Roulette, UserPoint,
  PointLogs, PlayerDraw, UsersQuiz , Social
} = require('../models');

const isAdminUserManager = require('../middlewares/isAdminUserManager');
const { createLog } = require('../services/logService');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

// [1] 유저 목록 조회
router.get('/users', isAdminUserManager, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'nickname', 'createdAt', 'role', 'ip', 'user_status_id'],
      order: [['id', 'DESC']],
    });

    // (선택) 목록 조회 로그
    // await createLog({
    //   userId: req.user.id,
    //   action: 'VIEW_USERS_LIST',
    //   description: '관리자 유저 목록 조회',
    // });

    res.status(200).json(users);
  } catch (error) {
    console.error('[관리자] 유저 목록 조회 실패:', error);
    res.status(500).json({ message: '서버 오류로 유저 목록을 불러오지 못했습니다.' });
  }
});

// [2] 유저 상세 정보 조회
router.get('/users/:id', isAdminUserManager, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
    }

    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'email', 'nickname', 'createdAt', 'role', 'ip', 'profile_img', 'social_id'],
      include: [
        { model: UserInfo, attributes: ['phone', 'introduce'] },
        { model: Social, attributes: [['social_id', 'code']], required: false },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
    }

    // 로그 기록
    await createLog({
      userId: req.user.id,
      targetUserId: userId,
      action: 'VIEW_USER',
      description: `관리자가 유저 상세 조회함 (ID: ${userId})`,
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(`[관리자] 유저 상세 조회 실패 (ID: ${req.params.id}):`, error);
    res.status(500).json({ message: '서버 오류로 유저 정보를 불러오지 못했습니다.' });
  }
});

// [3] 유저 수정
router.patch('/users/:id', isAdminUserManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, phone, introduce, role } = req.body;
    const loginUser = req.user;

    const user = await User.findByPk(id, { include: [{ model: UserInfo }] });

    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    if (nickname !== undefined) {
      user.nickname = nickname;
    }

    if (phone !== undefined || introduce !== undefined) {
      if (user.UserInfo) {
        if (phone !== undefined) user.UserInfo.phone = phone;
        if (introduce !== undefined) user.UserInfo.introduce = introduce;
        await user.UserInfo.save();
      } else {
        await UserInfo.create({
          users_id: user.id,
          phone: phone || null,
          introduce: introduce || null,
        });
      }
    }

    if (role !== undefined) {
      if (loginUser.role === 1) {
        user.role = role;
      } else {
        return res.status(403).json({ message: '권한이 부족합니다. (role 수정 불가)' });
      }
    }

    await user.save();

    // 로그 기록
    await createLog({
      userId: req.user.id,
      targetUserId: id,
      action: 'UPDATE_USER',
      description: `관리자가 유저 정보를 수정함 (nickname: ${nickname}, phone: ${phone}, introduce: ${introduce}, role: ${role})`,
    });

    return res.status(200).json({ message: '수정 완료' });
  } catch (err) {
    console.error('유저 수정 실패:', err);
    return res.status(500).json({ message: '서버 오류로 유저 수정 실패' });
  }
});

// [4] 유저 삭제 (소프트 딜리트)
router.delete('/users/:id', isAdminUserManager, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: '잘못된 유저 ID입니다.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    if (user.user_status_id === 2) {
      return res.status(400).json({ message: '이미 탈퇴 처리된 유저입니다.' });
    }

    await User.update({ user_status_id: 2 }, { where: { id: userId } });
    await DeleteUser.create({ users_id: userId });

    // 로그 기록
    await createLog({
      userId: req.user.id,
      targetUserId: userId,
      action: 'DELETE_SOFT',
      description: '관리자가 유저를 소프트 딜리트 처리함',
    });

    return res.status(200).json({ message: '유저 탈퇴 처리 완료 (소프트 딜리트)' });
  } catch (error) {
    console.error('[관리자] 유저 소프트 딜리트 실패:', error);
    return res.status(500).json({ message: '서버 오류로 유저 삭제에 실패했습니다.' });
  }
});

// [5] 유저 하드딜리트 (DB 완전 삭제 + 백업 저장)
router.delete('/users/force/:id', isAdminUserManager, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: '잘못된 유저 ID입니다.' });
  }

  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    // [1] 백업
    await DeletedUsersBackup.upsert({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      password: user.password,
      role: user.role,
      profile_img: user.profile_img,
      theme_mode: user.theme_mode,
      is_private: user.is_private,
      balance: user.balance,
      email_chk: user.email_chk,
      ip: user.ip,
      user_status_id: user.user_status_id,
      membership_id: user.membership_id,
      myteam_id: user.myteam_id,
      last_active: user.last_active,
      created_at: user.createdAt,
      deleted_at: new Date(),
    }, { transaction: t });

    // [2] 참조 테이블 제거 (순서 주의)
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
          [Op.or]: [
            { from_user_id: userId },
            { to_user_id: userId },
          ],
        },
        transaction: t,
      }),
      Follow.destroy({
        where: {
          [Op.or]: [
            { from_user_id: userId },
            { to_user_id: userId },
          ],
        },
        transaction: t,
      }),
      Mention.destroy({
        where: {
          [Op.or]: [
            { senders_id: userId },
            { receiver_id: userId },
          ],
        },
        transaction: t,
      }),
      ChatMessage.destroy({ where: { sender_id: userId }, transaction: t }),
      ChatRoom.destroy({
        where: {
          [Op.or]: [
            { user1_id: userId },
            { user2_id: userId },
          ],
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

    // [3] 유저 하드삭제
    await User.destroy({ where: { id: userId }, force: true, transaction: t });

    // [4] 트랜잭션 커밋
    await t.commit();
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error('[관리자] 유저 하드딜리트 실패:', error);
    return res.status(500).json({ message: '서버 오류로 삭제 실패' });
  }

  // [5] 로그는 트랜잭션 밖에서 별도로 처리
  try {
    await createLog({
      userId: req.user.id,
      targetUserId: userId,
      action: 'DELETE_HARD',
      description: '관리자가 유저를 하드 딜리트 처리함 (백업 포함)',
    });
  } catch (logErr) {
    console.error('[하드딜리트 후 로그 기록 실패]', logErr);
    // 로그 실패는 사용자 응답에는 영향 없음
  }

  return res.status(200).json({ message: '유저 완전 삭제 완료 (백업 포함)' });
});

/*
현재까진 게시글 작성, 게시글좋아요, 댓글 (대댓X), 리트윗, 북마크까지 한 유저 하드딜리트 성공

*/


module.exports = router;
