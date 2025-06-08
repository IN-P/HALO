import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MySettingBadges = ({ data }) => {
const [allBadges, setAllBadges] = useState([]);
const [ownedBadges, setOwnedBadges] = useState([]);
const [unownedBadges, setUnownedBadges] = useState([]);

    useEffect(() => {
        // 유저가 가진 뱃지
        setOwnedBadges(data?.Badges || []);

        // 전체 뱃지 API 호출 (경로 예시)
        const fetchAllBadges = async () => {
        try {
            const response = await axios.get('/badges'); // 전체 뱃지 리스트 API
            setAllBadges(response.data);
        } catch (error) {
            console.error('전체 뱃지 불러오기 실패:', error);
        }
        };

        fetchAllBadges();
    }, [data]);

    useEffect(() => {
        // 전체 뱃지 중 유저가 가진 뱃지가 아닌 것들 필터링
        if (allBadges.length && ownedBadges.length) {
        const ownedIds = new Set(ownedBadges.map(b => b.id));
        const filtered = allBadges.filter(badge => !ownedIds.has(badge.id));
        setUnownedBadges(filtered);
        } else if (allBadges.length && !ownedBadges.length) {
        setUnownedBadges(allBadges);
        }
    }, [allBadges, ownedBadges]);

    // 뱃지 카드 UI 함수 (중복 제거용)
    const renderBadgeCard = (badge, owned = true) => (
        <div key={badge.id} style={{
        flex: '0 1 calc(50% - 32px)',
        maxWidth: '480px',
        padding: '28px',
        border: '1px solid #ddd',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: owned ? '#fff' : '#f9f9f9',
        textAlign: 'center',
        boxSizing: 'border-box',
        opacity: owned ? 1 : 0.5,  // 미보유는 투명도 줄임
        }}>
        <img
            src={badge.img || 'https://via.placeholder.com/200'}
            alt={badge.name}
            style={{
            width: '180px',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '20px',
            marginBottom: '20px',
            border: owned ? '2px solid #bbb' : '2px dashed #bbb',
            }}
        />
        <h3 style={{ margin: '12px 0 8px', fontSize: '20px' }}>{badge.name}</h3>
        <p style={{ margin: '4px 0 12px', color: '#555', fontSize: '15px' }}>{badge.description}</p>
        {owned && badge.user_badges?.createdAt && (
            <small style={{ fontSize: '13px', color: '#888' }}>
            획득일: {new Date(badge.user_badges.createdAt).toLocaleDateString()}
            </small>
        )}
        </div>
    );

    return (
        <>
        <div style={{ marginTop: '3%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
            보유 중인 뱃지
            </div>
        </div>

        <hr style={{ borderTop: '1px solid #ccc', margin: '24px 0' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
            {ownedBadges.length ? ownedBadges.map(badge => renderBadgeCard(badge, true)) : <p>보유한 뱃지가 없습니다.</p>}
        </div>

        <div style={{ marginTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: '600', color: '#555' }}>
            미보유 뱃지
            </div>
        </div>

        <hr style={{ borderTop: '1px solid #ccc', margin: '16px 0 24px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
            {unownedBadges.length ? unownedBadges.map(badge => renderBadgeCard(badge, false)) : <p>모든 뱃지를 보유 중입니다!</p>}
        </div>
        </>
    );
};

export default MySettingBadges;
