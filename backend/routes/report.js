const express = require('express');
const router = express.Router();
const { Report, User, TargetType } = require('../models');
const { where } = require('sequelize');

// 신고 등록 (C)http://localhost:3065/api/report
router.post('/', async (req, res, next) => {
  try {
    console.log('📥 받은 body:', req.body); 
    const { reason, target_type_id, target_id } = req.body;
    const users_id = req.user.id;

    if (!users_id) {
      return res.status(400).json({ message: 'users_id는 필수입니다.' });
    }

    const report = await Report.create({
      users_id,
      reason,
      target_type_id,
      target_id,
      status: '접수됨',
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('신고 생성 실패:', error);
    next(error);
  }
});

// 전체 신고 조회 (R) - 관리자용 http://localhost:3065/api/report
router.get('/', async (req, res, next) => {
  try {
    const reports = await Report.findAll({
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: TargetType, attributes: ['id', 'code'] },
      ],
    });
    res.status(200).json(reports);
  } catch (error) {
    console.error('신고 목록 조회 실패:', error);
    next(error);
  }
});

// 신고 상태 변경 (U)
router.patch('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: '해당신고없음' });

    report.status = status;
    await report.save();
    res.status(200).json(report);
  } catch (error) {
    console.error('신고 상태 변경 실패:', error);
    next(error);
  }
});

// 신고 삭제 (D)
router.delete('/:id', async (req, res, next) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ message: '해당 신고 없음' });

    await report.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('신고 삭제 실패:', error);
    next(error);
  }
});

module.exports = router;
