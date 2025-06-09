const express = require("express");
const router = express.Router();
const { User, Achievement } = require("../models");

// 업적 모두 불러오기
router.get("/", async (req, res, next) => {
    try {
        const achievements = await Achievement.findAll({
        attributes: ['id', 'name', 'description'],
        order: [['id', 'ASC']],
        });
        res.status(200).json(achievements);
    } catch (error) {
        console.error(error);
        next(error);
    }
});


// 업적 추가 [post] localhost3065:achievements
router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) { return res.status(400).json({ message: "업적 이름은 필수입니다." }); }
        const newAchievement = await Achievement.create({ name, description, });
        res.status(201).json(newAchievement);
    } catch (error) {
        console.error(error);
        next(error);
    }
});

// 유저에게 업적 추가
// post
// localhost:3065/:userId/achievements
// "achievements" : "1"
router.post("/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { achievementId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "존재하지 않는 유저입니다" });

        const achievement = await Achievement.findByPk(achievementId);
        if (!achievement) return res.status(404).json({ message: "존재하지 않는 업적입니다" });

        await user.addAchievement(achievement);

        res.status(200).json({ message: "업적이 유저에게 추가되었습니다." });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;