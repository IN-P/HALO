const express = require('express');
const router = express.Router();
const { Player } = require('../models');

// 1. 선수 등록
router.post("/players", async (req, res) => {
    const { name, rarity, image_url } = req.body

    if (!name || !rarity || !image_url) {
        return res.status(400).json({error: "모든 필드를 입력해주세요."})
    }

    try {
        const player = await Player.create({
            name,
            rarity,
            image_url
        })

        res.status(201).json({
            message: "선수 등록 완료",
            player,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "선수 등록 실패패"})
    }
})

// 2. 선수 목록 조회 (관리자 전용)
router.get("/players", async (req, res) => {
    try {
        const players = await Player.findAll({
            order: [["id", "desc"]],
        })
        res.json(players)
    } catch (err) {
        res.status(500).json({error: "선수 목록 조회 실패"})
    }
})

module.exports = router;