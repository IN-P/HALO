import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import Notification from './Notification';
import { LOAD_USER_NOTIFICATION_REQUEST, IS_READ_TRUE_LOADING } from '../reducers/notification_JH';
import { setChatRooms } from '../reducers/chatReducer_JW';
import socket from '../socket';
import axios from 'axios';

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();

  // ✅ 유저 정보
  const { user } = useSelector((state) => state.user_YG);
  const userId = user?.id;

  // ✅ 채팅용 me 정보
  const me = useSelector((state) => state.chat.me);

  // ✅ 알림창 토글
  const [showNotification, setShowNotification] = useState(false);
  const onToggleNotification = () => {
    setShowNotification((prev) => {
      const next = !prev;
      if (!prev && userId) {
        dispatch({
          type: IS_READ_TRUE_LOADING,
          data: userId,
        });
        setTimeout(() => {
          dispatch({
            type: LOAD_USER_NOTIFICATION_REQUEST,
            data: userId,
          });
        }, 300);
      }
      return next;
    });
  };

  // ✅ 알림 가져오기
  const { notification } = useSelector((state) => state.notification_JH);
  useEffect(() => {
    if (userId) {
      dispatch({ type: LOAD_USER_NOTIFICATION_REQUEST, data: userId });
    }
  }, [dispatch, userId]);

  // ✅ 미확인 알림 개수
  const notificationCount = notification
    ? notification.filter((item) => item.is_read === false).length
    : 0;

  // ✅ socket connect 시 내 채팅방들 join
  useEffect(() => {
    const handleConnect = () => {
      if (me && me.id) {
        socket.emit('login', me.id);

        axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
          .then((res) => {
            res.data.forEach((room) => {
              socket.emit('join_room', room.roomId, me.id);
            });
          })
          .catch((err) => {
            console.error('❌ [connect 후] my-rooms 조회 실패:', err);
          });
      }
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [me]);

  // ✅ me 변경 시 채팅방 join 다시
  useEffect(() => {
    if (socket.connected && me && me.id) {
      socket.emit('login', me.id);

      axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
        .then((res) => {
          res.data.forEach((room) => {
            socket.emit('join_room', room.roomId, me.id);
          });
        })
        .catch((err) => {
          console.error('❌ [me 변경] my-rooms 조회 실패:', err);
        });
    }
  }, [me]);

  // ✅ receive_message 수신 시 my-rooms 갱신
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log('📩 AppLayout에서 받은 메시지:', data);
      axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
        .then((res) => {
          dispatch(setChatRooms(res.data));
          console.log('🌍 AppLayout → receive_message 후 my-rooms 갱신:', res.data);
        })
        .catch((err) => {
          console.error('❌ AppLayout receive_message 후 my-rooms 갱신 실패:', err);
        });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [dispatch]);

  // ✅ new_chat_room_created 수신 시 my-rooms 갱신
  useEffect(() => {
    const handleNewChatRoom = (data) => {
      console.log('🌍 [AppLayout] new_chat_room_created 수신:', data);
      axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
        .then((res) => {
          dispatch(setChatRooms(res.data));
        })
        .catch((err) => {
          console.error('❌ AppLayout my-rooms 갱신 실패:', err);
        });
    };

    socket.on('new_chat_room_created', handleNewChatRoom);

    return () => {
      socket.off('new_chat_room_created', handleNewChatRoom);
    };
  }, [dispatch]);

  // ✅ 화면 렌더링
  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 고정 사이드바 */}
      <Sidebar
        showNotification={showNotification}
        onToggleNotification={onToggleNotification}
        notificationCount={notificationCount}
      />

      {/* 알림창 팝업 */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 240,
          height: '100vh',
          width: '20vw',
          backgroundColor: '#fff',
          borderRight: '1px solid #eee',
          boxShadow: '4px 0 10px rgba(0,0,0,0.08)',
          zIndex: 1100,
          overflowY: 'auto',
        }}>
          <Notification notification={notification} />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        style={{
          marginLeft: 240,
          flex: 1,
          padding: 24,
          minHeight: '100vh',
          background: '#ffffff',
        }}
        id="mainContents"
      >
        {children}
      </div>

      {/* 우측 사이드바 */}
      <RightSidebar />
    </div>
  );
};

export default AppLayout;
