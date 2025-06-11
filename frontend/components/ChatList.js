import React from 'react';

const ChatList = ({ chatRooms, onSelectUser }) => {
  console.log('🔥 ChatList 렌더링됨 chatRooms:', chatRooms);

  const API_URL = 'http://localhost:3065';

  return (
    <div style={{
      width: 300,
      borderRight: '1px solid #eee',
      height: '100vh',
      overflowY: 'auto',
      background: '#fff',
      padding: 16
    }}>
      <h3 style={{ marginBottom: 20 }}>ChatList</h3>

      {chatRooms.length === 0 && (
        <div style={{ color: '#999' }}>채팅방이 없습니다</div>
      )}

      {chatRooms.map((room) => (
        <div
          key={room.roomId}
          onClick={() => onSelectUser(room.otherUser)}
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <img
            src={room.otherUser?.profileImage ? `${API_URL}${room.otherUser.profileImage}` : '/default.png'}
            alt=""
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>{room.otherUser.nickname}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{room.lastMessage}</div>
          </div>
          <div style={{ fontSize: 12, color: '#ccc', display: 'flex', alignItems: 'center' }}>
            <span>{room.lastTime}</span>
            {room.unreadCount > 0 && (
              <span style={{
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '11px',
                marginLeft: 8,
                minWidth: 20,
                textAlign: 'center'
              }}>
                {room.unreadCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
