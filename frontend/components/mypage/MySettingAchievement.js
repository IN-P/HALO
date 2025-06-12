import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_ACHIEVEMENT_REQUEST } from '../../reducers/achievement_JH'; // 경로 확인

const MySettingAchievement = ({ data }) => {
  const dispatch = useDispatch();

  // 리덕스 상태에서 achievements 배열과 loading 상태 가져오기
  const achievementState = useSelector((state) => state.achievement_JH) || {};
  const { achievements = [], loadAchievementLoading: loading = false } = achievementState;

  console.log("업적 ", achievements);

  useEffect(() => {
    dispatch({ type: LOAD_ACHIEVEMENT_REQUEST });
  }, [dispatch]);

  const unlockedIds = new Set((data?.Achievements ?? []).map(a => String(a.id)));
  console.log('unlockedIds:', Array.from(unlockedIds));

  const lockedAchievements = (achievements ?? []).filter(a => {
    const isLocked = !unlockedIds.has(String(a.id));
    console.log(`achievement ${a.id} locked?`, isLocked);
    return isLocked;
  });

console.log('lockedAchievements:', lockedAchievements);


  return (
    <>
      <div style={{ marginTop: '3%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
          달성한 업적
        </div>
      </div>

      <hr style={{ borderTop: '1px solid #ccc', margin: '24px 0' }} />

      <div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {data?.Achievements?.map((a) => (
            <div key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                backgroundColor: '#fff',
                maxWidth: '500px',
                width: '100%',
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

              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>{a.name}</h4>
                <p style={{ margin: '4px 0 8px', color: '#666', fontSize: '14px' }}>{a.description}</p>
                <small style={{ fontSize: '12px', color: '#999' }}>
                  획득일: {a.user_achievements ? new Date(a.user_achievements.createdAt).toLocaleDateString() : '날짜 없음'}
                </small>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '60px' }}>
          <div
            style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: '600', color: '#555' }}
          >
            미해금 업적
          </div>
        </div>

        <hr style={{ borderTop: '1px solid #ccc', margin: '16px 0 24px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {lockedAchievements.map((a) => (
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
                backgroundColor: '#fafafa',
                maxWidth: '500px',
                width: '100%',
                opacity: 0.5,
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

              <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>{a.name}</h4>
                <p style={{ margin: '4px 0 8px', color: '#666', fontSize: '14px' }}>{a.description}</p>
                <small style={{ fontSize: '12px', color: '#999' }}>아직 획득하지 않은 업적입니다.</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MySettingAchievement;
