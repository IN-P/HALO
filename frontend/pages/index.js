import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import PostCard from '../components/PostCard';
import { useSelector } from 'react-redux'; // 윤기 추가
import { useRouter } from 'next/router';   // 윤기 추가
import { useEffect } from 'react';         // 윤기 추가

const dummyPosts = [
  { id: 1, title: '첫 번째 게시물', content: '내용입니다.' },
  { id: 2, title: '두 번째 게시물', content: '또 다른 내용입니다.' },
];

const Home = () => {
  const router = useRouter();                           // 윤기 추가
  const { isLogin } = useSelector((state) => state.user_y); // 윤기 추가

  useEffect(() => {
    if (!isLogin) {
      router.replace('/login');                         // 윤기 추가
    }
  }, [isLogin]);
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

          {/* 포스트 카드 리스트 */}
          {dummyPosts
            .filter((post) => post.title.includes(search) || post.content.includes(search))
            .map((post) => (
              <PostCard key={post.id} title={post.title} content={post.content} />
            ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
