import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'; // 추가!
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import socket from '../socket';

const AppLayout = ({ children }) => {

  const me = useSelector((state) => state.chat.me); // 추가!

  useEffect(() => {
    if (me && me.id) {
      socket.emit('login', me.id);
      console.log(`🔑 login 이벤트 보냄 → userId=${me.id}`);
    }
  }, [me]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log('📩 AppLayout에서 받은 메시지:', data);
      // 여기서 dispatch 해도 되고 → 아니면 전역 상태 업데이트 가능
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 고정 사이드바 */}
      <Sidebar />
      {/* 메인 콘텐츠 */}
      <div style={{ marginLeft: 240, flex: 1, padding: 24, minHeight: '100vh', background: '#ffffff' }}>
        {children}
      </div>
      {/* 우측 사이드바 */}
      <RightSidebar />
    </div>
  );
};

export default AppLayout;
