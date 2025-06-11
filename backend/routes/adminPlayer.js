const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { Player } = require('../models');

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads')); // 백엔드 uploads 경로
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext; // 고유한 이름으로 저장
    cb(null, filename);
  },
});

const upload = multer({ storage });

// 1. 선수 이미지 업로드
router.post("/players/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "이미지를 업로드해주세요." });
  }

  const filePath = `/uploads/${req.file.filename}`;  // ##
  res.status(200).json([filePath]);  // 배열 형태로 반환
});

// 2. 선수 등록
router.post("/players", async (req, res) => {
  const { name, rarity, image_url } = req.body;

  console.log('[등록 요청 수신]', req.body); // 이 줄이 핵심

  if (!name || !rarity || !image_url) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  try {
    const player = await Player.create({
      name,
      rarity,
      image_url,
    });

    res.status(201).json({
      message: "선수 등록 완료",
      player,
    });
  } catch (err) {
    console.error('[DB 등록 실패]', err);
    res.status(500).json({ error: "선수 등록 실패" });
  }
});


// 3. 선수 목록 조회 (관리자 전용)
router.get("/players", async (req, res) => {
    try {
        const players = await Player.findAll({
            order: [["id", "desc"]],
        })
        res.json(players);
    } catch (err) {
        res.status(500).json({error: "선수 목록 조회 실패"});
    }
})

module.exports = router;