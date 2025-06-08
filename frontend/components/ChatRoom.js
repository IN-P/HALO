import React, { useEffect,useCallback  } from 'react';
import socket from '../socket';

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
  onClose,
  onReadUpdate,
}) => {

  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose(); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown); 
    };
  }, [onClose]);

  useEffect(() => {
  const handleReadUpdate = (data) => {
    console.log('✅ read_update 수신:', data);

    const { roomId: updateRoomId, readMessageIds } = data;

    // 현재 ChatRoom의 roomId 와 일치할 때만 업데이트
    if (updateRoomId === roomId && onReadUpdate) {
      onReadUpdate(readMessageIds);
    }
  };

  socket.on('read_update', handleReadUpdate);

  return () => {
    socket.off('read_update', handleReadUpdate);
  };
}, [roomId, onReadUpdate]);




  const handleExitConfirm = () => {
    const confirmExit = window.confirm('채팅방을 나가시면 현재 사용자에게만 메시지 기록이 모두 모두 삭제됩니다. 정말 나가시겠습니까?');
    if (confirmExit) {
      onExit(); 
    }

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
          onClick={() => {
    socket.emit('leave_room', me.id);   // ✅ 서버에 leave_room 보내서 currentRoomId null 처리
    onClose();   // 기존 onClose 로직 (화면 닫기)
  }}
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
  console.log('msg.id:', msg.id, typeof msg.id, 'msg.is_read:', msg.is_read);
  console.log('렌더링 시 메시지:', msg);
  const isMine = msg.sender_id === me.id || msg.senderId === me.id;
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
      {!isMine && sender && (
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
        {!isMine && sender && (
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 2 }}>
            {sender.nickname}
          </div>
        )}

        {/* 여기 수정된 부분 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMine ? 'flex-end' : 'flex-start',
          gap: 6 // 말풍선과 숫자 간격
        }}>
  {/* 숫자 먼저 표시 (왼쪽) */}
  {isMine && (msg.is_read === 0 || msg.is_read === false) && (
    <div style={{ fontSize: 10, color: 'red', marginTop: 4 }}>
    1
  </div>
  )}

  {/* 말풍선 */}
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
</div>

        {/* 시간 */}
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
            if (e.key === 'Enter') onSendMessage(); 
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
          onClick={onSendMessage} 
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