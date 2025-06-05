import React, { useState, useEffect } from 'react'; //## 윤기추가 useEffect 여따가 박음
import AppLayout from '../components/AppLayout';
import MainFeed from '../components/MainFeed';
import PostCard from '../components/PostCard';
import { useSelector } from 'react-redux'; // 윤기 추가
import { useRouter } from 'next/router';   // 윤기 추가

const dummyPosts = [
  { id: 1, title: '첫 번째 게시물', content: '내용입니다.' },
  { id: 2, title: '두 번째 게시물', content: '또 다른 내용입니다.' },
];

const Home = () => {
  const router = useRouter();                                 // 윤기 추가
  const { isLogin, loadMyInfoLoading } = useSelector((state) => state.user_YG); // 윤기 수정 (리듀서 이름 변경)

  useEffect(() => {
    if (!loadMyInfoLoading && !isLogin) {                     // 윤기 수정 : 세션 상태 확인 후 리다이렉트
      router.replace('/login');                               // 윤기 추가
    }
  }, [isLogin, loadMyInfoLoading]);                           // 윤기 수정

  const [search, setSearch] = useState('');

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '60%' }}>
          {/* 검색 바 */}
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '60%',
              padding: '12px 16px',
              fontSize: 16,
              border: '1px solid #ccc',
              borderRadius: 8,
              marginBottom: 20,
            }}
          />

          <MainFeed search={search} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
