// components/QuizModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Radio, Button, message } from 'antd';
import axios from 'axios';

const QuizModal = ({ visible, onClose, quiz }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (quiz?.id) {
      axios.get(`/event/quizzes/${quiz.id}/options`)
        .then(res => setOptions(res.data))
        .catch(err => {
          console.error('퀴즈 보기 로딩 실패', err);
          message.error('퀴즈 보기를 불러오지 못했습니다.');
        });
    }
  }, [quiz]);

  const handleSubmit = async () => {
    if (!selectedOption) return message.warning("보기를 선택하세요!");

    try {
      const res = await axios.post(`/event/quizzes/${quiz.id}/submit`, {
        quizOption_id: selectedOption,
      });

      if (res.data.is_correct) {
        message.success(`정답! ${res.data.point_earned}P 적립됨`);
      } else {
        message.info("오답입니다 😢");
      }
      onClose();
    } catch (err) {
      console.error('제출 오류', err);
      message.error('퀴즈 제출 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal
      title={`퀴즈: ${quiz?.question}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800} // ✅ 너비 확장
      bodyStyle={{
        maxHeight: '70vh',
        overflowY: 'auto',
        padding: '24px',
      }}
    >
      <Radio.Group
        onChange={(e) => setSelectedOption(e.target.value)}
        value={selectedOption}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        {options.map(opt => (
          <Radio key={opt.id} value={opt.id}>{opt.question_option}</Radio>
        ))}
      </Radio.Group>
      <div style={{ marginTop: '1rem', textAlign: 'right' }}>
        <Button type="primary" onClick={handleSubmit}>제출</Button>
      </div>
    </Modal>
  );
};

export default QuizModal;
