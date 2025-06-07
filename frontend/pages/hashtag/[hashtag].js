import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_HASHTAG_POSTS_REQUEST } from '../../reducers/hashtag_IN';
import PostCard from '../../components/PostCard';
import { useRouter } from 'next/router';

const HashtagPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { hashtag } = router.query;
  const { posts = [], loadHashtagPostsLoading = false } = useSelector(state => state.hashtag_IN || {});

  useEffect(() => {
    if (hashtag) {
      dispatch({ type: LOAD_HASHTAG_POSTS_REQUEST, data: hashtag });
    }
  }, [hashtag, dispatch]);

  if (loadHashtagPostsLoading) return <div>로딩중...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2>#{hashtag} 태그 게시글</h2>
      {posts.length === 0 ? <div>게시글 없음</div> : posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default HashtagPage;
