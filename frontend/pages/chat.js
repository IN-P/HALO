import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList';
import SearchModal from '../components/SearchModal';
import ChatRoom from '../components/ChatRoom'; // ✅ ChatRoom 컴포넌트로 변경

import {
  joinRoom,
  exitRoom,
  sendMessage as sendMsg
} from '../sagas/chatSaga';

import {
  setSelectedUser,
  setMessage,
  clearLog,
  addLog,
  setSearchTerm,
  toggleSearchModal,
  setShowNewMsgAlert
} from '../reducers/chatReducer';

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
    dispatch(addLog(data));
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
      <div
        style={{
          display: 'flex',
          padding: '20px',
          height: 'calc(100vh - 80px)',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        <ChatList
          chatRooms={chatRooms}
          onSelectUser={(user) => dispatch(setSelectedUser(user))}
        />

        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          {showSearchModal && (
            <SearchModal
              onUserSelect={(user) => {
                dispatch(setSelectedUser(user));
                dispatch(toggleSearchModal(false));
              }}
              onClose={() => dispatch(toggleSearchModal(false))}
              userMap={userMap}
            />
          )}

          {!selectedUser ? (
            <div style={{ margin: 'auto' }}>
              <h2
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch(toggleSearchModal(true))}
              >
                💬 채팅을 시작하세요
              </h2>
            </div>
          ) : (
            <div style={{ width: '600px',
                          margin: '80px auto 0', // 위쪽 80px, 가운데 정렬
                          }}>
              <ChatRoom
                me={me}
                selectedUser={selectedUser}
                roomId={roomId}
                log={log}
                chatBoxRef={chatBoxRef}
                message={message}
                setMessage={(value) => dispatch(setMessage(value))}
                showNewMsgAlert={showNewMsgAlert}
                handleScroll={handleScroll}
                onExit={() => dispatch(exitRoom({ roomId, userId: me }))}
                onSendMessage={(msg) => {
                  dispatch(sendMsg(msg));
                  dispatch(setMessage(''));
                }}
                userMap={userMap}
                onClose={() => dispatch(setSelectedUser(null))}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
