import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_ACHIEVEMENT_REQUEST } from '../../reducers/achievement_JH';

const FILTERS = {
  ALL: '전체',
  POST: '게시글 업적',
  COMMENT: '댓글 업적',
  FOLLOW: '팔로우 업적',
  LIKE: '좋아요 업적',
};

const filterByType = (id, type) => {
  if (type === 'POST') return id >= 1000001 && id <= 1999999;
  if (type === 'COMMENT') return id >= 2000001 && id <= 2999999;
  if (type === 'FOLLOW') return id >= 3000001 && id <= 3999999;
  if (type === 'LIKE') return id >= 5000001 && id <= 5999999;
  return true; // 'ALL'
};

const MySettingAchievement = ({ data }) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('ALL');

  const achievementState = useSelector((state) => state.achievement_JH) || {};
  const { achievements = [], loadAchievementLoading: loading = false } = achievementState;

  useEffect(() => {
    dispatch({ type: LOAD_ACHIEVEMENT_REQUEST });
  }, [dispatch]);

  const unlockedIds = new Set((data?.Achievements ?? []).map((a) => String(a.id)));

  const filteredAchievements = (achievements ?? [])
    .filter((a) => filterByType(Number(a.id), filter))
    .sort((a, b) => {
      const aOwned = unlockedIds.has(String(a.id));
      const bOwned = unlockedIds.has(String(b.id));
      if (aOwned === bOwned) return 0;
      return aOwned ? -1 : 1;
    });

  return (
    <>
      <div style={{ marginTop: '3%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
          나의 업적
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        >
          {Object.entries(FILTERS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <hr style={{ borderTop: '1px solid #ccc', margin: '24px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {filteredAchievements.map((a) => {
          const isOwned = unlockedIds.has(String(a.id));
          const userAchievement = (data?.Achievements ?? []).find(item => String(item.id) === String(a.id));

          return (
            <div
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                backgroundColor: isOwned ? '#fff' : '#fafafa',
                maxWidth: '500px',
                width: '100%',
                opacity: isOwned ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginRight: '16px',
                  flexShrink: 0,
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3791/3791606.png"
                  alt="업적 이미지"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '16px' }}>{a.name}</h4>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: isOwned ? '#2c7' : '#999',
                      backgroundColor: isOwned ? '#e6ffed' : '#f0f0f0',
                      border: `1px solid ${isOwned ? '#2c7' : '#ccc'}`,
                      borderRadius: '8px',
                      padding: '2px 8px',
                    }}
                  >
                    {isOwned ? '달성' : '미달성'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px', color: '#666', fontSize: '14px' }}>{a.description}</p>
                {isOwned ? (
                  <small style={{ fontSize: '12px', color: '#999' }}>
                    획득일: {userAchievement?.user_achievements ? new Date(userAchievement.user_achievements.createdAt).toLocaleDateString() : '날짜 없음'}
                  </small>
                ) : (
                  <small style={{ fontSize: '12px', color: '#999' }}>아직 획득하지 않은 업적입니다.</small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MySettingAchievement;
