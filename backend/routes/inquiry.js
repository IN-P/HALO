const express = require('express');
const router = express.Router();
const { Inquiry, User } = require('../models');
const { isLoggedIn } = require('./middlewares'); // ✅ 로그인 여부 체크 미들웨어

/////////////////////////////////////////////지우기
// 테스트용 로그인 정보 
// router.use((req, res, next) => {
//   req.user = { id: 2, isAdmin: false }; // 일반 유저 테스트
//   next();
// });
////////////////////////////////////////////지우기

// 문의 등록 (C)
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const users_id = req.user.id;

    if (!title || !message) {
      return res.status(400).json({ message: '필수 항목 누락' });
    }

    const inquiry = await Inquiry.create({ users_id, title, message });
    res.status(201).json(inquiry);
  } catch (error) {
    console.error('문의 등록 실패:', error);
    next(error);
  }
});

// 문의 전체 조회 (R) - 관리자용
router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
    }

    const inquiries = await Inquiry.findAll({
      include: { model: User, attributes: ['id', 'nickname'] },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('문의 조회 실패:', error);
    next(error);
  }
});

// 문의 상세 조회 (R)
router.get('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id, {
      include: { model: User, attributes: ['id', 'nickname'] },
    });
    //본인 or 관리자만 접근 가능
    if (inquiry.users_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }
    res.status(200).json(inquiry);
  } catch (error) {
    console.error('문의 상세 조회 실패:', error);
    next(error);
  }
});

// 문의 답변 등록/수정 (U)
router.patch('/:id/answer', isLoggedIn, async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '관리자만 답변할 수 있습니다.' });
    }

    const { answer } = req.body;
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) return res.status(404).json({ message: '문의 없음' });

    inquiry.answer = answer;
    await inquiry.save();

    res.status(200).json(inquiry);
  } catch (error) {
    console.error('문의 답변 실패:', error);
    next(error);
  }
});

// 문의 삭제 (D)
router.delete('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) return res.status(404).json({ message: '문의 없음' });
    // 본인만 삭제 가능
    if (inquiry.users_id !== req.user.id) {
      return res.status(403).json({ message: '본인만 삭제할 수 있습니다.' });
    }

    await inquiry.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('문의 삭제 실패:', error);
    next(error);
  }
});

module.exports = router;
