// frontend/components/ChatList.js

import React, { useEffect, useState } from 'react'; // ✅ useState 임포트 추가
import socket from '../socket';
import Wave from '../components/lottie/Wave'; // ✅ Wave 컴포넌트 임포트! (경로 다시 한번 확인: components/lottie/Wave.js 가 맞는지)

const ChatList = ({ chatRooms,setChatRooms,onSelectUser }) => {
  console.log('🔥 ChatList 렌더링됨 chatRooms:', chatRooms);

  // 각 채팅방 항목의 호버 상태를 관리하기 위한 state
  const [hoveredRoomId, setHoveredRoomId] = useState(null); // ✅ hoveredRoomId state 추가

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
  };
}, [setChatRooms]);

  const API_URL = 'http://localhost:3065';

  // 채팅방 정렬 (ChatList에서 일반적으로 사용되는 로직)
  const sortedChatRooms = [...chatRooms].sort((a, b) => {
    const timeA = new Date(a.lastTime);
    const timeB = new Date(b.lastTime);
    return timeB.getTime() - timeA.getTime();
  });


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

      {sortedChatRooms.length === 0 && ( // ✅ sortedChatRooms 사용
        <div style={{ color: '#999' }}>채팅방이 없습니다</div>
      )}

      {sortedChatRooms.map((room) => ( // ✅ sortedChatRooms 사용
        <div
          key={room.roomId}
          onClick={() => onSelectUser(room.otherUser)}
          style={{
            padding: '12px 0', // 기존 padding 유지
            borderBottom: '1px solid #eee',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            // ✅ Lottie 적용을 위한 CSS 추가 및 조절
            position: 'relative', // Lottie absolute 포지셔닝의 기준점
            overflow: 'hidden',   // Lottie가 이 영역 밖으로 나가지 않도록
            background: '#fff',   // Lottie 아래에 보일 기본 배경색
            borderRadius: '8px',  // 모서리 둥글게 (선택 사항)
            marginBottom: '4px',  // ✅ 이전 요청대로 목록 간 간격 유지
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // 기본 그림자 (선택 사항)
            transition: 'transform 0.2s, box-shadow 0.2s', // 호버 시 변형 및 그림자 효과
          }}
          // ✅ 마우스 이벤트 핸들러 추가
          onMouseEnter={() => setHoveredRoomId(room.roomId)}
          onMouseLeave={() => setHoveredRoomId(null)}
        >
            {/* ✅ Wave Lottie를 감싸는 div 추가 */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                    zIndex: 0, // 항목 내용(사진/텍스트) 뒤에, 기본 배경 위에
                    opacity: hoveredRoomId === room.roomId ? 1 : 0, // ✅ 호버 상태에 따라 Lottie 보임/숨김
                    transition: 'opacity 0.3s ease-in-out', // Lottie가 부드럽게 나타나고 사라지도록
                }}
            >
                <Wave isHovered={hoveredRoomId === room.roomId} /> {/* ✅ Wave 컴포넌트 사용 및 isHovered 프롭 전달 */}
            </div>

          {/* 기존 내용물들은 Wave 위에 오도록 zIndex: 1, position: 'relative' 유지 */}
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