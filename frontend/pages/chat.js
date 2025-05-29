import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList';
import socket from '../socket';

const ChatPage = () => {
  const [me] = useState(1); // 더미 사용자 ID
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);

  const handleReceiveRef = useRef();

  const generateRoomId = (id1, id2) => {
    return `chat-${[id1, id2].sort().join('-')}`;
  };

  const roomId = selectedUser ? generateRoomId(me, selectedUser.id) : null;

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join_room', roomId);
    console.log(`✅ join_room: ${roomId}`);

    const handleReceive = (data) => {
      console.log('📩 받은 메시지:', data);
      setLog((prev) => [...prev, data]);
    };

    // Ref에 저장
    handleReceiveRef.current = handleReceive;

    socket.off('receive_message'); // 전체 제거
    socket.on('receive_message', handleReceiveRef.current);

    return () => {
      socket.off('receive_message', handleReceiveRef.current);
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const newMsg = {
      id: Date.now(),
      roomId,
      senderId: me,
      content: message,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', newMsg);
    setLog((prev) => [...prev, newMsg]); // 본인 메시지 바로 반영
    setMessage('');
  };

  // 더미 채팅방 목록
  const chatRooms = [
    {
      roomId: 1,
      lastMessage: '헤헤헤헤헤헤헤헤헿?',
      lastTime: '2분 전',
      otherUser: {
        id: 2,
        nickname: '덴지',
        profileImage: '/images/덴지.png',
      },
    },
    {
      roomId: 2,
      lastMessage: '점심 먹었어?',
      lastTime: '1시간 전',
      otherUser: {
        id: 3,
        nickname: '마키마',
        profileImage: '/images/마키마.png',
      },
    },
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex' }}>
        <ChatList chatRooms={chatRooms} onSelectUser={setSelectedUser} />
        <div style={{ flex: 1 }}>
          {!selectedUser ? (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
              <h2>💬 채팅을 시작하세요</h2>
            </div>
          ) : (
            <div style={{ padding: 20 }}>
              <h2>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me})</h2>
              <div
                style={{
                  border: '1px solid #ccc',
                  padding: 10,
                  height: 300,
                  overflowY: 'scroll',
                  marginBottom: 10,
                }}
              >
                {log.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      textAlign: msg.senderId === me ? 'right' : 'left',
                      margin: '6px 0',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '8px 12px',
                        borderRadius: 12,
                        background: msg.senderId === me ? '#d1f0ff' : '#f2f2f2',
                        maxWidth: '60%',
                      }}
                    >
                      {msg.content}
                    </div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요"
                style={{ width: '80%', padding: '8px' }}
              />
              <button onClick={sendMessage} style={{ padding: '8px 16px', marginLeft: 8 }}>
                전송
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
