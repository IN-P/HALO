// 관리자가 보는 퀴즈 리스트
import React, { useEffect } from 'react';
import { Button } from 'antd';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_QUIZZES_REQUEST } from '../../../reducers/quiz_GM';
import AppLayout from '../../../components/AppLayout';
import RouletteSidebar from '../../../components/EventAdminSidebar';

const AdminQuizListPage = () => {
    const dispatch = useDispatch();
    const { quizList } = useSelector((state) => state.quiz);
    console.log(quizList);
    useEffect(() => {
        dispatch({type: LOAD_QUIZZES_REQUEST});
    }, [dispatch]);

    // 스타일 정의
    const thStyle = {
        padding: "10px",
        textAlign: "left",
        borderBottom: "2px solid #ccc",
        backgroundColor: "#f5f5f5"
    };

    const tdStyle = {
        padding: "10px",
        verticalAlign: "top"
    };

    return (
        <div style={{ display: 'flex' }}>
            {/* 🎯 사이드바 */}
            <div style={{ width: 220 }}>
                <RouletteSidebar />
            </div>
            <div>
                <AppLayout>
                    <div style={{ padding: "2rem" }}>
                        <h2>📋 등록된 퀴즈 목록(관리자 페이지)</h2>
                        <Link href={'/admin/quiz/register'}><Button>퀴즈 등록하기</Button></Link>
                        {quizList && (
                            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                                <thead>
                                    <tr>
                                        <th style={thStyle}>NO</th>
                                        <th style={thStyle}>문제</th>
                                        <th style={thStyle}>포인트</th>
                                        <th style={thStyle}>생성일</th>
                                        <th style={thStyle} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizList.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                                            <td style={tdStyle}><strong>{item.id}</strong></td>
                                            <td style={tdStyle}>{item.question}</td>
                                            <td style={tdStyle}>{item.point_reward}</td>
                                            <td style={tdStyle}>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td style={tdStyle}>
                                                <Link href={`/admin/quiz/${item.id}`} legacyBehavior>
                                                    <a><Button type="link">수정</Button></a>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </AppLayout>
        </div>
        </div>
    );
};

export default AdminQuizListPage;