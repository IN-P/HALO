const express = require('express');
const router = express.Router();
const fs = require('fs'); // 파일 시스템 (file system)
const multer = require('multer'); // 파일 업로드
const path = require('path'); // 경로

const { Advertisement } = require('../models');
const { isLoggedIn, isAdmin } = require('./middlewares'); // isAdmin 미들웨어 추가 가정

// 폴더 존재 여부 확인 (광고 이미지 업로드를 위해)
try {
  fs.accessSync('advertisement_uploads'); // 폴더 존재 여부 확인
} catch (error) {
  console.log('advertisement_uploads 폴더가 없으면 생성합니다.');
  fs.mkdirSync('advertisement_uploads'); // 폴더 만들기
}

// 1. 업로드 설정 (광고 이미지)
const uploadAdvertisementImage = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'advertisement_uploads'); // 지정 경로 지정 - 콜백
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // 확장자 추출
      const basename = path.basename(file.originalname, ext); // 이미지 이름 (파일 이름)
      done(null, basename + '_' + new Date().getTime() + ext); // images1_날짜지정.png
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB (광고 이미지는 좀 더 크게)
});

// 1. 광고 생성 (POST /advertisement)
// POST: localhost:3065/advertisement
router.post('/', isLoggedIn, isAdmin, uploadAdvertisementImage.single('image'), async (req, res, next) => {
  try {
    const { title, target_url, start_date, end_date, is_active } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = req.file.filename; // 업로드된 파일 이름
    }

    const advertisement = await Advertisement.create({
      title,
      image_url,
      target_url,
      start_date,
      end_date,
      is_active: is_active === 'true', // 문자열 'true'를 불리언 true로 변환
    });

    res.status(201).json(advertisement);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST: localhost:3065/advertisement/image
// 이미지 업로드만 담당하는 라우트
router.post('/image', isLoggedIn, isAdmin, uploadAdvertisementImage.single('image'), (req, res, next) => {
  console.log(req.file);
  if (req.file) {
    res.json(req.file.filename); // 업로드된 파일의 이름 반환
  } else {
    res.status(400).send('이미지 파일이 업로드되지 않았습니다.');
  }
});

// GET: localhost:3065/advertisement
// 모든 광고 목록 조회 (관리자용)
router.get('/', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    const advertisements = await Advertisement.findAll({
      order: [['createdAt', 'DESC']], // 최신 광고부터 정렬
    });
    res.status(200).json(advertisements);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET: localhost:3065/advertisement/active
// 현재 날짜를 기준으로 활성화된 광고만 조회 (사용자 노출용)
router.get('/active', async (req, res, next) => {
  try {
    const currentDate = new Date();
    const advertisements = await Advertisement.findAll({
      where: {
        is_active: true,
        start_date: {
          [Op.lte]: currentDate, // 시작일이 현재 날짜보다 같거나 이전
        },
        end_date: {
          [Op.gte]: currentDate, // 종료일이 현재 날짜보다 같거나 이후
        },
      },
      order: [['createdAt', 'DESC']], // 최신 광고부터 정렬
    });
    res.status(200).json(advertisements);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GET: localhost:3065/advertisement/:advertisementId
router.get('/:advertisementId', async (req, res, next) => {
  try {
    const advertisement = await Advertisement.findOne({
      where: { id: req.params.advertisementId },
    });

    if (!advertisement) {
      return res.status(404).send('광고가 존재하지 않습니다.');
    }
    res.status(200).json(advertisement);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// PATCH: localhost:3065/advertisement/:advertisementId
// 관리자만 광고를 수정할 수 있도록 isAdmin 미들웨어 사용 (가정)
router.patch('/:advertisementId', isLoggedIn, isAdmin, uploadAdvertisementImage.single('image'), async (req, res, next) => {
  try {
    const advertisement = await Advertisement.findOne({
      where: { id: req.params.advertisementId },
    });

    if (!advertisement) {
      return res.status(404).send('광고가 존재하지 않습니다.');
    }

    const { title, target_url, start_date, end_date, is_active } = req.body;
    let updateData = {
      title,
      target_url,
      start_date,
      end_date,
      is_active: is_active === 'true',
    };

    if (req.file) {
      // 새로운 이미지가 업로드되면 image_url 업데이트
      updateData.image_url = req.file.filename;
    }

    await Advertisement.update(updateData, {
      where: { id: req.params.advertisementId },
    });

    const updatedAdvertisement = await Advertisement.findOne({
      where: { id: req.params.advertisementId },
    });
    res.status(200).json(updatedAdvertisement);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// DELETE: localhost:3065/advertisement/:advertisementId
// 관리자만 광고를 삭제할 수 있도록 isAdmin 미들웨어 사용 (가정)
router.delete('/:advertisementId', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    await Advertisement.destroy({
      where: { id: req.params.advertisementId },
    });
    res.status(200).json({ AdvertisementId: parseInt(req.params.advertisementId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;