import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd';
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
        <div style={{padding: '2rem'}}>
            <h2>🎲 전체 퀴즈 목록</h2>
            {quizList && (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>NO</th>
                            <th style={thStyle}>문제</th>
                            <th style={thStyle}>포인트</th>
                            <th style={thStyle} />
                        </tr>
                    </thead>
                    <tbody>
                        {quizList.map((item) => (
                            <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={tdStyle}><strong>{item.id}</strong></td>
                                <td style={tdStyle}>{item.question}</td>
                                <td style={tdStyle}>{item.point_reward}</td>
                                <td style={tdStyle}>
                                    <Link href={`/event/quizzes/${item.id}`} legacyBehavior>
                                        <a><Button type="link">도전하기</Button></a>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default EventPage;