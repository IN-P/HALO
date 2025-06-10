import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MessageOutlined,
  LockOutlined,
  BellOutlined,
  NotificationOutlined,
  GiftOutlined,
  AppstoreOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const { Sider } = Layout;

const AdminSidebar = () => {
  const { user } = useSelector((state) => state.user_YG);
  const router = useRouter();

  const onLogout = () => {
    router.push('/logout');
  };

  if (!user || user.role < 1 || user.role > 10) {
    return null; // 비관리자는 접근 불가
  }

  const selectedKey = router.pathname.split('/')[2];

  const renderMenuItems = () => {
    const items = [];

    // ✅ 공통 메뉴
    items.push(
      <Menu.Item key="home" icon={<DashboardOutlined />}>
        <Link href="/">홈으로</Link>
      </Menu.Item>
    );

    // ✅ 관리자별 메뉴
    switch (user.role) {
      case 1: // 마스터
        items.push(
          <Menu.Item key="users" icon={<UserOutlined />}>
            <Link href="/admin/users">사용자 관리</Link>
          </Menu.Item>,
          <Menu.Item key="ads" icon={<AppstoreOutlined />}>
            <Link href="/admin/ads">광고 관리</Link>
          </Menu.Item>,
          <Menu.Item key="reports" icon={<BellOutlined />}>
            <Link href="/admin/reports">신고 관리</Link>
          </Menu.Item>,
          <Menu.Item key="inquiries" icon={<MessageOutlined />}>
            <Link href="/admin/inquiry/inquiry">문의 관리</Link>
          </Menu.Item>,
          <Menu.Item key="security" icon={<LockOutlined />}>
            <Link href="/admin/security">보안 설정</Link>
          </Menu.Item>,
          <Menu.Item key="achievements" icon={<GiftOutlined />}>
            <Link href="/admin/achievements">업적 관리</Link>
          </Menu.Item>,
          <Menu.Item key="chat" icon={<CommentOutlined />}>
            <Link href="/admin/chat">채팅 관리</Link>
          </Menu.Item>,
          <Menu.Item key="posts" icon={<NotificationOutlined />}>
            <Link href="/admin/posts">게시글 관리</Link>
          </Menu.Item>
        );
        break;

      case 2: // 광고 관리자
        items.push(
          <Menu.Item key="ads" icon={<AppstoreOutlined />}>
            <Link href="/admin/ads">광고 관리</Link>
          </Menu.Item>
        );
        break;

      case 3: // 신고 관리자
        items.push(
          <Menu.Item key="reports" icon={<BellOutlined />}>
            <Link href="/admin/reports">신고 관리</Link>
          </Menu.Item>
        );
        break;

      case 4: // 문의 관리자
        items.push(
          <Menu.Item key="inquiries" icon={<MessageOutlined />}>
            <Link href="/admin/inquiry/inquiry">문의 관리</Link>
          </Menu.Item>
        );
        break;

      case 5: // 유저 관리자
        items.push(
          <Menu.Item key="users" icon={<UserOutlined />}>
            <Link href="/admin/users">사용자 관리</Link>
          </Menu.Item>
        );
        break;

      case 6: // 보안 관리자
        items.push(
          <Menu.Item key="security" icon={<LockOutlined />}>
            <Link href="/admin/security">보안 설정</Link>
          </Menu.Item>
        );
        break;

      case 7: // 커스텀 관리자
        items.push(
          <Menu.Item key="custom" icon={<AppstoreOutlined />}>
            <Link href="/admin/custom">커스텀 관리</Link>
          </Menu.Item>
        );
        break;

      case 8: // 업적 관리자
        items.push(
          <Menu.Item key="achievements" icon={<GiftOutlined />}>
            <Link href="/admin/achievements">업적 관리</Link>
          </Menu.Item>
        );
        break;

      case 9: // 채팅 관리자
        items.push(
          <Menu.Item key="chat" icon={<CommentOutlined />}>
            <Link href="/admin/chat">채팅 관리</Link>
          </Menu.Item>
        );
        break;

      case 10: // 포스트 관리자
        items.push(
          <Menu.Item key="posts" icon={<NotificationOutlined />}>
            <Link href="/admin/posts">게시글 관리</Link>
          </Menu.Item>
        );
        break;

      default:
        break;
    }

    // ✅ 로그아웃
    items.push(
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        로그아웃
      </Menu.Item>
    );

    return items;
  };

  return (
    <Sider
      width={200}
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        background: '#fff',
        borderRight: '1px solid #eee',
      }}
    >
      <div style={{ padding: 16, fontWeight: 'bold', fontSize: 20 }}>
        관리자
      </div>
      <Menu mode="inline" selectedKeys={[selectedKey]} style={{ height: '100%' }}>
        {renderMenuItems()}
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;
