import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';

const MySettingBlock = ({ data, onRefetch, reload }) => {
  const userList = data?.Blockeds?.map(block => block.Blocked).filter(Boolean) || [];

  const onUnblock = async (userId) => {
    try {
      await axios.delete(`/block/${userId}`);
      message.success('차단이 해제되었습니다.');
      reload();
      if (onRefetch) onRefetch(); // 목록 새로고침
    } catch (error) {
      message.error('차단 해제 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <div style={{ marginTop: '3%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 0 }}>
          차단 목록
        </h2>
      </div>

      <hr style={{ borderTop: '1px solid #ddd', margin: '24px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px' }}>
        {userList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>차단한 사용자가 없습니다.</p>
        ) : (
          userList.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 20px',
                border: '1px solid #eee',
                borderRadius: '10px',
                backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                cursor: 'default',
                color: 'inherit',
                userSelect: 'none',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              title={user.nickname}
            >
              <img
                src={
                  user.profile_img
                    ? `http://localhost:3065${user.profile_img}`
                    : `http://localhost:3065/uploads/profile/default.jpg`
                }
                alt={user.nickname || 'profile'}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #1890ff',
                  boxShadow: '0 0 5px rgba(24,144,255,0.3)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 180,
                }}
              >
                {user.nickname}
              </span>

              <Button
                type="primary"
                danger
                style={{ marginLeft: 'auto', minWidth: 90, fontWeight: 600, borderRadius: 6 }}
                onClick={() => onUnblock(user.id)}
                size="middle"
              >
                해제
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default MySettingBlock;
