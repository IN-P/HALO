const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { Advertisement } = require('../models');

const isAdmin = require('../middlewares/isAdmin'); // ✅ 이건 정상

// ⭐ isLoggedIn 뺌 → 광고 테스트만 먼저 할 수 있음 ⭐

// 광고 이미지 업로드 폴더 체크
try {
  fs.accessSync('advertisement_uploads');
} catch (error) {
  console.log('advertisement_uploads 폴더가 없으면 생성합니다.');
  fs.mkdirSync('advertisement_uploads');
}

const uploadAdvertisementImage = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'advertisement_uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + '_' + new Date().getTime() + ext);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// 광고 등록
router.post('/', isAdmin, uploadAdvertisementImage.single('image'), async (req, res, next) => {
  try {
    const { title, target_url, start_date, end_date, is_active } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = req.file.filename;
    }

    const advertisement = await Advertisement.create({
      title,
      image_url,
      target_url,
      start_date,
      end_date,
      is_active: is_active === 'true',
    });

    res.status(201).json(advertisement);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 이미지 업로드
router.post('/image', isAdmin, uploadAdvertisementImage.single('image'), (req, res, next) => {
  console.log(req.file);
  if (req.file) {
    res.json(req.file.filename);
  } else {
    res.status(400).send('이미지 파일이 업로드되지 않았습니다.');
  }
});

// 광고 목록 조회
router.get('/', isAdmin, async (req, res, next) => {
  try {
    const advertisements = await Advertisement.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(advertisements);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
