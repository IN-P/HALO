import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList';
import socket from '../socket'; // socket.js 파일 경로 확인

const ChatPage = () => {
  const [me] = useState(2); // 나는 User 2
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);
  const [showNewMsgAlert, setShowNewMsgAlert] = useState(false);
  const chatBoxRef = useRef();

  // 현재 스크롤이 최하단에 가까운지 확인
  const isAtBottom = () => {
    const box = chatBoxRef.current;
    if (!box) return true;
    // ★ 수정: 스크롤의 가장 아래에서 '30px' 이내면 최하단으로 간주 (임계값 상향)
    return box.scrollHeight - box.scrollTop - box.clientHeight < 100;
  };

  // 스크롤 이벤트 핸들러: 수동 스크롤 시 알림 숨김
  const handleScroll = () => {
    if (isAtBottom()) {
      setShowNewMsgAlert(false);
    }
  };

  useEffect(() => {
    // 초기 로드 시 상대방 사용자 선택 (선택된 유저가 없을 경우 기본값 설정)
    if (!selectedUser) {
      setSelectedUser({
        id: 1, // 상대방은 User 1 (덴지)
        nickname: '덴지',
        profileImage: '/images/덴지.png',
      });
    }
  }, [selectedUser]);

  const generateRoomId = (id1, id2) => {
    return `chat-${[id1, id2].sort().join('-')}`;
  };

  const roomId = selectedUser ? generateRoomId(me, selectedUser.id) : null;

  // handleReceive의 useCallback 의존성 배열을 비웁니다. (이전 수정 유지)
  const handleReceive = useCallback((data) => {
    console.log('📩 받은 메시지:', data);
    setLog((prev) => [...prev, data]);
  }, []); // 빈 배열로 설정

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join_room', roomId);
    console.log(`✅ join_room: ${roomId}`);

    // socket.off를 socket.on 전에 호출하는 부분을 제거합니다. (이전 수정 유지)
    // socket.off('receive_message', handleReceive); 

    socket.on('receive_message', handleReceive); // 리스너 등록

    return () => {
      // 컴포넌트 언마운트 또는 roomId 변경 시에만 리스너 해제
      socket.off('receive_message', handleReceive);
      console.log(`❌ leave_room: ${roomId}`);
    };
  }, [roomId, handleReceive]);

  // log 상태가 변경될 때 스크롤 및 알림 로직 처리
  useEffect(() => {
    if (!chatBoxRef.current || log.length === 0) return;

    const lastMsg = log[log.length - 1];
    const box = chatBoxRef.current;
    
    // 메시지가 추가되기 '직전'의 스크롤 위치를 먼저 확인
    const wasAtBottomBeforeNewMessage = isAtBottom(); 

    // ★ 수정: 스크롤을 내리는 로직을 별도의 함수로 분리 (requestAnimationFrame 사용)
    const scrollToBottom = () => {
      if (box) {
        box.scrollTop = box.scrollHeight;
      }
    };

    if (lastMsg.senderId === me) {
      // 1. 내가 보낸 메시지: 무조건 맨 아래로 이동
      requestAnimationFrame(scrollToBottom); // 다음 프레임에 스크롤 내림
      setShowNewMsgAlert(false);
    } else {
      // 2. 상대방이 보낸 메시지
      if (wasAtBottomBeforeNewMessage) {
        // 상대가 보냈지만, 내가 이미 최하단에 있었다면: 자동으로 스크롤 내리고 알림 띄우지 않음
        requestAnimationFrame(scrollToBottom); // 다음 프레임에 스크롤 내림
        setShowNewMsgAlert(false);
      } else {
        // 상대가 보냈고, 내가 스크롤을 올려둔 상태라면: 알림 띄움 (스크롤은 유지)
        setShowNewMsgAlert(true);
      }
    }
  }, [log, me]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const newMsg = {
      id: Date.now(),
      roomId,
      senderId: me,
      content: message,
      time: new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    socket.emit('send_message', newMsg);
    setMessage('');
  };

  const chatRooms = [
    {
      roomId: 1, 
      lastMessage: '헤헤헤헤헤헤헤헤헿?',
      lastTime: '2분 전',
      otherUser: {
        id: 1, // 채팅 목록의 상대방 ID는 1 (덴지)
        nickname: '덴지',
        profileImage: '/images/덴지.png',
      },
    },
    // 다른 채팅방도 있다면 여기에 추가
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex', position: 'relative' }}>
        <ChatList chatRooms={chatRooms} onSelectUser={setSelectedUser} />
        <div style={{ flex: 1 }}>
          {!selectedUser ? (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
              <h2>💬 채팅을 시작하세요</h2>
            </div>
          ) : (
            <div style={{ padding: 20, position: 'relative' }}>
              <h2>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me})</h2>

              <div
                ref={chatBoxRef}
                onScroll={handleScroll}
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
                      색상변경: msg.senderId === me ? '#d1f0ff' : '#f2f2f2',
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
                    <div
                      style={{ fontSize: 11, color: '#999', marginTop: 2 }}
                    >
                      {msg.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* 🔔 새 메시지 알림 */}
              {showNewMsgAlert && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 90, // 입력창과 버튼 위로 위치 조정
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#333',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                  onClick={() => {
                    if (chatBoxRef.current) {
                      chatBoxRef.current.scrollTop =
                        chatBoxRef.current.scrollHeight;
                      setShowNewMsgAlert(false);
                    }
                  }}
                >
                  🔽 새 메시지 도착
                </div>
              )}

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요"
                style={{ width: '80%', padding: '8px' }}
              />
              <button
                onClick={sendMessage}
                style={{ padding: '8px 16px', marginLeft: 8 }}
              >
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