import React, { useState } from 'react';
import { Button } from 'antd';
import {
  HomeOutlined,
  EditOutlined,
  BellOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
  AppstoreOutlined,
  ShopOutlined,
  GiftOutlined
} from '@ant-design/icons';

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
          <SidebarButton icon={<HomeOutlined />}>홈</SidebarButton>
          <SidebarButton icon={<AppstoreOutlined />}>메뉴</SidebarButton>
          <SidebarButton icon={<EditOutlined />}>게시물 작성</SidebarButton>
          <SidebarButton icon={<BellOutlined />}>알림</SidebarButton>
          <SidebarButton icon={<MessageOutlined />}>채팅 (DM)</SidebarButton>
          <SidebarButton icon={<ShopOutlined />}>상점</SidebarButton>
          <SidebarButton icon={<GiftOutlined />}>이벤트</SidebarButton>
        </div>
      </div>

      {/* 중간 유동 공간 */}
      <div style={{ flex: 1 }} />

      {/* 하단 버튼 */}
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SidebarButton icon={<LogoutOutlined />}>Logout</SidebarButton>
        <SidebarButton icon={<BulbOutlined />}>Light mode</SidebarButton>
      </div>
    </div>
  );
};

export default Sidebar;
