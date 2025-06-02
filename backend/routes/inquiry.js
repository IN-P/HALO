const express = require('express');
const router = express.Router();
const { Inquiry, User } = require('../models');

// 문의 등록 (C)
router.post('/', async (req, res, next) => {
  try {
    const { users_id, title, message } = req.body;

    if (!users_id || !title || !message) {
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
router.get('/', async (req, res, next) => {
  try {
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
router.get('/:id', async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id, {
      include: { model: User, attributes: ['id', 'nickname'] },
    });
    if (!inquiry) return res.status(404).json({ message: '문의 없음' });
    res.status(200).json(inquiry);
  } catch (error) {
    console.error('문의 상세 조회 실패:', error);
    next(error);
  }
});

// 문의 답변 등록/수정 (U)
router.patch('/:id/answer', async (req, res, next) => {
  try {
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
router.delete('/:id', async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) return res.status(404).json({ message: '문의 없음' });

    await inquiry.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('문의 삭제 실패:', error);
    next(error);
  }
});

module.exports = router;
