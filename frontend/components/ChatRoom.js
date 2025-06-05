import React, { useEffect } from 'react';

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
  onSendMessage, // 이제 이 onSendMessage를 사용할 거야
  userMap,
  onClose,
}) => {

  // ESC 키 누르면 닫기 기능
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose(); // ESC 누르면 닫기 실행
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown); // 정리
    };
  }, [onClose]);

  // ⭐ 기존 ChatRoom 내부의 handleSend 함수는 이제 필요 없으므로 삭제했어.
  //    pages/chat.js에서 전달받은 onSendMessage를 직접 호출할 거야.

  // 나가기 버튼 클릭 시 확인 알림창 띄우기
  const handleExitConfirm = () => {
    const confirmExit = window.confirm('채팅방을 나가시면 현재 사용자에게만 메시지 기록이 모두 모두 삭제됩니다. 정말 나가시겠습니까?');
    if (confirmExit) {
      onExit(); // 사용자가 '확인'을 누르면 onExit 함수 호출 (Redux 액션 디스패치)
    }
    // '취소'를 누르면 아무것도 하지 않음
  };

  return (
    <div
      style={{
        width: '600px',
        maxHeight: '80vh',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* 상단 타이틀 */}
      <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me.id})</span>
        <button
          onClick={onClose}
          style={{
            padding: '4px 10px',
            background: '#eee',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </h2>

      {/* 메시지 목록 */}
      <div
        id="chat-box"
        ref={chatBoxRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          border: '1px solid #ccc',
          padding: '16px',
          overflowY: 'auto',
          marginBottom: '12px',
          minHeight: '400px',
          maxHeight: '500px',
          borderRadius: '8px',
          background: '#fafafa',
        }}
      >
        {log.map((msg, idx) => {
          const isMine = msg.sender_id === me.id || msg.senderId === me.id; // 🟢 여기도 me.id 로 수정!
          const sender = msg.User;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                margin: '6px 0',
              }}
            >
              {!isMine && (
                <img
                  src={sender?.profile_img ?? "default.png"}
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
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 2 }}>
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
                    background: isMine ? '#d1f0ff' : '#f2f2f2',
                    textAlign: isMine ? 'left' : 'right',
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

      {/* 메시지 입력 */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') onSendMessage(); // ⭐ onSendMessage로 변경!
          }}
          placeholder="메시지를 입력하세요"
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={onSendMessage} // ⭐ onSendMessage로 변경!
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            background: '#4a90e2',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          전송
        </button>
      </div>

      {/* 나가기 버튼 */}
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <button
          onClick={handleExitConfirm}
          style={{
            padding: '8px 16px',
            background: '#f5f5f5',
            border: '1px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          나가기
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;