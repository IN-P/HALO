import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_FEED_REQUEST } from '../reducers/feed_IN';
import PostCard from './PostCard';
import AdvertisementDetail from './AdvertisementDetail';
import axios from 'axios';

const AD_INDEX = 10; // 10번째에 광고 삽입

const MainFeed = ({ search }) => {
  const dispatch = useDispatch();
  const { mainFeeds, hasMoreFeeds, loadFeedsLoading } = useSelector(state => state.feed_IN);
  const [excludePostIds, setExcludePostIds] = useState([]);

  // 광고 목록 + 랜덤 광고ID 상태 추가
  const [adList, setAdList] = useState([]);
  const [randomAdId, setRandomAdId] = useState(null);

  useEffect(() => {
    dispatch({ type: LOAD_FEED_REQUEST });

    // 광고목록 불러와서 랜덤 광고ID 추출
    axios.get('http://localhost:3065/api/advertisement/active')
      .then(res => {
        setAdList(res.data);
        if (res.data.length > 0) {
          const idx = Math.floor(Math.random() * res.data.length);
          setRandomAdId(res.data[idx].id);
        }
      });
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

  if (!isPaidUser && filteredPosts.length >= AD_INDEX && randomAdId) {
    items = [
      ...filteredPosts.slice(0, AD_INDEX),
      { type: 'ad', adId: randomAdId },
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
