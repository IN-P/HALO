// pages/admin/analytics/analytics.js

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Table, Typography, Row, Col, Card, message
} from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

const { Title } = Typography;

const Analytics = () => {
  const { user } = useSelector((state) => state.user_YG);
  const router = useRouter();

  const [topUsers, setTopUsers] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 1 && user.role !== 11) {
      message.warning('분석 관리자 또는 마스터만 접근 가능합니다.');
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    axios.get('/admin/analytics/top-liked-users')
      .then((res) => setTopUsers(res.data))
      .catch((err) => console.error('top-liked-users 에러', err));

    axios.get('/admin/analytics/top-retweeted-posts')
      .then((res) => setTopPosts(res.data))
      .catch((err) => console.error('top-retweeted-posts 에러', err));
  }, []);

  return (
    <div style={{ padding: '40px 60px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: 32 }}>📊 분석 관리자 대시보드</Title>

      {/* 좋아요 유저 섹션 */}
      <Row gutter={24} align="top" style={{ marginBottom: 48 }}>
        <Col span={12}>
          <Card
            title="🔥 좋아요 Top 유저"
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <Table
              rowKey="id"
              dataSource={topUsers}
              pagination={false}
              columns={[
                { title: '닉네임', dataIndex: 'nickname' },
                { title: '좋아요 수', dataIndex: 'likeCount' },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="🔥 좋아요 차트"
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topUsers} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <XAxis dataKey="nickname" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="likeCount" fill="#FF7043">
                  <LabelList dataKey="likeCount" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 리트윗 게시글 섹션 */}
      <Row gutter={24} align="top">
        <Col span={12}>
          <Card
            title="🔁 리트윗 Top 게시글"
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <Table
              rowKey="id"
              dataSource={topPosts}
              pagination={false}
              columns={[
                { title: '내용', dataIndex: 'content' },
                { title: '리트윗 수', dataIndex: 'retweetCount' },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title="🔁 리트윗 차트"
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPosts} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="retweetCount" fill="#42A5F5">
                  <LabelList dataKey="retweetCount" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
