// pages/advertisements.js
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import Advertisement from '../components/advertisement';
import Link from 'next/link';

const AdvertisementsPage = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    // TODO: 백엔드 API로부터 광고 목록 불러오기
    // 현재는 더미 데이터
    setAds([
      {
        id: 1,
        title: '고구마 광고',
        image_url: '/images/goguma.jpg',
        target_url: 'https://sweetpotato.com',
        start_date: '2025-06-01',
        end_date: '2025-06-30',
        is_active: 1,
      },
      {
        id: 2,
        title: '감자 광고',
        image_url: '/images/gamja.jpg',
        target_url: 'https://potato.com',
        start_date: '2025-06-05',
        end_date: '2025-06-25',
        is_active: 0,
      },
    ]);
  }, []);

  return (
    <AppLayout>
      <div style={{ padding: '30px' }}>
        <h1>📢 광고 관리</h1>

        <div style={{ margin: '20px 0' }}>
          <Link href="/ads/create">
            <button style={{ padding: '10px 20px', background: '#c8102e', color: 'white', border: 'none', borderRadius: '4px' }}>
              광고 등록하기
            </button>
          </Link>
        </div>

        {ads.map((ad) => (
          <Advertisement key={ad.id} ad={ad} />
        ))}
      </div>
    </AppLayout>
  );
};

export default AdvertisementsPage;
