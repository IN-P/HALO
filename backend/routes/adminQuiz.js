const express = require('express');
const router = express.Router();
const { Quiz, QuizOption } = require('../models');

// 퀴즈 등록
router.post('/quizzes', async(req, res) => {
    const { question, type, point_reward, options } = req.body;

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
            }));

            await QuizOption.bulkCreate(quizOptions);
        }
        res.status(201).json({id: quiz.id});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "퀴즈 저장 실패"});
    }
});

// 퀴즈 수정
router.put("/quizzes/:id", async (req, res) => {
    const { id } = req.params;
    const { question, point_reward, type, options } = req.body;
    const quiz = await Quiz.findByPk(id);
    if(!quiz) return res.status(404).json({error: "퀴즈 없음"});

    await quiz.update({question, point_reward, type});
    await QuizOption.destroy({where: {quizzes_id: id}});
    const newOptions = options.map((opt) => ({
        ...opt,
        quizzes_id: id,
    }));
    await QuizOption.bulkCreate(newOptions);

    res.status(200).json({message: "수정 완료"});
});

module.exports = router;