import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { Table, Input, Button, Space, Tag, Typography } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { getRoleName } from '../../../utils/roleNames';

const { Title } = Typography;

const AdminUserPage = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user === null) return;
    if (user.role !== 1 && user.role !== 5) {
      alert('접근 권한이 없습니다.');
      router.push('/');
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error('유저 목록 불러오기 실패:', err.response?.data || err);
    }
  };

  useEffect(() => {
    if (user && (user.role === 1 || user.role === 5)) {
      fetchUsers();
    }
  }, [user]);

  const handleSearch = () => {
    if (!search.trim()) return;
    const filtered = users.filter((u) =>
      u.email.includes(search) || u.nickname.includes(search)
    );
    setUsers(filtered);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '이메일',
      dataIndex: 'email',
    },
    {
      title: '닉네임',
      dataIndex: 'nickname',
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      render: (text) => text?.slice(0, 10),
    },
    {
      title: '권한',
      dataIndex: 'role',
      render: (role) => <Tag color={role === 1 ? 'volcano' : 'geekblue'}>{getRoleName(role)}</Tag>,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
    },
    {
      title: '관리',
      render: (_, record) =>
        record.role === 1 ? (
          <span style={{ color: '#999' }}>수정 불가</span>
        ) : (
          <Space>
            <Link href={`/admin/users/${record.id}`}>
              <Button type="primary" size="small">상세</Button>
            </Link>
            <Button danger size="small">삭제</Button>
          </Space>
        ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: 40 }}>
      <Title level={3}><UserOutlined /> 사용자 목록</Title>

      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="닉네임 or 이메일 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          검색
        </Button>
      </Space>

      <Table
        dataSource={users}
        rowKey="id"
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminUserPage;
