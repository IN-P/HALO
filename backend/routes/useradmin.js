const express = require('express');
const router = express.Router();
const {
  User,
  UserInfo,
  Social,
  DeleteUser,
  DeletedUsersBackup,
  ActiveLog,
  Notification,
  Block,
  Follow,
  Inquiry,
  Report,
  Comment,
  Post,
  UserPayment,
} = require('../models');

const isAdminUserManager = require('../middlewares/isAdminUserManager');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

// [1] 유저 목록 조회
router.get('/users', isAdminUserManager, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'nickname', 'createdAt', 'role', 'ip', 'user_status_id'],
      order: [['id', 'DESC']],
    });
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
        {
          model: UserInfo,
          attributes: ['phone', 'introduce'],
        },
        {
          model: Social,
          attributes: [['social_id', 'code']],
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
    }

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

    const user = await User.findByPk(id, {
      include: [{ model: UserInfo }],
    });

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

    await User.update(
      { user_status_id: 2 },
      { where: { id: userId } }
    );

    await DeleteUser.create({ users_id: userId });

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
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    // 1. 백업 저장
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

    // 2. 유저 삭제 (CASCADE 자동 적용)
    await User.destroy({ where: { id: userId }, transaction: t });

    await t.commit();
    return res.status(200).json({ message: '유저 완전 삭제 완료 (하드딜리트 + 백업)' });
  } catch (error) {
    await t.rollback();
    console.error('[관리자] 유저 하드딜리트 실패:', error);
    return res.status(500).json({ message: '서버 오류로 유저 완전 삭제 실패' });
  }
});





module.exports = router;
