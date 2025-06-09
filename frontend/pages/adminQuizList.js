// 관리자가 보는 퀴즈 리스트
import React, { useEffect } from 'react';
import { Table, Button, Tag } from 'antd';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_QUIZZES_REQUEST } from '../reducers/quiz_GM';
import AppLayout from '../components/AppLayout';

const AdminQuizListPage = () => {
    const dispatch = useDispatch();
    const { quizList } = useSelector((state) => state.quiz);

    useEffect(() => {
        dispatch({type: LOAD_QUIZZES_REQUEST});
    }, [dispatch]);

    const columns = [
        {
            title: "퀴즈 제목",
            dataIndex: "question",
            key: "question",
        },
        {
            title: "유형",
            dataIndex: "type",
            key: "type",
            render: (type) =>
                type === "multiple" ? <Tag color="blue">객관식</Tag> : <Tag color="green">OX</Tag>,
        },
        {
            title: "생성일",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleDateString(),
        },
        {
            title: "수정",
            key: "edit",
            render: (_, record) => (
                <Link href={`/adminQuiz/${record.id}`}>
                    <Button type="link">수정</Button>
                </Link>
            ),
        },
    ];

    return (
        <AppLayout>
            <div style={{padding: "2rem"}}>
                <h2>📋 등록된 퀴즈 목록</h2>
                <Table dataSource={quizList} columns={columns} rowKey="id" />
            </div>
        </AppLayout>
    );
};

export default AdminQuizListPage;