const express = require('express');
const router = express.Router();
const { Quiz, QuizOption } = require('../models');

// 퀴즈 등록
router.post('/quizzes', async(req, res) => {
    const { question, type, point_reward, options } = req.body

    console.log("받은 options: ", options)

    try {
        const quiz = await Quiz.create({
            question,
            type,
            point_reward,
        })

        // options 처리
        if (Array.isArray(options)) {
            const quizOptions = options.map((opt) => ({
                quizzes_id: quiz.id,
                question_option: opt.question_option,
                answer: opt.answer
            }))

            console.log("저장할 보기: ", quizOptions)
            await QuizOption.bulkCreate(quizOptions)
            console.log("보기 저장 완료")
        }
        res.status(201).json({id: quiz.id})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "퀴즈 저장 실패"})
    }
})

module.exports = router;