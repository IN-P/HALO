const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nickname'],
    });
    res.status(200).json(
      users.map((u) => ({
        nickname: u.nickname,
        user_id: u.id,
      }))
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
