const express = require('express');
const router = express.Router();
const { Player, PlayerDraw, UserPoint, PointLogs } = require('../models');
const { isLoggedIn } = require('./middlewares');

// 1. 선수 목록 조회
router.get('/players', isLoggedIn, async (req, res) => {
  try {
    const players = await Player.findAll({
      attributes: ['id', 'name', 'rarity', 'image_url'],
    });
    res.json(players);
  } catch (err) {
    console.error('[선수 목록 조회 실패]', err);
    res.status(500).json({ error: '선수 목록 조회 실패' });
  }
});

// 2. 선수 뽑기 (단일/다중)
router.post('/player-draw', isLoggedIn, async (req, res) => {
  const users_id = req.user.id;
  const count = parseInt(req.body.count, 10);
  const drawCount = isNaN(count) || count <= 0 ? 1 : count;
  const used_points = 10 * drawCount;

  try {
    // 포인트 확인
    const [userPoint] = await UserPoint.findOrCreate({
      where: { users_id },
      defaults: { total_points: 0 },
    });

    if (userPoint.total_points < used_points) {
      return res.status(400).json({ error: `${used_points}포인트가 필요합니다.` });
    }

    const allPlayers = await Player.findAll();
    const playersByRarity = {
      LEGEND: allPlayers.filter(p => p.rarity === 'LEGEND'),
      RARE: allPlayers.filter(p => p.rarity === 'RARE'),
      NORMAL: allPlayers.filter(p => p.rarity === 'NORMAL'),
    };

    const drawn = [];

    for (let i = 0; i < drawCount; i++) {
      const rand = Math.floor(Math.random() * 100);
      const rarity = rand < 5 ? 'LEGEND' : rand < 30 ? 'RARE' : 'NORMAL';
      const pool = playersByRarity[rarity];

      if (!pool || pool.length === 0) {
        return res.status(500).json({ error: `${rarity} 등급 선수가 없습니다.` });
      }

      const selected = pool[Math.floor(Math.random() * pool.length)];

      await PlayerDraw.create({
        users_id,
        players_id: selected.id,
        used_points: 10,
        draw_time: new Date(),
      });

      drawn.push({
        id: selected.id,
        name: selected.name,
        rarity: selected.rarity,
        image_url: selected.image_url,
      });
    }

    // 포인트 차감
    userPoint.total_points -= used_points;
    await userPoint.save();

    // 포인트 로그 기록
    await PointLogs.create({
      users_id,
      type: used_points,
      source: 'DRAW',
    });

    res.status(201).json({
      message: `${drawCount}회 뽑기 완료`,
      players: drawn,
    });
  } catch (err) {
    console.error('[뽑기 실패]', err);
    res.status(500).json({ error: '뽑기 실패' });
  }
});

// 3. 뽑기 이력 조회
router.get('/player-draw/history', isLoggedIn, async (req, res) => {
  try {
    const history = await PlayerDraw.findAll({
      where: { users_id: req.user.id },
      include: [
        {
          model: Player,
          attributes: ['name', 'rarity', 'image_url'],
        },
      ],
      order: [['draw_time', 'DESC']],
    });
    res.json(history);
  } catch (err) {
    console.error('[이력 조회 실패]', err);
    res.status(500).json({ error: '이력 조회 실패' });
  }
});

module.exports = router;