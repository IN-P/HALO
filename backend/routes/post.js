const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Post, User, Image, Comment, Hashtag, ActiveLog, Notification, Block , Mention } = require('../models'); // 재원 맨션
const { isLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');
const { sendNotification } = require('../notificationSocket');

const { checkAndAssignPostAchievements } = require('../services/achievement/post') //준혁
const { checkAndAssignLikeAchievements } = require('../services/achievement/like'); // 준혁

// uploads 폴더 생성
try {
  fs.accessSync('uploads/post');
} catch (error) {
  console.log('uploads/post 폴더가 없어서 생성합니다.');
  fs.mkdirSync('uploads/post', { recursive: true });
}

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/post');
    },
    filename(req, file, done) {
      const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const ext = path.extname(originalname);
      const basename = path.basename(originalname, ext);
      done(null, basename + '_' + Date.now() + ext);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 게시글 등록
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    console.log('req.body.receiver_id:', req.body.receiver_id);
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const mentions  = req.body.content.match(/@[^\s@]+/g);
    const post = await Post.create({
      content: req.body.content,
      user_id: req.user.id,
      private_post: req.body.private_post ?? false,
      location: req.body.location || null,
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null,
    });

    // 해시태그 등록/연결
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag =>
          Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } })
        )
      );
      await post.addHashtags(result.map(v => v[0]));
    }
    // 멘션 등록
if (mentions) {
  const result = await Promise.all(
    mentions.map(async tag => {
      const nickname = tag.slice(1);
      const receiver = await User.findOne({ where: { nickname } });
      if (receiver) {
        await Mention.create({
          senders_id: req.user.id,
          receiver_id: receiver.id,
          target_type: 'POST',
          target_id: post.id,
          context: req.body.content,
          createAt: new Date(),
        });
        // 준혁 : 알림 생성
        const sender = await User.findOne({
          where: req.user.id,
          attributes: ['nickname'] })
        await Notification.create({
          content: sender.nickname,
          users_id:  receiver.id,
          target_type_id: 8,
        })
        // 소켓 푸시
        sendNotification(receiver.id, {
          type: "MENTION",
          message: '당신을 언급했습니다'
        });
        //
        console.log(`✅ Mention 저장 완료: @${nickname} → userId=${receiver.id}`);
      } else {
        console.log(`⚠️ Mention 대상 유저 없음: @${nickname}`);
      }
    })
  );
}

    // 이미지 등록
    const user = await User.findByPk(req.user.id);
    const teamId = user.myteam_id || 1;

    let images = req.body.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        images = [images];
      }
    }
    if (!images || (Array.isArray(images) && images.length === 0)) {
      const dummySrc = `team_logo_${teamId}.png`;
      await Image.create({ src: dummySrc, post_id: post.id });
    } else {
      const imgArr = Array.isArray(images) ? images : [images];
      for (const src of imgArr) {
        if (src && src.trim() !== '') {
          await Image.create({ src, post_id: post.id });
        }
      }
    }

    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: Image },
        { model: User, attributes: ['id', 'nickname'] },
        { model: Comment, include: [{ model: User, attributes: ['id', 'nickname'] }] },
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        { model: Hashtag, attributes: ['id', 'name'] },
      ],
    });

    await ActiveLog.create({
      action: "CREATE",
      target_id: post.id,
      users_id: req.user.id,
      target_type_id: 1,
    })

    const postCount = await Post.count({ where: { user_id: req.user.id } });
    await checkAndAssignPostAchievements(req.user.id, postCount); // 준혁

    if (req.user) {
      const myId = req.user.id;
      const blockedRelations = await Block.findAll({
        where: {[Op.or]:[{ from_user_id: myId },{ to_user_id: myId },]}
      });
      const blockedUserIds = blockedRelations.map(b =>
        b.from_user_id === myId ? b.to_user_id : b.from_user_id
      );
      fullPost.Comments = fullPost.Comments.filter(c => !blockedUserIds.includes(c.User.id));
    }

    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 이미지 업로드
router.post('/images', isLoggedIn, upload.array('image'), (req, res) => {
  res.json(req.files.map(v => v.filename));
});

// 게시글 삭제
router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);

    let deletedRegramIds = [];
    if (post && !post.regram_id) {
      // 1. 리그램글 목록 조회
      const regrams = await Post.findAll({ where: { regram_id: req.params.postId } });
      // 2. 각 리그램글의 댓글/이미지 먼저 삭제
      for (const rg of regrams) {
        await Comment.destroy({ where: { post_id: rg.id } });
        await Image.destroy({ where: { post_id: rg.id } });
      }
      // 3. 그 후 리그램글 삭제
      await Post.destroy({ where: { regram_id: req.params.postId } });
      // 4. 삭제된 리그램글 id 저장
      deletedRegramIds = regrams.map(rg => rg.id);
    }

    await Image.destroy({ where: { post_id: req.params.postId } });
    await Comment.destroy({ where: { post_id: req.params.postId } });
    await Post.destroy({
      where: {
        id: req.params.postId,
        user_id: req.user.id,
      },
    });

    let basePost = null;
    if (post && post.regram_id) {
      basePost = await Post.findOne({
        where: { id: post.regram_id },
        include: [
          { model: User, as: 'Likers', attributes: ['id'] },
          { model: User, as: 'Bookmarkers', attributes: ['id'] },
          {
            model: Post,
            as: 'Regrams',
            include: [
              { model: User, attributes: ['id', 'nickname', 'profile_img'] }
            ]
          },
          { model: Comment, attributes: ['id'] },
        ]
      });
    }

    await ActiveLog.create({
      action: "DELETE",
      target_id: req.params.postId,
      users_id: req.user.id,
      target_type_id: 1,
    });

    res.status(200).json({
      PostId: parseInt(req.params.postId, 10),
      deletedRegramIds, // <<== 추가!
      ...(basePost && { basePost }),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 수정
router.patch('/:postId', isLoggedIn, async (req, res, next) => {
  const hashtags = req.body.content.match(/#[^\s#]+/g);
  const mentions = req.body.content.match(/@[^\s@]+/g);
  try {
    await Post.update(
      { 
        content: req.body.content, 
        private_post: req.body.private_post ?? false,
        location: req.body.location || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
      },
      { where: { id: req.params.postId, user_id: req.user.id } }
    );

    const post = await Post.findByPk(req.params.postId);

    // 해시태그 동기화
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag =>
          Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } })
        )
      );
      await post.setHashtags(result.map(v => v[0]));
    } else {
      await post.setHashtags([]);
    }
    // 맨션 동기화
      await Mention.destroy({
    where: {
    target_type: 'POST',
    target_id: post.id,
    },
  });
    if (mentions) {
  await Promise.all(
    mentions.map(async tag => {
      const nickname = tag.slice(1);
      const receiver = await User.findOne({ where: { nickname } });
      if (receiver) {
        await Mention.create({
          senders_id: req.user.id,
          receiver_id: receiver.id,
          target_type: 'POST',
          target_id: post.id,
          context: req.body.content,
          createAt: new Date(),
        });
        console.log(`✅ Mention 저장 완료 (patch): @${nickname} → userId=${receiver.id}`);
      } else {
        console.log(`⚠️ Mention 대상 유저 없음 (patch): @${nickname}`);
      }
    })
  );
}

    // 이미지 동기화
    if (req.body.images) {
      const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      const existingImages = await post.getImages();
      const existingSrcs = existingImages.map(img => img.src);

      const toRemove = existingImages.filter(img => !images.includes(img.src));
      await Promise.all(toRemove.map(img => img.destroy()));

      const toAdd = images.filter(src => !existingSrcs.includes(src));
      for (const src of toAdd) {
        const exists = await Image.findOne({ where: { src, post_id: post.id } });
        if (!exists) {
          await Image.create({ src, post_id: post.id });
        }
      }
    }

    // 준혁 : 활동 생성
    await ActiveLog.create({
      action: "UPDATE",
      target_id: req.params.postId,
      users_id: req.user.id,
      target_type_id: 1,
    });
    //

    res.status(200).json({ PostId: post.id, content: req.body.content });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 해시태그별 게시글 조회
router.get('/hashtag/:hashtag', async (req, res, next) => {
  try {
    const tag = await Hashtag.findOne({ where: { name: req.params.hashtag.toLowerCase() } });
    if (!tag) return res.status(404).send('없는 해시태그');
    const posts = await tag.getPosts({
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: Image },
        { model: Comment, include: [{ model: User, attributes: ['id', 'nickname'] }] },
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        { model: Hashtag, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 좋아요 추가 (항상 원본글에만)
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);

    await originPost.addLikers(req.user.id);

    const fullOrigin = await Post.findOne({
      where: { id: originPost.id },
      include: [
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regrams',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img'] },
          ],
        },
        { model: Comment, attributes: ['id'] },
      ]
    });

    // 준혁 추가 : 활동 내역 생성
    await ActiveLog.create({
      action: "CREATE",
      target_id: post.id,
      users_id: req.user.id,
      target_type_id: 5,
    });
    // 알림 생성
    // 좋아요를 받은 게시글의 내용 및 유저 추출
    const likedPost = await Post.findOne({
      where: { id: post.id },
      attributes: [ "content", "user_id" ],
    });
    // 좋아요를 받은 게시물의 user id와 좋아요를 남긴 유저 id가 다를 경우 알림 생성
    if ( likedPost.user_id !== req.user.id ) {
      await Notification.create({
        content: `${likedPost.content}`,
        users_id: likedPost.user_id,
        target_type_id: 5,
      })
      // 소켓 푸시
      sendNotification(likedPost.user_id, {
        type: 'LIKE',
        message: '좋아요를 받았습니다',
      });
    }
    //
    // 업적 부여
    await checkAndAssignLikeAchievements(req.user.id);

    res.status(200).json({ basePost: fullOrigin });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 좋아요 취소 (항상 원본글에만)
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);

    await originPost.removeLikers(req.user.id);

    const fullOrigin = await Post.findOne({
      where: { id: originPost.id },
      include: [
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regrams',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img'] },
          ],
        },
        { model: Comment, attributes: ['id'] },
      ]
    });

    // 활동 내역 추가 - 준혁 추가
    await ActiveLog.create({
      action: "DELETE",
      target_id: originPost.id,
      users_id: req.user.id,
      target_type_id: 5,
    });
    // 준혁 추가

    res.status(200).json({ basePost: fullOrigin });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 리그램 (리그램 자체는 새 글이 생기는거라 그대로 두되, 카운트는 원본글 기준)
router.post('/:postId/regram', isLoggedIn, async (req, res, next) => {
  try {
    const targetPost = await Post.findOne({ where: { id: req.params.postId } });
    if (!targetPost) return res.status(403).send('원본 게시글이 존재하지 않습니다.');
    const existingRegram = await Post.findOne({
      where: { user_id: req.user.id, regram_id: targetPost.id }
    });
    if (existingRegram) return res.status(403).send('이미 리그램한 게시글입니다.');

    // 리그램 생성
    const regram = await Post.create({
      user_id: req.user.id,
      regram_id: targetPost.id,
      content: req.body.content || '',
    });

    // 원본글 최신 데이터 포함 응답 (여기도 마찬가지!)
    const fullOrigin = await Post.findOne({
      where: { id: targetPost.id },
      include: [
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regrams',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img'] },
          ],
        },
        { model: Comment, attributes: ['id'] },

      ]
    });

    // 새 리그램글 정보도 같이 보내주면 프론트에서 리그램글 바로 보여줄 수 있음
    const fullRegram = await Post.findOne({
      where: { id: regram.id },
      include: [
        { model: User, attributes: ['id', 'nickname', 'profile_img'] },
        { model: Image },
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regram',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img'] },
            { model: Image },
          ],
        },
      ],
      order: [
        [Image, 'id', 'ASC'],
        [{ model: Post, as: 'Regram' }, Image, 'id', 'ASC'],
      ],
    });

    res.status(201).json({ fullRegram, basePost: fullOrigin });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 북마크 추가 (항상 원본글에만)
router.patch('/:postId/bookmark', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);

    await originPost.addBookmarkers(req.user.id);

    const fullOrigin = await Post.findOne({
      where: { id: originPost.id },
      include: [
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regrams',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img'] },
          ],
        },
        { model: Comment, attributes: ['id'] },
      ]
    });

    res.status(200).json({ basePost: fullOrigin });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 북마크 취소 (항상 원본글에만)
router.delete('/:postId/bookmark', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);

    await originPost.removeBookmarkers(req.user.id);

    const fullOrigin = await Post.findOne({
      where: { id: originPost.id },
      include: [
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regrams',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img'] },
          ],
        },
        { model: Comment, attributes: ['id'] },
      ]
    });

    res.status(200).json({ basePost: fullOrigin });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET /post/:postId 단일 상세 조회
router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: [
        { model: User, attributes: ['id', 'nickname', 'profile_img', 'last_active', 'is_private'] },
        { model: Image },
        { model: Comment, include: [{ model: User, attributes: ['id', 'nickname', 'profile_img', 'last_active'] }] },
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        { model: Hashtag, attributes: ['id', 'name'] },
        // 🚫 Mention만 완전히 뺌
        {
          model: Post,
          as: 'Regram',
          include: [
            { model: User, attributes: ['id', 'nickname', 'profile_img', 'last_active', 'is_private'] },
            { model: Image },
          ],
        },
      ],
    });
    if (!post) return res.status(404).send('존재하지 않는 게시글입니다.');

    const me = req.user; // 로그인 안했으면 undefined

    const postData = post.toJSON();

    // 🚩 Mentions 가공 코드 등 기존 로직은 그대로 둔다!
    // Mentions는 undefined/null이지만, 아래처럼 null 체크 있으니 문제 없음
    if (postData.Mentions && postData.Mentions.length > 0) {
      postData.Mentions = postData.Mentions.map(mention => {
        return {
          ...mention,
          nickname: mention.Receiver ? mention.Receiver.nickname : null,
          user_id: mention.Receiver ? mention.Receiver.id : null,
        };
      });
    }

    // 가공된 게시물 데이터를 프론트엔드로 응답
    res.status(200).json(postData);

    // [1] 리그램글: 원본글이 나만보기/비공개/팔로워만 필터
    if (post.regram_id && post.Regram) {
      const origin = post.Regram;
      if (origin.private_post && (!me || me.id !== origin.user_id)) {
        return res.status(403).send('비공개 글입니다.');
      }
      if (origin.User && origin.User.is_private === 1) {
        if (!me || (me.id !== origin.User.id && !(await isFollower(me.id, origin.User.id)))) {
          return res.status(403).send('비공개 계정의 글입니다.');
        }
      }
    } else {
      if (post.private_post && (!me || me.id !== post.user_id)) {
        return res.status(403).send('비공개 글입니다.');
      }
      if (post.User && post.User.is_private === 1) {
        if (!me || (me.id !== post.User.id && !(await isFollower(me.id, post.User.id)))) {
          return res.status(403).send('비공개 계정의 글입니다.');
        }
      }
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 👉 팔로워 여부 확인 유틸 함수 예시
async function isFollower(meId, userId) {
  if (!meId || !userId) return false;
  const { Follow } = require('../models');
  const follow = await Follow.findOne({
    where: { follower_id: meId, following_id: userId }
  });
  return !!follow;
}

module.exports = router;
