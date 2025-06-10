const express = require("express");
const router = express.Router();
const { Quiz, QuizOption, UsersQuiz } = require("../models");

// 1. 전체 퀴즈 목록 (문제만)
router.get("/", async (req, res) => {
    const quizzes = await Quiz.findAll({
        attributes: ["id", "question", "type"],
        order: [["createdAt", "desc"]],
    });
    res.json(quizzes);
});

// 2. 특정 퀴즈 보기 + 선택지
router.get("/:id", async (req, res) => {
    const quiz = await Quiz.findByPk(req.params.id, {
        attributes: ["id", "question", "point_reward"],
        include: [
            {
                model: QuizOption,
                attributes: ["id", "question_option"],
            },
        ],
    });

    if (!quiz) return res.status(404).json({error: "퀴즈 없음"});
    res.json(quiz);
});

// 3. 퀴즈 응답 제출 (정답 판별 + 저장)
router.post("/:id/submit", async (req, res) => {
    const { users_id, quizOption_id } = req.body;

    // 중복 응시 체크 먼저
    const alreadySubmitted = await UsersQuiz.findOne({
        where: {
            users_id,
            quizzes_id: req.params.id,
        },
    });

    if (alreadySubmitted) {
        return res.status(409).json({
            error: "이미 응시한 퀴즈입니다.",
            attempt_id: alreadySubmitted.id,
        });
    }

    // 퀴즈 + 선택지 유효성 확인
    const quiz = await Quiz.findByPk(req.params.id, {
        include: [{model: QuizOption}],
    });

    if (!quiz) return res.status(404).json({error: "퀴즈 없음"});

    const selectedOption = await QuizOption.findByPk(quizOption_id);
    if (!selectedOption || selectedOption.quizzes_id != quiz.id) {
        return res.status(400).json({error: "선택지 오류"});
    }

    // 정답 판단 및 포인트 계산
    const isCorrect = selectedOption.answer === 1;
    const point = isCorrect ? quiz.point_reward : 0;

    // 결과 저장
    const result = await UsersQuiz.create({
        users_id,               // 유저 ID
        quizzes_id: quiz.id,    // 퀴즈 ID
        quizOption_id,          // 선택한 보기 ID
        is_correct: isCorrect,  // 정답 여부 (true / false)
        point_earned: point,    // 맞으면 포인트, 틀리면 0
    });

    res.json({
        message: "퀴즈 결과 저장 완료",
        is_correct: isCorrect,
        point_earned: point,
        result_id: result.id,
    });
});

module.exports = router;