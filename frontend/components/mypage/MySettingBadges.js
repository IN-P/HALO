import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LOAD_BADGE_REQUEST } from '../../reducers/badge_JH';

const MySettingBadges = ({ data }) => {
  const dispatch = useDispatch();
  const { badges, loadBadgeDone } = useSelector((state) => state.badge_JH);

  const [ownedBadges, setOwnedBadges] = useState([]);
  const [unownedBadges, setUnownedBadges] = useState([]);

  // 전체 뱃지 불러오기
  useEffect(() => {
    if (!loadBadgeDone) {
      dispatch({ type: LOAD_BADGE_REQUEST });
    }
  }, [dispatch, loadBadgeDone]);

  // data.Badges 세팅
  useEffect(() => {
    setOwnedBadges(data?.Badges || []);
  }, [data]);

  // owned / unowned 나누기
  useEffect(() => {
    if (!Array.isArray(badges)) return;

    const ownedIds = new Set((data?.Badges || []).map((b) => b.id));
    const unowned = badges.filter((badge) => !ownedIds.has(badge.id));
    setUnownedBadges(unowned);
  }, [badges, data]);

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
      opacity: owned ? 1 : 0.5,
    }}>
      <img
        src={`http://localhost:3065${badge.img}` || 'https://placeholder.co/200x100'}
        alt={badge.name}
        style={{
          width: '180px',
          height: '180px',
          objectFit: 'fill',
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
        {ownedBadges.length ? ownedBadges.map((badge) => renderBadgeCard(badge, true)) : <p>보유한 뱃지가 없습니다.</p>}
      </div>

      <div style={{ marginTop: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', fontSize: '22px', fontWeight: '600', color: '#555' }}>
          미보유 뱃지
        </div>
      </div>

      <hr style={{ borderTop: '1px solid #ccc', margin: '16px 0 24px' }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px' }}>
        {unownedBadges.length ? unownedBadges.map((badge) => renderBadgeCard(badge, false)) : <p>모든 뱃지를 보유 중입니다!</p>}
      </div>
    </>
  );
};

export default MySettingBadges;
