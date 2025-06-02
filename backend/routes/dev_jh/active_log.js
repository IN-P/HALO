const express = require("express");
const router = express.Router();
const { ActiveLog, TargetType, User } = require('../../models');

// userId로 활동 내역 불러오기
router.get("/:userId", async (req, res, next) => {
  try {
    const personalActiveLogs = await ActiveLog.findAll({
      where: { users_id: req.params.userId },
      attributes: ["action", "target_id", "target_type_id", "createdAt"],
      include: [
        {
          model: TargetType,  
          attributes: ['id', 'code'],
        },
      ],
    });
    res.status(200).json(personalActiveLogs);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 

module.exports = router;