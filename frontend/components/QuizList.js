import React, { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd';
import { LOAD_QUIZZES_REQUEST } from '../reducers/quiz_GM';
import QuizModal from './QuizModal';

const EventPage = () => {
  const dispatch = useDispatch();
  const { quizList } = useSelector((state) => state.quiz);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    dispatch({ type: LOAD_QUIZZES_REQUEST });

    // ✅ 로컬스토리지에서 푼 퀴즈 ID 목록 불러오기
    const stored = JSON.parse(localStorage.getItem('solvedQuizIds') || '[]');
    setSolvedIds(stored);
  }, [dispatch]);

  const openModal = (quiz) => setSelectedQuiz(quiz);
  const closeModal = () => setSelectedQuiz(null);

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
    <div style={{ padding: '2rem' }}>
      <h2>🎲 전체 퀴즈 목록</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th style={thStyle}>NO</th>
            <th style={thStyle}>문제</th>
            <th style={thStyle}>포인트</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {quizList?.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={tdStyle}><strong>{item.id}</strong></td>
              <td style={tdStyle}>{item.question}</td>
              <td style={tdStyle}>{item.point_reward}</td>
              <td style={tdStyle}>
                {!solvedIds.includes(item.id) ? (
                  <Button type="link" onClick={() => openModal(item)}>도전하기</Button>
                ) : (
                  <span style={{ color: '#999' }}>도전 완료</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedQuiz && (
        <QuizModal visible={true} quiz={selectedQuiz} onClose={closeModal} />
      )}
    </div>
  );
};

export default EventPage;
