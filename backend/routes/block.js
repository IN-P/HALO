const express = require('express');
const router = express.Router();
const { Block, User, Follow } = require('../models');

// 차단 추가: POST /block
router.post('/', async (req, res, next) => {
  console.log('req.body:', req.body); //  요청 body 확인용 로그
  try {
    const fromUserId = req.user.id; //  로그인한 사용자
    const { toUserId } = req.body;

    //  자기 자신 차단 방지
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신을 차단할 수 없습니다.' });
    }

    // 기존 차단 여부 확인
    const existing = await Block.findOne({
      where: { from_user_id: fromUserId, to_user_id: toUserId },
    });

    if (existing) {
      return res.status(400).json({ message: '이미 차단한 사용자입니다.' });
    }

    //  차단 정보 DB에 저장
    const block = await Block.create({
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });

    //  양방향 팔로우 관계 삭제 (차단 시)
    const deleted1 = await Follow.destroy({
      where: { from_user_id: fromUserId, to_user_id: toUserId },
    });
    const deleted2 = await Follow.destroy({
      where: { from_user_id: toUserId, to_user_id: fromUserId },
    });

    console.log(`팔로우 삭제됨: ${deleted1} / ${deleted2}`); //  디버그용 로그
    
    //  클라이언트에 차단 정보 응답
    res.status(201).json(block);
  } catch (err) {
    console.error(err); //  서버 오류 로그
    next(err);
  }
});

//  차단 해제: DELETE /block/:toUserId
router.delete('/:toUserId', async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const toUserId = parseInt(req.params.toUserId, 10);

    const existing = await Block.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: '차단관계가 존재하지 않습니다.' });
    }

    await existing.destroy();
    res.status(200).json({ message: '차단을 해제했습니다.' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

//  차단 목록 조회: GET /block
router.get('/', async (req, res, next) => {
  try {
    const fromUserId = req.user.id; 

    const blockedUsers = await Block.findAll({
      where: { from_user_id: fromUserId },
      include: [
        {
          model: User,
          as: 'Blocked', 
          attributes: ['id', 'nickname'], 
        },
      ],
    });

    res.status(200).json(blockedUsers.map(b => b.Blocked));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 특정 유저와의 차단 관계 확인: GET /block/status/:targetUserId
router.get('/status/:targetUserId', async (req, res, next) => {
  try {
    const myId = req.user.id;
    const targetUserId = parseInt(req.params.targetUserId, 10);

    // 내가 그 사람 차단했는지
    const isBlockedByMe = await Block.findOne({
      where: { from_user_id: myId, to_user_id: targetUserId },
    });

    // 그 사람이 나를 차단했는지
    const isBlockingMe = await Block.findOne({
      where: { from_user_id: targetUserId, to_user_id: myId },
    });

    res.status(200).json({
      isBlockedByMe: !!isBlockedByMe,
      isBlockingMe: !!isBlockingMe,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
