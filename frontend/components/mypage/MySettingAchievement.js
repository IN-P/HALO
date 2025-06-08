import React, { useEffect, useState } from 'react';

const MySettingAchievement = ({ data }) => {
// c

const [allAchievements, setAllAchievements] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    async function fetchAllAchievements() {
        try {
        const res = await fetch('http://localhost:3065/achievements');
        if (!res.ok) throw new Error('업적 불러오기 실패');
        const json = await res.json();
        console.log('전체 업적:', json);
        setAllAchievements(json);
        } catch (error) {
        console.error(error);
        } finally {
        setLoading(false);
        }
    }
    fetchAllAchievements();
    }, []);

    if (loading) return <div>로딩중...</div>;
    if (!data) return <div>유저 정보를 불러올 수 없습니다.</div>;

  // 해금한 업적 ID 목록
    const unlockedIds = new Set(data?.Achievements?.map(a => a.id));

  // 미해금 업적 필터링
    const lockedAchievements = allAchievements.filter(a => !unlockedIds.has(a.id));

    console.log("전체업적 :", allAchievements);
// v
return (
    <>
        <div style={{ marginTop: '3%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
            해금한 업적
            </div>
        </div>

        <hr style={{ borderTop: '1px solid #ccc', margin: '24px 0' }} />

        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {data?.Achievements?.map((a) => (
                <div key={a.id} style={{
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
                }}>
                {/* 이미지 영역 */}
                <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginRight: '16px',
                flexShrink: 0,
            }}>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3791/3791606.png" // 실제 이미지 URL로 교체
                    alt="업적 이미지"
                    style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
                />
            </div>

              {/* 텍스트 정보 */}
                <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{a.name}</h4>
                    <p style={{ margin: '4px 0 8px', color: '#666', fontSize: '14px' }}>{a.description}</p>
                    <small style={{ fontSize: '12px', color: '#999' }}>
                    획득일: {new Date(a.user_achievements.createdAt).toLocaleDateString()}
                    </small>
                </div>
                </div>
            ))}
        </div>

        <div style={{ marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: '600', color: '#555' }}>
            미해금 업적
            </div>
        </div>

        <hr style={{ borderTop: '1px solid #ccc', margin: '16px 0 24px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {lockedAchievements.map((a) => (
            <div key={a.id} style={{
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
            }}>
              {/* 이미지 영역 */}
                <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '8px',
                overflow: 'hidden',
                marginRight: '16px',
                flexShrink: 0,
            }}>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/3791/3791606.png" // 실제 이미지 URL로 교체
                    alt="업적 이미지"
                    style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                }}
                />
            </div>

              {/* 텍스트 정보 */}
                <div>
                <h4 style={{ margin: 0, fontSize: '16px' }}>{a.name}</h4>
                <p style={{ margin: '4px 0 8px', color: '#666', fontSize: '14px' }}>{a.description}</p>
                <small style={{ fontSize: '12px', color: '#999' }}>
                    아직 획득하지 않은 업적입니다.
                </small>
                </div>
            </div>
            ))}
        </div>
        </div>
    </>
    );
};

export default MySettingAchievement;
