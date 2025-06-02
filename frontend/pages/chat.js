import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList';
import SearchModal from '../components/SearchModal';
import { joinRoom, exitRoom, sendMessage as sendMsg } from '../sagas/chatSaga';
import { setSelectedUser, setMessage, clearLog, appendMessage, setSearchTerm, toggleSearchModal } from '../reducers/chatReducer';
import socket from '../socket';

const ChatPage = () => {
  const dispatch = useDispatch();
  const {
    me,
    selectedUser,
    message,
    log,
    showNewMsgAlert,
    showSearchModal,
    searchTerm,
    chatRooms,
  } = useSelector((state) => state.chat);

  const chatBoxRef = useRef();

  const userMap = {
    1: { id: 1, nickname: '덴지', profileImage: '/images/덴지.png' },
    2: { id: 2, nickname: '마키마', profileImage: '/images/마키마.png' },
    3: { id: 3, nickname: '파워', profileImage: '/images/파워.png' },
    4: { id: 4, nickname: '아키', profileImage: '/images/아키.png' },
  };

  const roomId = selectedUser ? `chat-${[me, selectedUser.id].sort().join('-')}` : null;

  const isAtBottom = () => {
    const box = chatBoxRef.current;
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight < 100;
  };

  const handleScroll = () => {
    if (isAtBottom()) dispatch(setShowNewMsgAlert(false));
  };

  const handleReceive = useCallback((data) => {
    dispatch(appendMessage(data));
  }, [dispatch]);

  const handleExitSuccess = useCallback(() => {
    alert('채팅방을 나갔습니다.');
    dispatch(setSelectedUser(null));
    dispatch(clearLog());
    dispatch(toggleSearchModal(false));
  }, [dispatch]);

  const handleExitFailed = useCallback((data) => {
    alert(`채팅방 나가기 실패: ${data.message || '알 수 없는 오류'}`);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    socket.emit('join_room', roomId, me);
    socket.on('receive_message', handleReceive);
    socket.on('exit_room_success', handleExitSuccess);
    socket.on('exit_room_failed', handleExitFailed);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('exit_room_success', handleExitSuccess);
      socket.off('exit_room_failed', handleExitFailed);
    };
  }, [roomId, handleReceive, handleExitSuccess, handleExitFailed]);

  useEffect(() => {
    if (!chatBoxRef.current || log.length === 0) return;
    const lastMsg = log[log.length - 1];
    const wasAtBottom = isAtBottom();
    if (lastMsg.senderId === me || wasAtBottom) {
      requestAnimationFrame(() => {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      });
      dispatch(setShowNewMsgAlert(false));
    } else {
      dispatch(setShowNewMsgAlert(true));
    }
  }, [log, me, dispatch]);

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    dispatch(sendMsg({ roomId, senderId: me, content: message }));
    dispatch(setMessage(''));
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', position: 'relative' }}>
        <ChatList chatRooms={chatRooms} onSelectUser={(user) => dispatch(setSelectedUser(user))} />
        <div style={{ flex: 1, position: 'relative' }}> {/* <-- 이 부분에 position: 'relative' 추가! */}
  {showSearchModal && (
  <SearchModal
    searchTerm={searchTerm}
    onSearchChange={(e) => dispatch(setSearchTerm(e.target.value))}
    onUserSelect={(user) => {
      dispatch(setSelectedUser(user));
      dispatch(toggleSearchModal(false));
    }}
    onClose={() => dispatch(toggleSearchModal(false))} // 이제 이 toggleSearchModal은 인자 없이 호출하도록 수정되었지?
    userMap={userMap}
  />
  )}
          {/* 검색 모달 생략. 기존 코드와 동일한 로직으로 toggleSearchModal, setSearchTerm, setSelectedUser 등 디스패치 사용 */}

          {!selectedUser ? (
            <div style={{ textAlign: 'center', marginTop: '20%' }}>
              <h2 style={{ cursor: 'pointer' }} onClick={() => dispatch(toggleSearchModal(true))}>
                💬 채팅을 시작하세요
              </h2>
            </div>
          ) : (
            <div style={{ padding: 20, position: 'relative' }}>
              <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💬 {selectedUser.nickname}와의 채팅 (내 ID: {me})</span>
                <button
                  onClick={() => dispatch(exitRoom({ roomId, userId: me }))}
                  style={{ marginLeft: 10, padding: '4px 10px', background: '#eee', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
                >
                  나가기
                </button>
              </h2>
              <div ref={chatBoxRef} onScroll={handleScroll} style={{ border: '1px solid #ccc', padding: 10, height: 300, overflowY: 'scroll', marginBottom: 10 }}>
                {log.map((msg, idx) => {
                  const isMine = msg.senderId === me;
                  const sender = userMap[msg.senderId];
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-start', margin: '6px 0' }}>
                      {!isMine && (
                        <img src={sender.profileImage} alt="상대 프로필" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
                      )}
                      <div style={{ maxWidth: '70%' }}>
                        {!isMine && <div style={{ fontSize: 12, fontWeight: 'bold' }}>{sender.nickname}</div>}
                        <div style={{ padding: '8px 12px', borderRadius: 12, background: isMine ? '#d1f0ff' : '#f2f2f2' }}>{msg.content}</div>
                        <div style={{ fontSize: 11, textAlign: isMine ? 'right' : 'left' }}>{msg.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {showNewMsgAlert && (
                <div style={{ position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => {
                    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                    dispatch(setShowNewMsgAlert(false));
                  }}>
                  🔽 새 메시지 도착
                </div>
              )}

              <input
                value={message}
                onChange={(e) => dispatch(setMessage(e.target.value))}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="메시지를 입력하세요"
                style={{ width: '80%', padding: '8px' }}
              />
              <button onClick={handleSend} style={{ padding: '8px 16px', marginLeft: 8 }}>전송</button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
