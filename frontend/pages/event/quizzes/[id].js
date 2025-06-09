import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Button, Card, message } from 'antd';

const QuizDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        if (!router.isReady) return

        const fetchQuiz = async () => {
            try {
                const res = await axios.get(`/event/quizzes/${id}`);
                setQuiz(res.data);
            } catch (err) {
                message.error("퀴즈를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }

        fetchQuiz();
    }, [id]);

    const submitAnswer = async () => {
        try {
            const res = await axios.post(`/event/quizzes/${id}/submit`, {
                users_id: 1,  // 테스트용 user ID
                quizOption_id: selectedOption,
            })
            message.success(res.data.is_correct ? "정답입니다!" : "오답입니다.");
        } catch (err) {
            message.error("제출 실패");
        }
    }

    if (loading) return <p>로딩 중...</p>
    if (!quiz) return <p>퀴즈를 찾을 수 없습니다.</p>

    return (
        <div style={{padding: 20}}>
            <Card title={quiz.question}>
                {quiz.QuizOptions.map((opt) => (
                    <Button
                        key={opt.id}
                        type={selectedOption === opt.id ? "primary" : "default"}
                        onClick={() => setSelectedOption(opt.id)}
                        style={{display: "block", marginBottom: 8}}
                    >
                        {opt.question_option}
                    </Button>
                ))}
                <Button
                    type="primary"
                    onClick={submitAnswer}
                    disabled={selectedOption === null}
                >
                    제출하기
                </Button>
            </Card>
        </div>
    )
}

export default QuizDetailPage;