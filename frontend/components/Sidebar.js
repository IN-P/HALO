import React from 'react';
import { Button, Input } from 'antd';
import {
  HomeOutlined,
  EditOutlined,
  BellOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
} from '@ant-design/icons';

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
          <img src="/logo.png" alt="Halo" style={{ height: 40 }} /><br />
          <strong style={{ fontSize: 20 }}>HaLo</strong>
          <div style={{ fontSize: 12, color: '#999' }}>Halo98@abc.com</div>
        </div>

        <Input.Search placeholder="Search..." style={{ marginBottom: 20 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button icon={<HomeOutlined />} block type="text">홈</Button>
          <Button icon={<EditOutlined />} block type="text">게시물 작성</Button>
          <Button icon={<BellOutlined />} block type="text">알림</Button>
          <Button icon={<MessageOutlined />} block type="text">채팅 (DM)</Button>
          <Button icon={<SettingOutlined />} block type="text">관리자 문의</Button>
        </div>
      </div>

      {/* 중간 유동 공간 */}
      <div style={{ flex: 1 }} />

      {/* 하단 버튼 */}
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button icon={<LogoutOutlined />} block type="text">Logout</Button>
        <Button icon={<BulbOutlined />} block type="text">Light mode</Button>
      </div>
    </div>
  );
};

export default Sidebar;