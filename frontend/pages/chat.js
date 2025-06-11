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
  exitRoom,
  loadMessagesRequest, // SAGA 액션을 직접 사용하도록 추가
  updateChatRoomLastMessage,
} from '../reducers/chatReducer_JW';
import useRequireLogin from '../hooks/useRequireLogin';

import socket from '../socket';


const ChatPage = () => {
  useRequireLogin();
  const dispatch = useDispatch();
  const {
    me, // 현재 로그인한 사용자 정보 (ID가 필요)
    selectedUser,
    message,
    log,
    showNewMsgAlert,
    showSearchModal,
    chatRooms,
  } = useSelector((state) => state.chat);
  

  const chatBoxRef = useRef();
  const [userMap, setUserMap] = useState({});
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

const handleReadUpdate = useCallback((readMessageIdsRaw) => {
  const readMessageIds = Array.isArray(readMessageIdsRaw) ? readMessageIdsRaw : [readMessageIdsRaw];

  console.log('handleReadUpdate 호출됨:', readMessageIds, '타입:', readMessageIds.map(id => typeof id));

  dispatch({
    type: 'UPDATE_READ_STATUS',
    payload: { readMessageIds }
  });
}, [dispatch]);

  // ⭐ 변경 1: roomId 계산 로직을 selectedUser가 null이 아닐 때만 유효하게
  // selectedUser가 존재하고, me.id와 selectedUser.id가 다를 때만 roomId를 생성
  const roomId = selectedUser && me && (me.id !== selectedUser.id)
    ? `chat-${[me.id, selectedUser.id].sort((a, b) => a - b).join('-')}`
    : null; // selectedUser가 null이거나, 자기 자신이라면 roomId도 null

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
  console.log('➡️ receive_message 이벤트 수신됨 (클라이언트):', data);

  dispatch(updateChatRoomLastMessage({
    roomId: data.roomId,
    lastMessage: data.content,
    lastTime: new Date(data.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    unreadCountDelta: (!selectedUser || roomId !== data.roomId) ? 1 : 0,  // ⭐ 원래 이렇게 쓰던거 다시 써
  }));

  if (!selectedUser || !roomId || data.roomId !== roomId) {
    console.log('다른 방 메시지이거나 방이 선택되지 않음:', data.roomId, '현재 roomId:', roomId);
    dispatch(setShowNewMsgAlert(true));
    return;
  }

  console.log('현재 방 메시지! log에 추가:', data);
  const formattedMessage = {
    ...data,
    sender_id: data.sender_id,
    User: data.User,
    created_at: data.created_at,
    time: new Date(data.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    is_read: data.is_read
  };
  dispatch(addLog(formattedMessage));
}, [dispatch, roomId, selectedUser]); // 의존성 배열에 selectedUser 추가

  const handleExitSuccess = useCallback(() => {
    alert('채팅방을 나갔습니다.');
    dispatch(setSelectedUser(null)); // 채팅방 나간 후 selectedUser 초기화
    dispatch(clearLog());
    // dispatch(toggleSearchModal(false)); // 불필요할 수 있음
  }, [dispatch]);

  const handleExitFailed = useCallback((data) => {
    alert(`채팅방 나가기 실패: ${data.message || '알 수 없는 오류'}`);
  }, []);

  useEffect(() => {
  const handleConnect = () => {
    console.log('🟢 소켓 connected, login emit 보냄:', me?.id);
    if (me && me.id) {
      socket.emit('login', me.id);
    }
  };

  socket.on('connect', handleConnect);

  return () => {
    socket.off('connect', handleConnect);
  };
}, [me]);

useEffect(() => {
  socket.on('receive_message', handleReceive);
  socket.on('exit_room_success', handleExitSuccess);
  socket.on('exit_room_failed', handleExitFailed);
  socket.on('read_update', handleReadUpdate);

  // ⭐ 요기 추가
  const handleNewChatRoom = (data) => {
    console.log('🔔 new_chat_room_created 수신:', data);
    axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
      .then((res) => {
        console.log('🌍 [AppLayout] /my-rooms 응답:', res.data);
        dispatch(setChatRooms(res.data));
      })
      .catch((err) => {
        console.error('❌ my-rooms 갱신 실패:', err);
      });
  };

  socket.on('new_chat_room_created', handleNewChatRoom);
  const handleChatRoomClosed = (data) => {
    console.log('💥 chat_room_closed 수신 (global ChatPage):', data);
    alert(data.message || '상대방이 채팅방을 나갔습니다. 채팅을 새로 시작해야 합니다.');
  };
  socket.on('chat_room_closed', handleChatRoomClosed);

  return () => {
    socket.off('receive_message', handleReceive);
    socket.off('exit_room_success', handleExitSuccess);
    socket.off('exit_room_failed', handleExitFailed);
    socket.off('read_update', handleReadUpdate);
    socket.off('chat_room_closed', handleChatRoomClosed);

    // ⭐ clean up 도 같이
    socket.off('new_chat_room_created', handleNewChatRoom);
  };
}, [handleReceive, handleExitSuccess, handleExitFailed, handleReadUpdate, dispatch, me]);

  // ⭐ 변경 3: 유저 선택 핸들러 (SearchModal, ChatList에서 공통으로 사용)
const handleUserSelect = useCallback(async (user) => { 
  if (!me || user.id === me.id) {
    alert('본인과 채팅을 시작할 수 없습니다.');
    dispatch(setSelectedUser(null));
    dispatch(clearLog());
    dispatch(toggleSearchModal(false));
    return;
  }

  try {
    const res = await axios.post('http://localhost:3065/api/chat', {
      targetUserId: user.id,
    }, { withCredentials: true });

    console.log('✅ POST /api/chat 응답:', res);

    setSelectedChatRoomId(res.data.id);

    dispatch(updateChatRoomLastMessage({
      roomId: `chat-${[me.id, user.id].sort((a, b) => a - b).join('-')}`,
      lastMessage: '', // 그대로 두거나 유지 (원하면 ''로 두기)
      lastTime: '', // 그대로 두거나 유지 (원하면 ''로 두기)
      unreadCountDelta: -9999, // 강제로 0 처리됨 (reducer에서 Math.max(0, unreadCount + delta))
    }));

    dispatch(setSelectedUser(user));
    dispatch(toggleSearchModal(false));
  } catch (error) {
    console.error('❌ 채팅방 생성 실패:', error);
    alert(error.response?.data || '채팅방 생성 중 오류가 발생했습니다.');
  }
}, [dispatch, me]);
  


  // 3. roomId가 바뀔 때마다 join_room emit 및 과거 메시지 로드
  useEffect(() => {
    if (roomId && me && selectedUser) { // roomId, me, selectedUser 모두 유효할 때 실행
        dispatch(clearLog()); 

        // 1. 먼저 채팅방 생성/조회 API 호출 (POST /api/chat)
        axios.post('http://localhost:3065/api/chat', { targetUserId: selectedUser.id }, { withCredentials: true })
            .then(postResponse => {
                console.log('✅ 채팅방 생성/조회 성공 (POST /api/chat):', postResponse.data);
                
                // 2. 채팅방이 존재하거나 새로 생성되었으면 메시지 로드
                return axios.get(`http://localhost:3065/api/chat/message/${roomId}`, { withCredentials: true });
            })
            .then(getResponse => {
                console.log('✅ 과거 메시지 로드 성공 (GET /api/chat/message):', getResponse.data);
                getResponse.data.reverse().forEach(msg => dispatch(addLog(msg)));
                requestAnimationFrame(() => {
                    if (chatBoxRef.current) {
                        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
                    }
                });
                // 3. Socket.IO 방 조인 (API 호출 성공 후)
                socket.emit('join_room', roomId, me.id);
                console.log('클라이언트: join_room 요청 보냄', roomId, me);

            })
            .catch(error => {
                console.error('❌ 채팅방 또는 메시지 로드 실패:', error);
                if (error.response) {
                     alert(error.response.data || '채팅방 로드 중 오류가 발생했습니다.');
                     dispatch(setSelectedUser(null));
                     dispatch(clearLog());
                } else {
                    alert('알 수 없는 오류가 발생했습니다.');
                }
            });
    }
}, [roomId, me, selectedUser, dispatch]);

  // 4. 채팅방 목록은 최초 1회 및 변경 시 불러오기 (useSelector로 chatRooms가 관리되므로)
  useEffect(() => {
    if (me && me.id) {
      axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
        .then(res => {
          dispatch(setChatRooms(res.data));
          console.log('📦 [ChatPage] my-rooms 강제 갱신됨:', res.data);
        })
        .catch(err => {
          console.error('❌ 채팅방 목록 불러오기 실패:', err);
        });
    }
  }, [dispatch, me, selectedUser]); // me 의존성 추가 (로그인 정보 받아온 후 실행)

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
    // 마지막 메시지가 내가 보낸 것이거나, 이미 스크롤이 최하단에 있었다면 스크롤
    if (chatBoxRef.current && (lastMsg.senderId === me.id || wasAtBottom)) {
    requestAnimationFrame(() => {
      if (chatBoxRef.current) { // 여기 한번 더 체크
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    });
      dispatch(setShowNewMsgAlert(false));
    } else {
      // 새로운 메시지가 왔고 스크롤이 최하단이 아니라면 알림
      dispatch(setShowNewMsgAlert(true));
    }
  }, [log, me, dispatch]); // 의존성 배열에 me.id 대신 me 전체로 변경 (객체 비교 주의)

  // 6. 메시지 보내기 함수
  const handleSend = useCallback(() => {
    // ⭐ 변경 5: me.id가 유효한지 다시 확인
    if (!message.trim() || !selectedUser || !me || !me.id) return;
    // ⭐ 변경 6: sendMsg 액션에 roomId, senderId (me.id) 정확히 전달
    dispatch(sendMsg({ roomId, senderId: me.id, content: message })); // senderId를 me.id로 변경
    dispatch(setMessage(''));
  }, [dispatch, message, selectedUser, roomId, me]);


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
          onSelectUser={handleUserSelect} // ⭐ 변경 7: 공통 핸들러 사용
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
              onUserSelect={handleUserSelect} // ⭐ 변경 8: 공통 핸들러 사용
              onClose={() => dispatch(toggleSearchModal(false))}
              userMap={userMap}
            />
          )}

          {!selectedUser ? (
            <div style={{ margin: 'auto' }}>
              <h2
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    // ⭐ 변경 9: 검색 모달 열기 전에 selectedUser 초기화 (혹시 모를 오류 방지)
                    dispatch(setSelectedUser(null));
                    dispatch(clearLog());
                    dispatch(toggleSearchModal(true));
                }}
              >
                💬 채팅을 시작하세요
              </h2>
            </div>
          ) : (
            // ⭐ 변경 10: selectedUser가 있을 때만 ChatRoom 렌더링하도록 확실히
            // roomId가 null이면 ChatRoom도 렌더링되지 않도록 조건을 추가할 수도 있음.
            // 하지만 현재 selectedUser가 null이 아니면 roomId도 대부분 유효할 것이므로 괜찮음.
            <div style={{ width: 600, margin: '80px auto 0' }}>
              <ChatRoom
                me={me}
                selectedUser={selectedUser}
                roomId={roomId} // roomId가 null이면 ChatRoom 내부에서 적절히 처리해야 함
                log={log}
                chatBoxRef={chatBoxRef}
                message={message}
                setMessage={(value) => dispatch(setMessage(value))}
                showNewMsgAlert={showNewMsgAlert}
                handleScroll={handleScroll}
                onExit={async () => {
  try {
    dispatch(exitRoom({ roomId, userId: me.id }));

    await axios.patch(`http://localhost:3065/api/chat/${selectedChatRoomId}/exit`, {}, { withCredentials: true });
    console.log('✅ PATCH /exit 요청 완료');
  } catch (error) {
    console.error('❌ PATCH /exit 요청 에러:', error);
  }
}} // ⭐ me.id로 전달
                onSendMessage={handleSend}
                userMap={userMap}
                onClose={() => {
                  //socket.emit('leave_room', me.id);
                    dispatch(setSelectedUser(null)); // 채팅방 닫을 때 selectedUser 초기화
                    dispatch(clearLog()); // 로그도 초기화
                }}
                onReadUpdate={handleReadUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;