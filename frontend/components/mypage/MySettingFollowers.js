import React from 'react';

const MySettingFollowings = ({ data }) => {
  const followers = data?.Followers || [];

  return (
    <>
      <div style={{ marginTop: '3%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 0 }}>
          나를 팔로우 중인 사용자
        </h2>
      </div>

      <hr style={{ borderTop: '1px solid #ddd', margin: '24px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px' }}>
        {followers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>팔로우 중인 사용자가 없습니다.</p>
        ) : (
          followers.map((follower) => {
            const user = follower?.Followers || follower?.Followings;
            if (!user) return null;

            return (
              <a
                key={user.id}
                href={`http://localhost:3000/profile/${user.nickname}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 20px',
                  border: '1px solid #eee',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                title={user.nickname}
              >
                <img
                  src={user.profile_img || '/default-profile.png'}
                  alt={user.nickname || 'profile'}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #1890ff',
                    boxShadow: '0 0 5px rgba(24,144,255,0.3)',
                  }}
                />
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '180px',
                  }}
                >
                  {user.nickname}
                </span>
              </a>
            );
          })
        )}
      </div>
    </>
  );
};

export default MySettingFollowings;
