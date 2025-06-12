// pages/roulette.jsx
import React from 'react';
import AppLayout from '../components/AppLayout';
import EventSidebar from '../components/EventSidebar';
import Roulette from '../components/Roulette';

const RoulettePage = () => {
  return (
    <AppLayout>
      <div style={{ display: 'flex' }}>
        {/*사이드바 */}
        <div style={{ width: 220 }}>
          <EventSidebar />
        </div>

        {/* 🎯 룰렛 본문 */}
        <div style={{ flex: 1, padding: '40px 20px' }}>
          <Roulette />
        </div>
      </div>
    </AppLayout>
  );
};

export default RoulettePage;
