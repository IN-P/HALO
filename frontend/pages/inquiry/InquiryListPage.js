import React, { useEffect, useState } from 'react';
import { List, Typography, message } from 'antd';
import { useRouter } from 'next/router';
import AppLayout from '../../components/AppLayout';
import axios from 'axios';

const InquiryListPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await axios.get('http://localhost:3065/inquiry/my', {
          withCredentials: true,
        });
        setInquiries(res.data);
      } catch (err) {
        console.error(err);
        message.error('문의 목록을 불러오지 못했습니다.');
      }
    };
    fetchInquiries();
  }, []);

  return (
    <AppLayout>
      <div style={{ maxWidth: 800, margin: '40px auto' }}>
        <h2>내 문의 목록</h2>
        <List
          bordered
          dataSource={inquiries}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => router.push(`/inquiry/${item.id}`)}
            >
              <div style={{ flex: 1 }}>
                <Typography.Text strong>{item.title}</Typography.Text>
              </div>
              <div>{new Date(item.createdAt).toLocaleDateString()}</div>
            </List.Item>
          )}
        />
      </div>
    </AppLayout>
  );
};

export default InquiryListPage;
