import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Descriptions, Button, Tag, message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { SUSPEND_USER_REQUEST } from '../../../reducers/reportResult_YB';

const ReportDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const [report, setReport] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null); // 클릭한 버튼 표시용

  const loadReport = async () => {
    try {
      const res = await axios.get(`http://localhost:3065/report/${id}`, {
        withCredentials: true,
      });
      setReport(res.data);
    } catch (err) {
      console.error('신고 상세 조회 실패:', err);
    }
  };

  useEffect(() => {
    if (id) loadReport();
  }, [id]);

  // ✅ 정지 처리
  const handleSuspend = async (days) => {
    try {
      const res = await axios.get(
        `http://localhost:3065/log/reported-user/${report.target_type_id}/${report.target_id}`,
        { withCredentials: true }
      );
      const user_id = res.data.reportedUserId;

      if (!user_id) return message.error('신고 대상 유저 ID를 찾을 수 없습니다.');

      dispatch({
        type: SUSPEND_USER_REQUEST,
        data: {
          reportId: report.id,
          user_id,
          duration: days,
        },
      });

      setSelectedDuration(days);
      message.success(`${days}일 정지 요청이 전송되었습니다.`);

      // 🔄 정지 후 정보 다시 불러오기
      setTimeout(loadReport, 500); // 살짝 지연 후 로드
    } catch (err) {
      console.error('정지 요청 실패:', err);
      message.error('정지 요청 실패');
    }
  };

  // 신고 삭제
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
        <Descriptions.Item label="사유">{report.reason}</Descriptions.Item>
        <Descriptions.Item label="상태">
          <Tag color={report.status === '처리됨' ? 'green' : 'orange'}>
            {report.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="작성일">
          {dayjs(report.createdAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>

        {/* ✅ 실제 DB에서 가져온 정지 기간 */}
        {report.ReportResult && (
          <Descriptions.Item label="정지 기간">
            {dayjs(report.ReportResult.createdAt).format('YYYY-MM-DD HH:mm:ss')} ~{' '}
            {dayjs(report.ReportResult.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        )}
      </Descriptions>

      <div style={{ marginTop: 20 }}>
        <Popconfirm title="정말 삭제하시겠습니까?" onConfirm={handleDelete}>
          <Button danger>신고 삭제</Button>
        </Popconfirm>
        <Button onClick={() => router.back()} style={{ marginLeft: 10 }}>
          뒤로가기
        </Button>
      </div>

      <div style={{ marginTop: 30, display: 'flex', gap: '10px' }}>
        {[1, 7, 30].map((day) => (
          <Button
            key={day}
            danger
            type={selectedDuration === day ? 'primary' : 'default'}
            onClick={() => handleSuspend(day)}
          >
            {day}일 정지
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ReportDetailPage;
