import React, { useState } from 'react';
import axios from 'axios';
import PostDetailModal from '../../components/PostDetailModal';
import AppLayout from '../../components/AppLayout'; // 레이아웃 사용한다면 import

// SSR로 데이터 미리 불러오기 (비회원도 접근 가능하게)
export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const res = await axios.get(`http://localhost:3065/post/${id}`, {
      headers: context.req ? { cookie: context.req.headers.cookie || '' } : undefined,
      withCredentials: true,
    });
    return { props: { post: res.data } };
  } catch (err) {
    return { props: { post: null, error: err.response?.data || '에러' } };
  }
}

export default function PostModalPage({ post, error }) {
  const [show, setShow] = useState(true);

  if (error) {
    return (
      <AppLayout>
        <div style={{
          width: 400, margin: '120px auto', background: '#fff',
          borderRadius: 16, padding: 36, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.11)'
        }}>
          <h2>😢</h2>
          <div style={{ fontSize: 19, marginBottom: 18 }}>{error}</div>
          <a href="/" style={{
            color: '#007bff', fontWeight: 500, textDecoration: 'underline', fontSize: 16
          }}>메인으로 가기</a>
        </div>
      </AppLayout>
    );
  }

  if (!post) return null;

  // 닫기 시 메인으로 리다이렉트(원하는 곳으로)
  const handleClose = () => {
    setShow(false);
    window.location.href = '/';
  };

  // 실무에서는 user prop도 필요하면 App에서 내려주면 됨
  return (
    <AppLayout>
      <PostDetailModal
        post={post}
        basePost={post.regram_id && post.Regram ? post.Regram : post}
        origin={post.regram_id && post.Regram ? post.Regram : undefined}
        user={null}
        imageIndex={0}
        setImageIndex={() => {}}
        show={show}
        onClose={handleClose}
        liked={false}
        onLike={() => {}}
        onUnlike={() => {}}
        bookmarked={false}
        onBookmark={() => {}}
        onUnbookmark={() => {}}
        likeCount={post.Likers?.length || 0}
        regramCount={post.Regrams?.length || 0}
        bookmarkCount={post.Bookmarkers?.length || 0}
        commentCount={post.Comments?.length || 0}
        onRegram={() => {}}
        regramIconColor="#000"
        regramDisabled={false}
        regramTooltip=""
        showReportModal={false}
        setShowReportModal={() => {}}
      />
    </AppLayout>
  );
}
