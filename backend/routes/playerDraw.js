const express = require('express');
const router = express.Router();
const { Player, PlayerDraw } = require('../models');

// 1. 모든 선수 목록 조회 (뽑기용)
router.get('/players', async (req, res) => {
    try {
        const players = await Player.findAll({
            attributes: ["id", "name", "rarity", "image_url"],
        })
        res.json(players)
    } catch (err) {
        res.status(500).json({error: "선수 목록 조회 실패"})
    }
})

// 2. 선수 뽑기 (랜덤 + 저장)
router.post('/player-draw', async (req, res) => {
    const { users_id, used_points } = req.body

    try {
        // 랜덤 선수 선택
        const allPlayers = await Player.findAll()
        const playersByRarity = {
          LEGEND: allPlayers.filter((p) => p.rarity === "LEGEND"),
          RARE: allPlayers.filter((p) => p.rarity === "RARE"),
          NORMAL: allPlayers.filter((p) => p.rarity === "NORMAL"),
        }
        
        // 확률 기반 희귀도 선택
        const rand = Math.floor(Math.random() * 100)  // 0~99
        
        let rarity
        if (rand < 5) rarity = "LEGEND"  // 5%
        else if (rand < 30) rarity = "RARE"  // 25%
        else rarity = "NORMAL"  // 70%

        const pool = playersByRarity[rarity]
        if (!pool || pool.length === 0) {
          return res.status(500).json({error: `${rarity} 등급 선수가 없습니다.`})
        }

        // 해당 희귀도 그룹에서 랜덤 선택
        const randomPlayer = pool[Math.floor(Math.random() * pool.length)]

        // 뽑기 기록 저장
        const draw = await PlayerDraw.create({
            users_id,
            players_id: randomPlayer.id,
            used_points,
            draw_time: new Date(),
        })

        res.status(201).json({
            message: "선수 뽑기 완료",
            player: {
                id: randomPlayer.id,
                name: randomPlayer.name,
                rarity: randomPlayer.rarity,
                image_url: randomPlayer.image_url,
            },
            draw_id: draw.id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "뽑기 실패"});
    }
});

// 3. 유저 뽑기 이력 조회
router.get("/player-draw/history/:userId", async (req, res) => {
  try {
    const history = await PlayerDraw.findAll({
      where: { users_id: req.params.userId },
      include: [
        {
          model: Player,
          attributes: ["name", "rarity", "image_url"],
        },
      ],
      order: [["draw_time", "DESC"]],
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "이력 조회 실패" });
  }
});

module.exports = router;