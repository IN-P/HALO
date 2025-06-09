import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button } from 'antd';
import Link from 'next/link';
import { LOAD_QUIZZES_REQUEST } from '../reducers/quiz_GM';

const EventPage = () => {
    const dispatch = useDispatch();
    const { quizList } = useSelector((state) => state.quiz);

    useEffect(() => {
        dispatch({
            type: LOAD_QUIZZES_REQUEST
        });
    }, [dispatch]);

    const columns = [
        {
            title: "퀴즈 제목",
            dataIndex: "question",
            key: "question"
        },
        {
            title: "응시",
            render: (text, record) => (
                <Link href={`/event/quizzes/${record.id}`}>도전하기</Link>
            ),
        },
    ];

    return (
        <div style={{padding: '2rem'}}>
            <h2>🎲 전체 퀴즈 목록</h2>
            <Link href="/adminQuiz" passHref>
                <Button>퀴즈 등록하기</Button>
            </Link>
            <Table
                dataSource={quizList}
                columns={columns}
                rowKey="id"
            ></Table>
        </div>
    );
};

export default EventPage;