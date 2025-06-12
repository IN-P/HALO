const express = require('express');
const router = express.Router();

const { Mention, User } = require('../models'); // User 모델도 함께 불러와야 해
const { isLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');

// 1. 멘션 생성 (POST /mention)
// POST: localhost:3065/mention
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { receiver_id, target_type, target_id, context } = req.body; // ✅ target_id 추가로 받음
    const sender_id = req.user.id; // 로그인한 유저가 멘션을 보낸 유저

    // 멘션 받은 유저가 존재하는지 확인 (방어용)
    const receiver = await User.findOne({ where: { id: receiver_id } });
    if (!receiver) {
      return res.status(404).send('멘션을 받을 유저가 존재하지 않습니다.');
    }

    const mention = await Mention.create({
      senders_id: sender_id,
      receiver_id,
      target_type,
      target_id, // ✅ 추가
      context,
      createAt: new Date(),
    });

    // 생성된 멘션 + 보낸 유저 정보 포함 반환
    const fullMention = await Mention.findOne({
      where: { id: mention.id },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'nickname'],
        },
      ],
    });

    res.status(201).json(fullMention);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 2. 받은 멘션 목록 조회
// GET: localhost:3065/mention/received
router.get('/received', isLoggedIn, async (req, res, next) => {
  try {
    const receiver_id = req.user.id;

    const mentions = await Mention.findAll({
      where: { receiver_id },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'nickname'],
        },
      ],
      order: [['createAt', 'DESC']], // ✅ createAt으로 정렬 (createdAt → createAt 으로 수정했음, 네 모델에 맞춰서)
    });

    res.status(200).json(mentions);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 3. 보낸 멘션 목록 조회
// GET: localhost:3065/mention/sent
router.get('/sent', isLoggedIn, async (req, res, next) => {
  try {
    const sender_id = req.user.id;

    const mentions = await Mention.findAll({
      where: { senders_id: sender_id }, // ✅ senders_id (네 모델에 senders_id임 → 기존 sender_id는 변수명이라 괜찮음)
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['id', 'nickname'],
        },
      ],
      order: [['createAt', 'DESC']], // ✅ createAt으로 정렬
    });

    res.status(200).json(mentions);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 4. 멘션 삭제
// DELETE: localhost:3065/mention/:mentionId
router.delete('/:mentionId', isLoggedIn, async (req, res, next) => {
  try {
    const mention = await Mention.findOne({
      where: { id: req.params.mentionId },
    });

    if (!mention) {
      return res.status(404).send('멘션이 존재하지 않습니다.');
    }

    // 멘션을 보낸 유저만 삭제할 수 있도록
    if (mention.senders_id !== req.user.id) {
      return res.status(403).send('멘션을 삭제할 권한이 없습니다.');
    }

    await Mention.destroy({
      where: {
        id: req.params.mentionId,
        senders_id: req.user.id, // ✅ senders_id 확인
      },
    });

    res.status(200).json({ MentionId: parseInt(req.params.mentionId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET: /mention/users?q=검색어&limit=5&offset=0
router.get('/users', isLoggedIn, async (req, res, next) => {
  try {
    const { q, limit = 5, offset = 0 } = req.query;
    const userId = req.user.id;

    // 팔로우/팔로워 먼저 가져오는 건 다음 단계에 추가 가능 (일단은 유저 검색부터)
    // Users 테이블에서 nickname LIKE 검색 (본인 제외)
    const users = await User.findAll({
      where: {
        nickname: {
          [Op.like]: `%${q}%`,
        },
        id: {
          [Op.ne]: userId, // 본인은 추천 안 하기
        },
      },
      attributes: ['id', 'nickname', 'profile_img'],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
