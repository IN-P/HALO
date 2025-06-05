const express = require('express');
const router = express.Router();
const { Quiz, QuizOption } = require('../models');

// 퀴즈 등록
router.post('/quizzes', async(req, res) => {
    const { question, type, point_reward } = req.body

    try {
        const quiz = await Quiz.create({
            question,
            type,
            point_reward,
        })

        res.status(201).json({id: quiz.id})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "퀴즈 저장 실패"})
    }
})

// 보기 등록
router.post('/quiz-options', async (req, res) => {
    const { quizzes_id, question_option, answer } = req.body

    try {
        await QuizOption.create({
            quizzes_id,
            question_option,
            answer,  // 1 또는 0
        })

        res.status(201).json({message: "옵션 등록 완료"})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "보기 저장 실패"})
    }
})

module.exports = router;