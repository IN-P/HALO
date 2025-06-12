const express = require("express");
const router = express.Router();
const { User, Badge, sequelize, UserBadge } = require("../models");
const multer = require('multer');
const path = require('path');
const { isLoggedIn } = require('./middlewares'); // 로그인 여부 체크 미들웨어

// multer 셋팅 (uploads/badges 폴더에 저장)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/badges/');
  },
  filename(req, file, cb) {
    // 예: badge-1234567890.png
    const ext = path.extname(file.originalname);
    cb(null, 'badge-' + Date.now() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

// 뱃지 모두 불러오기
router.get("/", async (req, res, next) => {
    try {
        const badges = await Badge.findAll({
        order: [['id', 'ASC']],
        });
        res.status(200).json(badges);
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// 뱃지 추가
// post
// localhost:3065/badges
// "name" : "새 뱃지"
// "description" : "설명"
// "img" : "이미지 주소"
router.post("/", upload.single('img'), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "뱃지 이름은 필수입니다." });

    // 이미지가 업로드되면 req.file에 파일 정보가 있음
    const img = req.file ? `/img/badges/${req.file.filename}` : null;

    const newBadge = await Badge.create({ name, description, img });
    res.status(201).json(newBadge);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 유저에게 뱃지
// post
// localhost:3065/badges/:userId
// "badgeId" : "1"
router.post("/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { badgeId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "존재하지 않는 유저입니다" });

        const badge = await Badge.findByPk(badgeId);
        if (!badge) return res.status(404).json({ message: "존재하지 않는 뱃지입니다" });

        await user.addBadge(badge);

        res.status(200).json({ message: "업적이 유저에게 추가되었습니다." });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 유저 뱃지 선택
router.patch('/:userId/:badgeId/:isSelected', isLoggedIn, async (req, res) => {
  const { userId, badgeId, isSelected } = req.params;

  try {
    // 모든 뱃지 선택 초기화
      await UserBadge.update(
        { isSelected: false },
        { where: { user_id: userId } }
      )

    // 대상 UserBadge가 없으면 에러 처리 필요
    const [updated] = await UserBadge.update(
      { isSelected: isSelected },
      { where: { user_id: userId, badge_id: badgeId } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: 'UserBadge not found' });
    }

    return res.json({ message: 'UserBadge selection updated successfully' });
  } catch (error) {
    console.error('Error updating UserBadge selection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

// 뱃지 수정
// patch
// localhost:3065/badges/:id
router.patch('/:id', upload.single('img'), async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const badge = await Badge.findByPk(id);
    if (!badge) return res.status(404).json({ message: '뱃지를 찾을 수 없습니다.' });

    const img = req.file ? `/img/${req.file.filename}` : badge.img;

    await badge.update({
      name: name ?? badge.name,
      description: description ?? badge.description,
      img,
    });

    res.status(200).json({ message: '뱃지 정보가 수정되었습니다.', badge });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 뱃지 삭제
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  const transaction = await sequelize.transaction();

  try {
    const badge = await Badge.findByPk(id, { transaction });

    if (!badge) {
      await transaction.rollback();
      return res.status(404).json({ message: '뱃지를 찾을 수 없습니다.' });
    }

    // 조인 테이블에서 삭제 (sequelize는 자동 삭제 안될 수 있음)
    await badge.removeUsers(await badge.getUsers({ transaction }), { transaction });

    // 뱃지 삭제
    await badge.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({ message: '뱃지가 삭제되었습니다.' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});


module.exports = router;