const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Post, User, Image, Comment, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

// uploads 폴더 생성
try {
  fs.accessSync('uploads/post');
} catch (error) {
  console.log('📁 uploads/post 폴더가 없어서 생성합니다.');
  fs.mkdirSync('uploads/post', { recursive: true });
}

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/post');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// 게시글 등록
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const post = await Post.create({
      content: req.body.content,
      user_id: req.user.id,
      visibility: req.body.isPublic ? 'public' : 'private',
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

    // 이미지 등록
    if (req.body.images) {
      const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      for (const src of images) {
        await Image.create({ src, post_id: post.id });
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
    // 0. 이미지 삭제
    await Image.destroy({ where: { post_id: req.params.postId } });
    // 1. 댓글 삭제
    await Comment.destroy({ where: { post_id: req.params.postId } });
    // 2. 게시글 삭제
    await Post.destroy({
      where: {
        id: req.params.postId,
        user_id: req.user.id,
      },
    });

    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 게시글 수정 (해시태그/이미지 동기화)
router.patch('/:postId', isLoggedIn, async (req, res, next) => {
  const hashtags = req.body.content.match(/#[^\s#]+/g);
  try {
    await Post.update(
      { content: req.body.content, visibility: req.body.isPublic ? 'public' : 'private' },
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
      await post.setHashtags([]); // 해시태그 없으면 연결 해제
    }

    // 이미지 동기화
    if (req.body.images) {
      const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      const existingImages = await post.getImages();
      const existingSrcs = existingImages.map(img => img.src);

      // 삭제될 이미지
      const toRemove = existingImages.filter(img => !images.includes(img.src));
      await Promise.all(toRemove.map(img => img.destroy()));

      // 새로 추가된 이미지
      const toAdd = images.filter(src => !existingSrcs.includes(src));
      for (const src of toAdd) {
        const exists = await Image.findOne({ where: { src, post_id: post.id } });
        if (!exists) {
          await Image.create({ src, post_id: post.id });
        }
      }
    }

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

// 좋아요 추가
router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(404).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);
    await originPost.addLikers(req.user.id);
    res.status(200).json({ PostId: originPost.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 좋아요 취소
router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);
    await originPost.removeLikers(req.user.id);
    res.status(200).json({ PostId: originPost.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 리그램
router.post('/:postId/regram', isLoggedIn, async (req, res, next) => {
  try {
    // 원글 존재 확인
    const targetPost = await Post.findOne({ where: { id: req.params.postId } });
    if (!targetPost) return res.status(403).send('원본 게시글이 존재하지 않습니다.');
    // 자기 글 리그램 금지
    if (req.user.id === targetPost.user_id) {
      return res.status(403).send('자기 글은 리그램할 수 없습니다.');
    }
    // 이미 리그램한 경우 금지 (원하면)
    const existingRegram = await Post.findOne({
      where: { user_id: req.user.id, regram_id: targetPost.id }
    });
    if (existingRegram) return res.status(403).send('이미 리그램한 게시글입니다.');

    // 리그램 생성
    const regram = await Post.create({
      user_id: req.user.id,
      regram_id: targetPost.id,
      content: req.body.content || '', // 코멘트 허용 시
      visibility: req.body.isPublic ? 'public' : 'private',
    });

    // 원글의 이미지, 해시태그 등 필요시 복사 로직 추가

    const fullRegram = await Post.findOne({
      where: { id: regram.id },
      include: [
        { model: User, attributes: ['id', 'nickname'] },
        { model: Image },
        { model: User, as: 'Likers', attributes: ['id'] },
        { model: User, as: 'Bookmarkers', attributes: ['id'] },
        {
          model: Post,
          as: 'Regram',
          include: [
            { model: User, attributes: ['id', 'nickname'] },
            { model: Image },
          ],
        },
      ],
    });

    res.status(201).json(fullRegram);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 북마크 추가
router.patch('/:postId/bookmark', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);
    await originPost.addBookmarkers(req.user.id);
    res.status(200).json({ PostId: originPost.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 북마크 취소
router.delete('/:postId/bookmark', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) return res.status(403).send('게시글이 존재하지 않습니다.');
    const originId = post.regram_id || post.id;
    const originPost = (originId === post.id) ? post : await Post.findByPk(originId);
    await originPost.removeBookmarkers(req.user.id);
    res.status(200).json({ PostId: originPost.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
