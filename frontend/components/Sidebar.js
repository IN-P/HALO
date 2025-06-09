import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'antd';
import Link from 'next/link';
import {
  HomeOutlined,
  EditOutlined,
  BellOutlined,
  MessageOutlined,
  LogoutOutlined,
  BulbOutlined,
  AppstoreOutlined,
  ShopOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux'; //  윤기 추가: 로그아웃 위해 dispatch 사용
import { LOG_OUT_REQUEST } from '../reducers/user_YG'; //  윤기 추가: 로그아웃 액션

// 재사용 가능한 버튼 컴포넌트
const SidebarButton = ({ icon, children, onClick }) => {
  const [hover, setHover] = useState(false);

  return (
    <Button
      icon={icon}
      block
      type="text"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '12px 12px',
        background: hover
          ? 'linear-gradient(90deg, #f0faff 0%, #d0eaff 100%)'
          : 'transparent',
        boxShadow: 'none',
        transition: 'background 0.3s ease',
        outline: 'none',
        border: 'none',
        borderRadius: '6px',
        color: '#333',
        textAlign: 'left',
      }}
    >
      <span style={{ marginLeft: 8 }}>{children}</span>
    </Button>
  );
};

const Sidebar = () => {
  const router = useRouter();
  const dispatch = useDispatch(); //  윤기 추가: 로그아웃 디스패치
  return (
    <div style={{
      width: 240,
      height: '100vh',
      background: '#fff',
      borderRight: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      {/* 상단 로고/검색/메뉴 */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/images/HALOlogo.png" alt="Halo" style={{ height: 40 }} /><br />
          <strong style={{ fontSize: 20 }}>HaLo</strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Link href="/" passHref>
            <SidebarButton icon={<HomeOutlined />}>홈</SidebarButton>
          </Link>
          <SidebarButton icon={<AppstoreOutlined />}>메뉴</SidebarButton>
          <Link href="/new_post" passHref>
            <SidebarButton icon={<EditOutlined />}>게시물 작성</SidebarButton>
          </Link>
          <SidebarButton icon={<BellOutlined />}>알림</SidebarButton>
          <Link href="/chat" passHref>
            <SidebarButton icon={<MessageOutlined />}>채팅 (DM)</SidebarButton>
          </Link>
          <SidebarButton icon={<ShopOutlined />}>상점</SidebarButton>
          <Link href="/quiz" passHref>
            <SidebarButton icon={<GiftOutlined />}>이벤트</SidebarButton>
          </Link>
          <Link href="/inquiry" passHref>
          <SidebarButton icon={<ShopOutlined />}>문의</SidebarButton>
          </Link>
        </div>
      </div>

      {/* 중간 유동 공간 */}
      <div style={{ flex: 1 }} />

      {/* 하단 버튼 */}
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SidebarButton icon={<LogoutOutlined />} onClick={() => dispatch({ type: LOG_OUT_REQUEST })}>Logout</SidebarButton>
        <SidebarButton icon={<BulbOutlined />}>Light mode</SidebarButton>
      </div>
    </div>
  );
};

export default Sidebar;
