import React from 'react';
import Sidebar from '../components/Sidebar';

const Home = () => {
  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 중앙 콘텐츠 */}
      <div style={{ marginLeft: 240, flex: 1, padding: 24, minHeight: '100vh', background: '#f8f8f8' }}>
        <div style={{ height: '100%', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center', paddingTop: 100 }}>
          메인 콘텐츠 영역 (준비 중)
        </div>
      </div>

      {/* 우측 사이드바 */}
      <div style={{ width: 260, borderLeft: '1px solid #eee', padding: 24, background: '#fff', minHeight: '100vh' }}>
        <div style={{ height: '100%', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center', paddingTop: 100 }}>
          우측 사이드바 영역 (준비 중)
        </div>
      </div>
    </div>
  );
};

export default Home;
