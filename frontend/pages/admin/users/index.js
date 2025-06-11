import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Card,
  message,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { getRoleName } from '../../../utils/roleNames';
import { useSpring, animated } from '@react-spring/web';

const { Title } = Typography;
const { confirm } = Modal;

const getUserStatusLabel = (statusId) => {
  switch (statusId) {
    case 1:
      return '일반';
    case 2:
      return '탈퇴';
    case 3:
      return '휴면';
    case 4:
      return '정지';
    default:
      return '알수없음';
  }
};

const AdminUserPage = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.user_YG);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 200, friction: 20 },
    delay: 150,
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== 1 && user.role !== 5) {
      message.warning('접근 권한이 없습니다.');
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

  const confirmDelete = (id) => {
    confirm({
      title: '유저 삭제 방식 선택',
      icon: <ExclamationCircleOutlined />,
      content: '소프트 딜리트(탈퇴 처리) 또는 하드 딜리트(DB 완전 삭제)를 선택하세요.',
      okText: '소프트 딜리트',
      cancelText: '하드 딜리트',
      onOk: async () => {
        try {
          await axios.delete(`/api/admin/users/${id}`, { withCredentials: true });
          message.success('유저 소프트 딜리트 완료');
          fetchUsers();
        } catch (err) {
          message.error('소프트 딜리트 실패');
        }
      },
      onCancel: async () => {
        try {
          await axios.delete(`/api/admin/users/force/${id}`, { withCredentials: true });
          message.success('유저 하드 딜리트 완료');
          fetchUsers();
        } catch (err) {
          message.error('하드 딜리트 실패');
        }
      },
    });
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
      render: (role) => (
        <Tag color={role === 1 ? 'volcano' : 'geekblue'}>{getRoleName(role)}</Tag>
      ),
    },
    {
      title: '상태',
      dataIndex: 'user_status_id',
      render: (status) => {
        const label = getUserStatusLabel(status);
        const color = status === 2 ? 'red' : status === 3 ? 'orange' : status === 4 ? 'gold' : 'green';
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip',
    },
    {
      title: '관리',
      render: (_, record) => {
        if (record.role === 1) {
          return <span style={{ color: '#999' }}>수정 불가</span>;
        }
        if (record.user_status_id === 2) {
          return <span style={{ color: '#999' }}>탈퇴됨</span>;
        }
        return (
          <Space>
            <Link href={`/admin/users/${record.id}`}>
              <Button type="primary" size="small" icon={<EyeOutlined />}>상세</Button>
            </Link>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record.id)}
            >
              삭제
            </Button>
          </Space>
        );
      },
      width: 200,
    },
  ];

  return (
    <div style={{ padding: 40 }}>
      <animated.div style={fadeIn}>
        <Card bordered style={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}>
          <Title level={3}><UserOutlined /> 사용자 목록</Title>
          <Space style={{ marginBottom: 20 }}>
            <Input
              placeholder="닉네임 or 이메일 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 250 }}
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
        </Card>
      </animated.div>
    </div>
  );
};

export default AdminUserPage;
