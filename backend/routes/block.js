const express = require('express');
const router = express.Router();
const { Block, User } = require('../models');

// 차단추가 http://localhost:3065/api/block
router.post('/',async(req,res,next)=>{
   console.log('req.body:', req.body); // ✅ 찍어봐
  try{
    const fromUserId = 1;
    const{toUserId}=req.body;

    if(fromUserId === toUserId){
      return res.status(400).json({message:'자기 자신을 차단할 수 없습니다.'})
    }

    const existing = await Block.findOne({
      where:{from_user_id: fromUserId, to_user_id:toUserId},
    });

    if(existing){
      return res.status(400).json({message:'이미 차단한 사용자입니다.'});
    }

    const block = await Block.create({
      from_user_id:fromUserId,
      to_user_id:toUserId,
    }); 
    
    res.status(201).json(block);
  }catch(err){
    console.error(err);
    next(err);
  }
});

// 차단 해제 http://localhost:3065/api/block/2
router.delete('/:toUserId',async(req,res,next)=>{
  try{
    const fromUserId = 1;
    const toUserId = parseInt(req.params.toUserId,10);

    const existing = await Block.findOne({
      where:{
        from_user_id:fromUserId,
        to_user_id:toUserId,
      },
    });
    if(!existing){
      return res.status(404).json({message:'차단관계가 존재하지 않습니다.'});
    }
    await existing.destroy();
    res.status(200).json({message:'차단을 해제했습니다.'});
  }catch(err){
    console.error(err);
    next(err);
  }
});

// 차단 목록 조회: GET /api/block
router.get('/', async (req, res, next) => {
  try {
    const fromUserId = 1; // 나중에 req.user.id로 바꾸기

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

module.exports = router;
