const express = require('express');
const router = express.Router();
const { User, UserInfo, Social, DeleteUser } = require('../models');
const isAdminUserManager = require('../middlewares/isAdminUserManager');


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
          required: false, // 소셜이 없어도 OK
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

    // 닉네임 수정
    if (nickname !== undefined) {
      user.nickname = nickname;
    }

    // 연락처 / 소개글 수정
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

    // 역할 수정 (오직 마스터 관리자만)
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

    // 1. 유저 상태를 탈퇴로 변경
    await User.update(
      { user_status_id: 2 },
      { where: { id: userId } }
    );

    // 2. 삭제 로그 테이블에 기록
    await DeleteUser.create({ users_id: userId });

    return res.status(200).json({ message: '유저 탈퇴 처리 완료 (소프트 딜리트)' });
  } catch (error) {
    console.error('[관리자] 유저 소프트 딜리트 실패:', error);
    return res.status(500).json({ message: '서버 오류로 유저 삭제에 실패했습니다.' });
  }
});


module.exports = router;
