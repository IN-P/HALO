import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_POSTS_REQUEST } from '../reducers/post_IN';
import PostCard from './PostCard';

const MainFeed = () => {
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

  return (
    <>
      {mainPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      {!hasMorePosts && <div style={{textAlign:'center',color:'#bbb',margin:'20px'}}>모든 글을 다 불러왔습니다</div>}
    </>
  );
};

export default MainFeed;
