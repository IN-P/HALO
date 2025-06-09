const express = require("express");
const router = express.Router();
const { User, Badge } = require("../models");

// 뱃지 모두 불러오기
router.get("/", async (req, res, next) => {
    try {
        const badges = await Badge.findAll({
        attributes: ['id', 'name', 'img', 'description'],
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
router.post("/", async (req, res, next) => {
    try {
        const { name, description, img } = req.body;
        if (!name) { return res.status(400).json({ message: "뱃지 이름은 필수입니다." }); }
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

// 뱃지 수정
// patch
// localhost:3065/badges/:id
router.patch('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { name, description, img } = req.body;

    try {
        const badge = await Badge.findByPk(id);

        if (!badge) { return res.status(404).json({ message: '뱃지를 찾을 수 없습니다.' }); }

        await badge.update({
        name: name ?? badge.name,
        description: description ?? badge.description,
        img: img ?? badge.img,
        });

        res.status(200).json({ message: '뱃지 정보가 수정되었습니다.', badge });
    } catch (error) {
        console.error(error);
        next(error);
    }
});



module.exports = router;