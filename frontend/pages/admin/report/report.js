// /pages/admin/report/report.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Tag, Button } from 'antd';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

const ReportAdminPage = () => {
  const [reports, setReports] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get('http://localhost:3065/report', { withCredentials: true })
      .then(res => setReports(res.data))
      .catch(err => console.error('신고 목록 조회 실패:', err));
  }, []);

  const columns = [
    {
      title: '신고자',
      dataIndex: ['User', 'nickname'],
    },
    {
      title: '신고대상',
      render: (_, r) => `${r.TargetType?.code} / ID ${r.target_id}`,
    },
    {
      title: '사유',
      dataIndex: 'reason',
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (text) => <Tag color={text === '접수됨' ? 'orange' : 'green'}>{text}</Tag>,
    },
    {
      title: '작성일',
      dataIndex: 'createdAt',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '관리',
      render: (_, record) => (
        <Button onClick={() => router.push(`/admin/report/${record.id}`)}>상세보기</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 신고 목록</h2>
      <Table rowKey="id" dataSource={reports} columns={columns} />
    </div>
  );
};

export default ReportAdminPage;
