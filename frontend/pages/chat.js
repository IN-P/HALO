import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList';
import socket from '../socket';

const ChatPage = () => {
  const [me, setMe] = useState(1); // 기본 유저: 덴지
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [log, setLog] = useState([]);
  const [showNewMsgAlert, setShowNewMsgAlert] = useState(false);
  const chatBoxRef = useRef();

  const userMap = {
    1: { id: 1, nickname: '덴지', profileImage: '/images/덴지.png' },
    2: { id: 2, nickname: '마키마', profileImage: '/images/마키마.png' },
  };

  const isAtBottom = () => {
    const box = chatBoxRef.current;
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight < 100;
  };

  const handleScroll = () => {
    if (isAtBottom()) setShowNewMsgAlert(false);
  };

  // 💬 메시지 수신
  const handleReceive = useCallback((data) => {
    setLog((prev) => [...prev, data]);
  }, []);

  // 🔁 유저 전환 시 상대 설정 + 로그 초기화
  useEffect(() => {
    const other = me === 1 ? userMap[2] : userMap[1];
    setSelectedUser(other);
    //setLog([]); // ✅ 유저 전환 시 메시지 초기화
  }, [me]);

  const roomId = selectedUser ? `chat-${[me, selectedUser.id].sort().join('-')}` : null;

  useEffect(() => {
    if (!roomId) return;

    socket.emit('join_room', roomId);
    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [roomId, handleReceive]);

  // ⬇️ 스크롤 처리
  useEffect(() => {
    if (!chatBoxRef.current || log.length === 0) return;

    const lastMsg = log[log.length - 1];
    const wasAtBottom = isAtBottom();

    if (lastMsg.senderId === me || wasAtBottom) {
      requestAnimationFrame(() => {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      });
      setShowNewMsgAlert(false);
    } else {
      setShowNewMsgAlert(true);
    }
  }, [log, me]);

  // 📤 메시지 전송
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

  return (
    <AppLayout>
      <div style={{ display: 'flex', position: 'relative' }}>
        <ChatList chatRooms={[]} onSelectUser={() => {}} />

        <div style={{ flex: 1 }}>
          {/* 🔁 유저 전환 버튼 */}
          <div style={{ margin: '16px 0 0 20px' }}>
            <button onClick={() => setMe(1)} style={{ marginRight: 8 }}>
              🙋 덴지로 보기
            </button>
            <button onClick={() => setMe(2)}>🧍 마키마로 보기</button>
          </div>

          {!selectedUser ? (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
              <h2>💬 채팅을 시작하세요</h2>
            </div>
          ) : (
            <div style={{ padding: 20, position: 'relative' }}>
              <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me})</span>
                <button
                  onClick={() => {
                    socket.emit('exit_room', { roomId, userId: me });
                    alert('채팅방을 나갔습니다.');
                    setSelectedUser(null);
                    setLog([]);
                  }}
                  style={{
                    marginLeft: 10,
                    padding: '4px 10px',
                    background: '#eee',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  나가기
                </button>
              </h2>

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
                {log.map((msg, idx) => {
                  const isMine = msg.senderId === me;
                  const sender = userMap[msg.senderId];

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        margin: '6px 0',
                        flexDirection: 'row', 
                      }}
                    >
                      {!isMine && ( 
                        <img
                          src={sender.profileImage}
                          alt="상대 프로필"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            marginRight: 8,
                            marginLeft: 4,
                          }}
                        />
                      )}
                      <div style={{ maxWidth: '70%' }}>
                        {!isMine && ( // 상대방 메시지에만 닉네임 표시
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 'bold',
                              color: '#555',
                              marginBottom: 2,
                            }}
                          >
                            {sender.nickname}
                          </div>
                        )}
                        <div
                          style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            borderRadius: 12,
                            background: isMine ? '#d1f0ff' : '#f2f2f2',
                            color: '#000',
                          }}
                        >
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 11, color: '#999', marginTop: 2, textAlign: isMine ? 'right' : 'left' }}>
                          {msg.time}
                        </div>
                      </div>
                      {isMine && (
                         null
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 🔔 새 메시지 알림 */}
              {showNewMsgAlert && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 90,
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
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                    setShowNewMsgAlert(false);
                  }}
                >
                  🔽 새 메시지 도착
                </div>
              )}

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendMessage();
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