// components/MainFeed.js (실전형, 광고 삽입 로직 포함)
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_FEED_REQUEST } from '../reducers/feed_IN';
import PostCard from './PostCard';
import AdvertisementDetail from './AdvertisementDetail';

const AD_INDEX = 10; // 10번째에 광고 삽입
const AD_ID = 1;     // 임시 광고ID(실제 서비스에선 서버에서 전달받거나 API로 따로 받음)

const MainFeed = ({ search }) => {
  const dispatch = useDispatch();
  const { mainFeeds, hasMoreFeeds, loadFeedsLoading } = useSelector(state => state.feed_IN);
  const [adLoaded, setAdLoaded] = useState(false);
  const [excludePostIds, setExcludePostIds] = useState([]);

  useEffect(() => {
    dispatch({ type: LOAD_FEED_REQUEST });
  }, [dispatch]);

  const onScroll = useCallback(() => {
    if (window.scrollY + document.documentElement.clientHeight > document.documentElement.scrollHeight - 300) {
      if (hasMoreFeeds && !loadFeedsLoading) {
        const newExclude = mainFeeds.map(p => p.id);
        setExcludePostIds(newExclude);
        dispatch({
          type: LOAD_FEED_REQUEST,
          excludePostIds: newExclude,
        });
      }
    }
  }, [hasMoreFeeds, loadFeedsLoading, mainFeeds, dispatch]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // ====== [검색 필터] ======
  const filteredPosts = mainFeeds.filter(post => {
    const basePost = post.regram_id && post.Regram ? post.Regram : post;
    const nickname = post.User?.nickname || '';
    let hashtagMatch = false;
    if (search.startsWith('#')) {
      const tag = search.slice(1).trim().toLowerCase();
      hashtagMatch = basePost.Hashtags?.some(h => h.name.toLowerCase() === tag);
    }
    if (!search.trim()) return true;
    return (
      nickname.toLowerCase().includes(search.toLowerCase()) ||
      hashtagMatch
    );
  });

  // ====== [광고 아이템 삽입] ======
  const isPaidUser = false;
  let items = filteredPosts;

  if (!isPaidUser && filteredPosts.length >= AD_INDEX) {
    items = [
      ...filteredPosts.slice(0, AD_INDEX),
      { type: 'ad', adId: AD_ID },
      ...filteredPosts.slice(AD_INDEX)
    ];
  }

  return (
    <>
      {items.map((item, idx) =>
        item.type === 'ad'
          ? <AdvertisementDetail key={`ad-${item.adId}-${idx}`} adId={item.adId} />
          : <PostCard key={item.id} post={item} />
      )}
      {!hasMoreFeeds && <div style={{ textAlign: 'center', color: '#bbb', margin: '20px' }}>모든 글을 다 불러왔습니다</div>}
    </>
  );
};

export default MainFeed;