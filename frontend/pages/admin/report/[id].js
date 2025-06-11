// /pages/admin/report/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Descriptions, Button, Tag, message, Popconfirm } from 'antd';
import dayjs from 'dayjs';

const ReportDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [report, setReport] = useState(null);

  const loadReport = async () => {
    try {
      const res = await axios.get('http://localhost:3065/report', {
        withCredentials: true,
      });
      const found = res.data.find((r) => r.id === parseInt(id, 10));
      setReport(found);
    } catch (err) {
      console.error('신고 상세 조회 실패:', err);
    }
  };

  useEffect(() => {
    if (id) loadReport();
  }, [id]);

  const handleStatusChange = async () => {
    try {
      await axios.patch(
        `http://localhost:3065/report/${id}`,
        { status: '처리됨' },
        { withCredentials: true }
      );
      message.success('상태가 "처리됨"으로 변경되었습니다.');
      loadReport();
    } catch (err) {
      console.error('상태 변경 실패:', err);
      message.error('상태 변경 실패');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3065/report/${id}`, {
        withCredentials: true,
      });
      message.success('신고가 삭제되었습니다.');
      router.push('/admin/report/report');
    } catch (err) {
      console.error('삭제 실패:', err);
      message.error('삭제 실패');
    }
  };

  if (!report) return <p>로딩 중...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📌 신고 상세</h2>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="신고자">
          {report.User?.nickname}
        </Descriptions.Item>
        <Descriptions.Item label="신고 대상">
          {report.TargetType?.code} / ID {report.target_id}
        </Descriptions.Item>
        <Descriptions.Item label="사유">
          {report.reason}
        </Descriptions.Item>
        <Descriptions.Item label="상태">
          <Tag color={report.status === '처리됨' ? 'green' : 'orange'}>
            {report.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="작성일">
          {dayjs(report.createdAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 20 }}>
        {report.status !== '처리됨' && (
          <Button type="primary" onClick={handleStatusChange} style={{ marginRight: 10 }}>
            상태를 '처리됨'으로 변경
          </Button>
        )}
        <Popconfirm title="정말 삭제하시겠습니까?" onConfirm={handleDelete}>
          <Button danger>신고 삭제</Button>
        </Popconfirm>
        <Button onClick={() => router.back()} style={{ marginLeft: 10 }}>
          뒤로가기
        </Button>
      </div>
    </div>
  );
};

export default ReportDetailPage;
