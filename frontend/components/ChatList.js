import React, { useEffect, useState } from 'react';
import socket from '../socket';
//import Wave from './lottie/Wave';

const ChatList = ({ chatRooms,setChatRooms,onSelectUser }) => {
  console.log('🔥 ChatList 렌더링됨 chatRooms:', chatRooms);

  const [hoveredRoomId, setHoveredRoomId] = useState(null);

   useEffect(() => {
  const handleProfileUpdate = (data) => {
    console.log('📢 profile_update 수신:', data);
    setChatRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.otherUser.id === data.userId
          ? {
              ...room,
              otherUser: {
                ...room.otherUser,
                profileImage: data.profileImage,
              },
            }
          : room
      )
    );
  };
  socket.on('profile_update', handleProfileUpdate);

   return () => {
    socket.off('profile_update', handleProfileUpdate);
  };}, [setChatRooms]);

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
          // ✅ 여기에 console.log 추가!
          onMouseEnter={() => {
            setHoveredRoomId(room.roomId);
            console.log('ChatList: 마우스 진입, hoveredRoomId:', room.roomId);
          }}
          // ✅ 여기에 console.log 추가!
          onMouseLeave={() => {
            setHoveredRoomId(null);
            console.log('ChatList: 마우스 이탈, hoveredRoomId:', null);
          }}
          style={{
            padding: '12px 0',
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            position: 'relative', // 👈 이 줄 추가
            overflow: 'hidden',
            marginBottom: '4px',
             background: '#fff',
             borderRadius: '8px',
             boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
             transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          {/*
          <div
                style={{
                    position: 'absolute', 
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px', 
                    zIndex: 0, 
                    opacity: hoveredRoomId === room.roomId ? 1 : 0, 
                    transition: 'opacity 0.3s ease-in-out', 
                }}
            >
                <Wave isHovered={hoveredRoomId === room.roomId} />
            </div>
            */}
          <img
            src={room.otherUser?.profileImage ? `${API_URL}${room.otherUser.profileImage}` : '/default.png'}
            alt=""
            style={{ width: 40, height: 40, borderRadius: '50%', zIndex: 1, position: 'relative' }}
          />
          <div style={{ flex: 1, zIndex: 1, position: 'relative' }}>
            <div style={{ fontWeight: 'bold' }}>{room.otherUser.nickname}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{room.lastMessage}</div>
          </div>
          <div style={{ fontSize: 12, color: '#ccc', display: 'flex', alignItems: 'center', zIndex: 1, position: 'relative' }}>
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