import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_POSTS_REQUEST } from '../reducers/post_IN';
import PostCard from './PostCard';

const MainFeed = ({ search }) => {
  const dispatch = useDispatch();
  const { mainPosts, hasMorePosts, loadPostsLoading } = useSelector(state => state.post_IN);

  useEffect(() => {
    dispatch({ type: LOAD_POSTS_REQUEST });
  }, [dispatch]);

  const onScroll = useCallback(() => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if (hasMorePosts && !loadPostsLoading) {
        const lastId = mainPosts[mainPosts.length - 1]?.id;
        dispatch({
          type: LOAD_POSTS_REQUEST,
          lastId,
        });
      }
    }
  }, [hasMorePosts, loadPostsLoading, mainPosts, dispatch]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // ====== [검색 필터] ======
  const filteredPosts = mainPosts.filter(post => {
    // 작성자명
    const nickname = post.User?.nickname || '';
    // 해시태그 (#검색어)
    let hashtagMatch = false;
    if (search.startsWith('#')) {
      const tag = search.slice(1).trim();
      const regex = new RegExp(`#${tag}(\\b|_)`, 'i');
      hashtagMatch = regex.test(post.content || '');
    }
    if (!search.trim()) return true;
    return (
      nickname.toLowerCase().includes(search.toLowerCase()) ||
      hashtagMatch
    );
  });

  return (
    <>
      {filteredPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {!hasMorePosts && <div style={{textAlign:'center',color:'#bbb',margin:'20px'}}>모든 글을 다 불러왔습니다</div>}
    </>
  );
};

export default MainFeed;
