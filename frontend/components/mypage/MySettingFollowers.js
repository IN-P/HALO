import React, { useState } from 'react';
import Searchbar from './Searchbar';

const MySettingFollowers = ({ data }) => {
  const userList = data?.Followers?.map(follower => follower.Followings).filter(Boolean) || [];

  const [filteredUsers, setFilteredUsers] = useState(userList);

  return (
    <>
      <div style={{ marginTop: '3%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: 0 }}>
          나를 팔로우 한 사용자
        </h2>
      </div>

      <hr style={{ borderTop: '1px solid #ddd', margin: '24px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px' }}>
        <Searchbar data={userList} onResultChange={setFilteredUsers} />

        {filteredUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>팔로우 중인 사용자가 없습니다.</p>
        ) : (
          filteredUsers.map((user) => (
            <a
              key={user.id}
              href={`/profile/${user.id}`}
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
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              title={user.nickname}
            >
              <img
                src={
                  user.profile_img
                    ? `http://localhost:3065${data?.profile_img}`
                    : `http://localhost:3065/uploads/profile/default.jpg`
                }
                alt={user?.nickname || 'profile'}
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
          ))
        )}
      </div>
    </>
  );
};
export default MySettingFollowers;
