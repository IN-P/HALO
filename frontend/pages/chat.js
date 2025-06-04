import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppLayout from '../components/AppLayout';
import ChatList from '../components/ChatList';
import SearchModal from '../components/SearchModal';
import ChatRoom from '../components/ChatRoom';
import axios from 'axios';
import { setChatRooms, sendMessage as sendMsg } from '../reducers/chatReducer_JW';
import {
  setSelectedUser,
  setMessage,
  clearLog,
  addLog,
  toggleSearchModal,
  setShowNewMsgAlert,
  exitRoom
} from '../reducers/chatReducer_JW';

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
    chatRooms,
  } = useSelector((state) => state.chat);

  const chatBoxRef = useRef();
  const [userMap, setUserMap] = useState({});

  const roomId = selectedUser ? `chat-${[me, selectedUser.id].sort().join('-')}` : null;

  // 1. 최초 1회 - 전체 유저 목록 가져오기
  useEffect(() => {
    axios.get('http://localhost:3065/userSearch/all', { withCredentials: true })
      .then(res => {
        const map = {};
        res.data.forEach(user => {
          map[user.id] = {
            id: user.id,
            nickname: user.nickname,
            profileImage: user.profile_img,
          };
        });
        setUserMap(map);
      })
      .catch(err => {
        console.error('❌ 유저 목록 불러오기 실패:', err);
      });
  }, []);

  // 2. socket 리스너: receive_message (딱 1번만 등록)
  const handleReceive = useCallback((data) => {
    if (!roomId || data.roomId !== roomId) {
      // 현재 안 보고 있는 채팅방 메시지면 새 메시지 알림만 띄움
      dispatch(setShowNewMsgAlert(true));
      return;
    }

    // 현재 보고 있는 채팅방이면 메시지 로그 추가
    dispatch(addLog(data));
  }, [dispatch, roomId]);

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
    socket.on('receive_message', handleReceive);
    socket.on('exit_room_success', handleExitSuccess);
    socket.on('exit_room_failed', handleExitFailed);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('exit_room_success', handleExitSuccess);
      socket.off('exit_room_failed', handleExitFailed);
    };
  }, [handleReceive, handleExitSuccess, handleExitFailed]);

  // 3. roomId가 바뀔 때마다 join_room emit
  useEffect(() => {
    if (roomId) {
      socket.emit('join_room', roomId, me);
    }
  }, [roomId, me]);

  // 4. 채팅방 목록은 최초 1회만 불러오기
  useEffect(() => {
    axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
      .then(res => {
        dispatch(setChatRooms(res.data));
      })
      .catch(err => {
        console.error('❌ 채팅방 목록 불러오기 실패:', err);
      });
  }, [dispatch]);

  // 5. 스크롤 및 새 메시지 알림 관리
  const isAtBottom = () => {
    const box = chatBoxRef.current;
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight < 100;
  };

  const handleScroll = () => {
    if (isAtBottom()) dispatch(setShowNewMsgAlert(false));
  };

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

  // 6. 메시지 보내기 함수
  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    dispatch(sendMsg({ roomId, senderId: me, content: message }));
    dispatch(setMessage(''));
  };

  return (
    <AppLayout>
      <div style={{
        display: 'flex',
        padding: '20px',
        height: 'calc(100vh - 80px)',
        gap: '20px',
        boxSizing: 'border-box',
      }}>
        <ChatList
          chatRooms={chatRooms}
          onSelectUser={(user) => dispatch(setSelectedUser(user))}
        />

        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          position: 'relative',
        }}>
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
            <div style={{ width: 600, margin: '80px auto 0' }}>
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
                onSendMessage={handleSend}
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
