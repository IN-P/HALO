import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button,Switch } from 'antd';
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
import styled from 'styled-components'; // 준혁 추가

// 준혁추가 :알람 뱃지
const NotificationCount = styled.span`
  display: inline-block;
  min-width: 24px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: #f5222d;  
  border-radius: 12px;
  text-align: center;
  user-select: none;
  margin-left: 12px;  /* 여기서 간격 조절 */
`;
//
const ImportantNotificationCount = styled.span`
  display: inline-block;
  min-width: 24px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: #f5222d;  
  border-radius: 12px;
  text-align: center;
  user-select: none;
  margin-left: 12px;  /* 여기서 간격 조절 */
`

// 재사용 가능한 버튼 컴포넌트

const SidebarButton = ({ icon, children, onClick }) => {
  return (
    <Button
      className="sidebar-btn"
      icon={icon}
      block
      type="text"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '12px 12px',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
        border: 'none',
        borderRadius: '6px',
        color: 'inherit',
        textAlign: 'left',
      }}
    >
      <span style={{ marginLeft: 8 }}>{children}</span>
    </Button>
  );
};


// 준혁 추가 : 알림창 토글 상태 showNotification, onToggleNotification, notificationCount
const Sidebar = ({ showNotification, onToggleNotification, notificationCount, themeMode, onToggleTheme, importantCount }) => {
  const router = useRouter();
  const dispatch = useDispatch(); //  윤기 추가: 로그아웃 디스패치

  return (
    <div 
    className="custom-sidebar"
    style={{
      width: 240,
      height: '100vh',
      //background: '#fff',
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
          <Link href="/new_post" passHref>
            <SidebarButton icon={<EditOutlined />}>게시물 작성</SidebarButton>
          </Link>
          {/* 준혁 추가 : 알림창 토글 onClick={onToggleNotification} active={showNotification} */}
          <SidebarButton
            icon={<BellOutlined />}
            onClick={onToggleNotification}
            warning={importantCount > 0} // 여기 추가!
          >
            알림
            {notificationCount > 0 && (
              <NotificationCount>
                {notificationCount > 99 ? '99+' : notificationCount}
              </NotificationCount>
            )}
            {importantCount > 0 && (
              <ImportantNotificationCount>
                {importantCount > 99 ? '99+' : importantCount} !
              </ImportantNotificationCount>
            )}
          </SidebarButton>         
          <Link href="/chat" passHref>
            <SidebarButton icon={<MessageOutlined />}>채팅 (DM)</SidebarButton>
          </Link>
          <Link href="/store" passHref>
            <SidebarButton icon={<ShopOutlined />}>상점</SidebarButton>
          </Link>
          <Link href="/quiz" passHref>
            <SidebarButton icon={<GiftOutlined />}>이벤트</SidebarButton>
          </Link>
          <Link href="/inquiry/inquiry" passHref>
          <SidebarButton icon={<ShopOutlined />}>문의</SidebarButton>
          </Link>
          <Link href="/membership" passHref>
            <SidebarButton icon={<AppstoreOutlined />}>멤버십</SidebarButton>
          </Link>
          <Link href="/charge" passHref>
            <SidebarButton icon={<GiftOutlined />}>캐시 충전</SidebarButton>
          </Link>
        </div>
      </div>

      {/* 중간 유동 공간 */}
      <div style={{ flex: 1 }} />

      {/* 하단 버튼 */}
      <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SidebarButton icon={<LogoutOutlined />} onClick={() => dispatch({ type: LOG_OUT_REQUEST })}>Logout</SidebarButton>
        <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 12px',
  borderRadius: '6px',
}}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <BulbOutlined />
    <span style={{ marginLeft: 8 }}>{themeMode === 'light' ? 'Light' : 'Dark'}</span>
    </div>
    <Switch
    checked={themeMode === 'dark'}
    onChange={onToggleTheme} // Switch 자체에 onChange 달기
    />
    </div>
  </div>
</div>
  );
};

export default Sidebar;
