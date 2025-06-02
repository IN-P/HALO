// components/ChatRoom.js
import React from 'react';

const ChatRoom = ({
  me,
  selectedUser,
  roomId,
  log,
  chatBoxRef,
  message,
  setMessage,
  showNewMsgAlert,
  handleScroll,
  onExit,
  onSendMessage,
  userMap,
}) => {
  const handleSend = () => {
    if (!message.trim()) return;

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

    onSendMessage(newMsg);
  };

  return (
    <div style={{ padding: 20, position: 'relative' }}>
      <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me})</span>
        <button
          onClick={onExit}
          style={{
            marginLeft: 10,
            padding: '4px 10px',
            background: '#eee',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          나가기
        </button>
      </h2>

      {/* 메시지 목록 */}
      <div
        id="chat-box"
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
                  alt="프로필"
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
                {!isMine && (
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
                <div
                  style={{
                    fontSize: 11,
                    color: '#999',
                    marginTop: 2,
                    textAlign: isMine ? 'right' : 'left',
                  }}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 새 메시지 알림 */}
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
          }}
        >
          🔽 새 메시지 도착
        </div>
      )}

      {/* 메시지 입력창 */}
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder="메시지를 입력하세요"
        style={{ width: '80%', padding: '8px' }}
      />
      <button onClick={handleSend} style={{ padding: '8px 16px', marginLeft: 8 }}>
        전송
      </button>
    </div>
  );
};

export default ChatRoom;
