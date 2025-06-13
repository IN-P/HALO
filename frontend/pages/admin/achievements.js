import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_ACHIEVEMENT_REQUEST } from '../../reducers/achievement_JH';
import AppLayout from '../../components/AppLayout';

const FILTERS = {
  ALL: { label: '전체 보기', range: null },
  POST: { label: '게시글 업적', range: [1000001, 1999999] },
  COMMENT: { label: '댓글 업적', range: [2000001, 2999999] },
  FOLLOW: { label: '팔로우 업적', range: [3000001, 3999999] },
  LIKE: { label: '좋아요 업적', range: [5000001, 5999999] },
};

const AdminAchievementList = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('ALL');

  const achievementState = useSelector((state) => state.achievement_JH) || {};
  const { achievements = [], loadAchievementLoading: loading = false } = achievementState;

  useEffect(() => {
    dispatch({ type: LOAD_ACHIEVEMENT_REQUEST });
  }, [dispatch]);

  const filteredAchievements = achievements.filter((a) => {
    const range = FILTERS[filter].range;
    if (!range) return true;
    return a.id >= range[0] && a.id <= range[1];
  });

  return (
    <AppLayout>
      <div style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>업적 전체 목록</h2>

        {/* 필터 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          >
            {Object.entries(FILTERS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 업적 리스트 */}
        {loading ? (
          <p style={{ textAlign: 'center' }}>업적 불러오는 중...</p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            {filteredAchievements.map((a) => (
              <div
                key={a.id}
                style={{
                  flex: '0 1 calc(45%)',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  minWidth: '300px',
                  maxWidth: '500px',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3791/3791606.png"
                    alt="업적 이미지"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px' }}>{a.name}</h4>
                  <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminAchievementList;
