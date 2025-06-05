import React from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

const AppLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 고정 사이드바 */}
      <Sidebar />
      {/* 메인 콘텐츠 */}
      <div style={{ marginLeft: 240, flex: 1, padding:24, minHeight: '100vh', background: '#ffffff' }} id='mainContents'>
        {children}
      </div>
      {/* 우측 사이드바 자리 (디자인만 잡아둠) */}
          <RightSidebar />
      </div>
    
  );
};

export default AppLayout;
