// 유저가 푸는 퀴즈 페이지 (테이블로 목록, 퀴즈 제목 누르면 상세로 이동)
import React, { use, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { LOAD_QUIZZES_REQUEST } from '../reducers/quiz_GM';
import QuizList from '../components/QuizList';
import AppLayout from '../components/AppLayout';
import EventSidebar from '../components/EventSidebar';

const QuizPage = () => {
    const dispatch = useDispatch();
    const { quizList = [] } = useSelector((state) => state.quiz ?? {});

    const quizState = useSelector((state) => state.quiz);
    console.log("🔥 state.quiz 전체 상태: ", quizState);

    useEffect(() => {
        dispatch({
            type: LOAD_QUIZZES_REQUEST
        });
    }, [dispatch]);

    useEffect(() => {
        console.log('🧾 퀴즈 목록: ', quizList);
        console.log('🧪 첫 퀴즈 구조: ', quizList[0]);
    }, [quizList]);

    useEffect(() => {
        console.log("🧾 퀴즈 목록 타입: ", typeof quizList);
        console.log("🧾 퀴즈 목록: ", quizList);
        if (Array.isArray(quizList)) {
            quizList.forEach(q => console.log('퀴즈 항목: ', q));
        }
    }, [quizList]);

    const columns = [
        {
            title: '퀴즈 제목',
            dataIndex: 'question',
            key: 'question'
        },
        {
            render: (record) => (
                <Link href={`/event/quizzes/${record.id}`}>풀기</Link>
            )
        }
    ];

    return (
        <AppLayout>
            <div style={{ display: 'flex' }}>
                {/* 🟦 이벤트 사이드바 */}
                <div style={{ width: 220 }}>
                    <EventSidebar />
                </div>

                {/* 🟧 본문 퀴즈 목록 */}
                <div style={{ flex: 1, padding: '20px' }}>
                    <QuizList />
                </div>
            </div>
        </AppLayout>
    );
};

export default QuizPage;