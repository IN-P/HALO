import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Button, Input, message } from 'antd';
import AppLayout from '../../components/AppLayout';
import axios from 'axios';

const InquiryDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [inquiry, setInquiry] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedMessage, setEditedMessage] = useState('');

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchInquiry = async () => {
      try {
        const res = await axios.get(`http://localhost:3065/inquiry/${id}`, {
          withCredentials: true,
        });
        setInquiry(res.data);
        setEditedTitle(res.data.title);
        setEditedMessage(res.data.message);
      } catch (err) {
        console.error(err);
        message.error('문의 정보를 불러오지 못했습니다.');
      }
    };

    fetchInquiry();
  }, [router.isReady, id]);

  const handleSave = async () => {
    if (inquiry.answer) {
      message.warning('답변이 등록된 문의는 수정할 수 없습니다.');
      setEditMode(false);
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:3065/inquiry/${id}`,
        { title: editedTitle, message: editedMessage },
        { withCredentials: true }
      );
      setInquiry(res.data);
      setEditMode(false);
      message.success('문의가 수정되었습니다.');
    } catch (err) {
      console.error(err);
      message.error('수정 실패');
    }
  };


  if (!inquiry) return null;

  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: '40px auto' }}>
        <Card
          title={
            editMode ? (
              <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
            ) : (
              inquiry.title
            )
          }
          extra={
            !editMode && !inquiry.answer ? ( // 답변 없을 때만 수정 버튼 표시
              <Button type="link" onClick={() => setEditMode(true)}>
                수정
              </Button>
            ) : editMode ? (
              <Button
                type="primary"
                onClick={handleSave}
                disabled={!!inquiry.answer} // 답변이 있으면 저장 버튼 비활성화
              >
                저장
              </Button>
            ) : null
          }
        >

          <p>
            <strong>작성일:</strong> {new Date(inquiry.createdAt).toLocaleString()}
          </p>
          <p><strong>문의 내용:</strong></p>
          {editMode ? (
            <Input.TextArea
              rows={6}
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
            />
          ) : (
            <p>{inquiry.message}</p>
          )}

          {inquiry.answer && (
            <>
              <hr />
              <p><strong>답변:</strong></p>
              <p>{inquiry.answer}</p>
            </>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

// ✅ 이 줄이 꼭 있어야 한다!!
export default InquiryDetailPage;
