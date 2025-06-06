const express = require('express');
const router = express.Router();

const { Mention, User } = require('../models'); // User 모델도 함께 불러와야 해
const { isLoggedIn } = require('./middlewares');



//1. 멘션 생성 (POST /mention)
// POST: localhost:3065/mention
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { receiver_id, target_type, context } = req.body;
    const sender_id = req.user.id; // 로그인한 유저가 멘션을 보낸 유저

    // 멘션 받은 유저가 존재하는지 확인 (선택 사항이지만, 존재하지 않는 유저에게 멘션 보내는 것을 방지)
    const receiver = await User.findOne({ where: { id: receiver_id } });
    if (!receiver) {
      return res.status(404).send('멘션을 받을 유저가 존재하지 않습니다.');
    }

    const mention = await Mention.create({
      sender_id,
      receiver_id,
      target_type,
      context,
    });

    // 생성된 멘션과 함께 보낸 유저의 정보도 반환 (필요시)
    const fullMention = await Mention.findOne({
      where: { id: mention.id },
      include: [
        {
          model: User,
          as: 'Sender', // Mention 모델에 Sender 관계가 정의되어 있다고 가정
          attributes: ['id', 'nickname'],
        },
        {
          model: User,
          as: 'Receiver', // Mention 모델에 Receiver 관계가 정의되어 있다고 가정
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

// GET: localhost:3065/mention/received
// 로그인한 유저가 받은 멘션 목록 조회
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
      order: [['createdAt', 'DESC']], // 최신 멘션부터 정렬
    });

    res.status(200).json(mentions);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET: localhost:3065/mention/sent
// 로그인한 유저가 보낸 멘션 목록 조회
router.get('/sent', isLoggedIn, async (req, res, next) => {
  try {
    const sender_id = req.user.id;

    const mentions = await Mention.findAll({
      where: { sender_id },
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
      order: [['createdAt', 'DESC']], // 최신 멘션부터 정렬
    });

    res.status(200).json(mentions);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

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
    if (mention.sender_id !== req.user.id) {
      return res.status(403).send('멘션을 삭제할 권한이 없습니다.');
    }

    await Mention.destroy({
      where: {
        id: req.params.mentionId,
        sender_id: req.user.id, // 보낸 유저가 맞는지 다시 한번 확인
      },
    });

    res.status(200).json({ MentionId: parseInt(req.params.mentionId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;