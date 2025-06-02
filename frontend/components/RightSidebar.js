import React from 'react';

const RightSidebar = () => {
  return (
    <div style={{
      width: 260,
      borderLeft: '1px solid #eee',
      padding: 24,
      background: '#fff',
      minHeight: '100vh'
    }}>
      <div style={{
        marginBottom: 24,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        textAlign: 'center'
      }}>
        {/* 프로필 정보 틀 */}
        <strong>jaewon</strong>
        <div style={{ fontSize: 12, color: '#888' }}>@email</div>
      </div>

      <div style={{
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        textAlign: 'center'
      }}>
        {/* 날씨 위젯 틀 */}
        <div>🌤️ 서울 잠실</div>
        <div style={{ fontSize: 24, fontWeight: 'bold' }}>22°C</div>
      </div>
    </div>
  );
};

export default RightSidebar;
