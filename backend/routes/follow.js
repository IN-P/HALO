const express = require('express');
const router = express.Router();
const { Follow,User } = require('../models');
const { where } = require('sequelize');


// 팔로우하기 http://localhost:3065/api/follow
router.post('/follow', async (req, res, next) => {
  console.log('......req.body:', req.body);

  try {
    const { toUserId } = req.body;
    const fromUserId = 1;

    const existing = await Follow.findOne({
      where: {
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: '이미 팔로우한 사용자입니다.' })
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신은 팔로우할 수 없습니다.' });
    }
    const follow = await Follow.create({
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });
    res.status(201).json(follow);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// 팔로우 삭제 http://localhost:3065/api/following/2
router.delete('/following/:toUserId', async (req, res, next) => {
  try {
    const fromUserId = 1;
    const toUserId = parseInt(req.params.toUserId, 10);

    if (fromUserId === toUserId) {
      return res.status(400).json({ message: '자기 자신을 언팔로우 할 수 없습니다.' })
    }

    const existing = await Follow.findOne({
      where: { from_user_id: fromUserId, to_user_id: toUserId },
    });

    if (!existing) {
      return res.status(404).json({ message: '팔로우 관계가 존재하지 않습니다.' });
    }

    await existing.destroy();
    res.status(200).json({ message: '팔로우가 취소되었습니다' });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 팔로워 삭제 http://localhost:3065/api/follower/1
router.delete('/follower/:fromUserId',async(req,res,next)=>{
  try{
    const toUserId = 2;
    const fromUserId=parseInt(req.params.fromUserId,10);

    if(fromUserId === toUserId){
      return res.status(400).json({message:'자기 자신을 제거할 수 없습니다'})
    }

    const existing = await Follow.findOne({
      where:{
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });
    if (!existing){
      return res.status(404).json({message:'해당 사용자는 당신을 팔로우 하고 있지 않습니다.'});
    }

    await existing.destroy();
    res.status(200).json({message:'해당 팔로워를 제거했습니다.'});
  }catch(err){
    console.error(err);
    next(err);
  }
});


// 팔로잉 목록조회 http://localhost:3065/api/followings
router.get('/followings', async (req, res, next) => {
  try {
    const fromUserId = 1;
    const followings = await Follow.findAll({
      where: { from_user_id: fromUserId },
      include: [
        {
          model: User,
          as: 'Following',
          attributes: ['id','nickname'],
        },
      ],
    });
    res.status(200).json(followings.map(f => f.Following));
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 팔로워 목록조회 http://localhost:3065/api/followers
router.get('/followers', async(req,res,next)=>{
  try{
    const toUserId = 2;

    const followers = await Follow.findAll({
      where : {to_user_id:toUserId},
      include:[{
        model : User,
        as:'Follower',
        attributes:['id','nickname']
      },],
    });
    res.status(200).json(followers.map(f=>f.Follower));
  }catch(err){
    console.error(err);
    next(err);
  }
});


module.exports = router;