import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppLayout from '../../../components/AppLayout';

const AdminInquiryPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get('http://localhost:3065/inquiry', {
        withCredentials: true,
      });
       console.log('📦 문의 목록 응답:', res.data); 
      setInquiries(res.data);
    } catch (err) {
      console.error('문의 목록 불러오기 실패:', err);
    }
  };

  const handleSelect = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.answer || '');
    setIsEditing(false);
  };

  const handleAnswerSubmit = async () => {
    try {
      await axios.patch(
        `http://localhost:3065/inquiry/${selectedInquiry.id}/answer`,
        { answer },
        { withCredentials: true }
      );
      setIsEditing(false);
      fetchInquiries(); // 목록 갱신
    } catch (err) {
      console.error('답변 등록 실패:', err);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <AppLayout>
      <h1>문의 관리</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 문의 목록 */}
        <div style={{ width: '40%', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <h3>문의 목록</h3>
          <ul>
            {inquiries.map((inq) => (
              <li
                key={inq.id}
                style={{ cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => handleSelect(inq)}
              >
                <strong>{inq.title}</strong><br />
                <span>{inq.User?.nickname}</span><br />
                <span>{new Date(inq.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 문의 상세 */}
        <div style={{ width: '60%' }}>
          {selectedInquiry ? (
            <>
              <h3>{selectedInquiry.title}</h3>
              <p><strong>작성자:</strong> {selectedInquiry.User?.nickname}</p>
              <p><strong>내용:</strong> {selectedInquiry.message}</p>
              <p><strong>작성일:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}</p>

              <hr />

              <h4>답변</h4>
              {isEditing ? (
                <>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                    style={{ width: '100%' }}
                  />
                  <br />
                  <button onClick={handleAnswerSubmit}>저장</button>
                  <button onClick={() => setIsEditing(false)}>취소</button>
                </>
              ) : (
                <>
                  <p>{answer || '아직 답변이 없습니다.'}</p>
                  <button onClick={() => setIsEditing(true)}>
                    {answer ? '답변 수정' : '답변 작성'}
                  </button>
                </>
              )}
            </>
          ) : (
            <p>왼쪽에서 문의를 선택하세요.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminInquiryPage;
