const express = require('express');
const router = express.Router();
const { Inquiry, User } = require('../models');
const { isLoggedIn } = require('./middlewares'); // ✅ 로그인 여부 체크 미들웨어

// 문의 관리자 권한 체크 함수 (role: 1 = 마스터, 4 = 문의 관리자)
const isInquiryAdmin = (user) => user.role === 1 || user.role === 4;

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
    if (!isInquiryAdmin(req.user)) {
      return res.status(403).json({ message: '문의 관리자만 접근 가능합니다.' });
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

// 내 문의 목록 조회 (R)
router.get('/my', isLoggedIn, async (req, res, next) => {
  try {
    const inquiries = await Inquiry.findAll({
      where: { users_id: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(inquiries);
  } catch (error) {
    console.error('내 문의 조회 실패:', error);
    next(error);
  }
});

// 문의 상세 조회 (R)
router.get('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id, {
      include: { model: User, attributes: ['id', 'nickname'] },
    });

    if (!inquiry) {
      return res.status(404).json({ message: '문의 없음' });
    }

    // 본인 or 문의 관리자만 접근 가능
    if (inquiry.users_id !== req.user.id && !isInquiryAdmin(req.user)) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' });
    }

    res.status(200).json(inquiry);
  } catch (error) {
    console.error('문의 상세 조회 실패:', error);
    next(error);
  }
});

// 문의 내용 수정 (U)
router.patch('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const { title, message } = req.body;
    const inquiry = await Inquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의 없음' });
    }

    // 본인만 수정 가능
    if (inquiry.users_id !== req.user.id) {
      return res.status(403).json({ message: '본인만 수정할 수 있습니다.' });
    }
    // 이미 답변이 달렸으면 수정 불가
    if (inquiry.answer) {
      return res.status(400).json({ message: '이미 답변이 등록된 문의는 수정할 수 없습니다.' });
    }
    if (title) inquiry.title = title;
    if (message) inquiry.message = message;

    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    console.error('문의 수정 실패:', error);
    next(error);
  }
});

// 문의 답변 등록/수정 (U)
router.patch('/:id/answer', isLoggedIn, async (req, res, next) => {
  try {
    if (!isInquiryAdmin(req.user)) {
      return res.status(403).json({ message: '문의 관리자만 답변할 수 있습니다.' });
    }

    const { answer } = req.body;
    const inquiry = await Inquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: '문의 없음' });
    }

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

    if (!inquiry) {
      return res.status(404).json({ message: '문의 없음' });
    }

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
