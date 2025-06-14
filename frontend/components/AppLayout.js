import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import Notification from './Notification';
import { LOAD_USER_NOTIFICATION_REQUEST, IS_READ_TRUE_REQUEST, DELETE_NOTIFICATION_REQUEST, DELETE_ALL_NOTIFICATION_REQUEST  } from '../reducers/notification_JH';
import { setChatRooms } from '../reducers/chatReducer_JW';
import socket, { registerUserSocket, subscribeToNotifications, unsubscribeFromNotifications } from '../socket';
import axios from 'axios';
import styled from 'styled-components';

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const chatRooms = useSelector((state) => state.chat.chatRooms);

  const [themeMode, setThemeMode] = useState('light');
  // ✅ 유저 정보
  const { user } = useSelector((state) => state.user_YG);

  const userId = user?.id;

  // ✅ 채팅용 me 정보
  const me = useSelector((state) => state.chat.me);

  const chatMe = useSelector((state) => state.chat.me);

  // ✅ 알림창 토글
  const [showNotification, setShowNotification] = useState(false);
  const onToggleNotification = () => {
    setShowNotification((prev) => {
      const next = !prev;
      if (userId) {
        dispatch({
          type: IS_READ_TRUE_REQUEST,
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

    // 테마 모드 설정
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_mode') || 'light';
    setThemeMode(savedTheme);
    document.body.className = savedTheme === 'dark' ? 'dark-mode' : 'light-mode';
  }, []);

  const handleToggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('theme_mode', newTheme);
    document.body.className = newTheme === 'dark' ? 'dark-mode' : 'light-mode';
    console.log('Current theme:', newTheme);  // 확인용 로그 추가
  console.log('Current body class:', document.body.className);  // 확인용 로그 추가
  };
  
  // 해당하는 유저 아이디의 알림 가져오기
  const { notification } = useSelector((state) => state.notification_JH);
  useEffect(() => {
  if (userId) { dispatch({ type: LOAD_USER_NOTIFICATION_REQUEST, data: userId }); } }, [dispatch, userId]);
  // 미확인 알림 개수 카운트
  // 중요핮 않은 미확인 알림 개수 카운트
  const notificationCount = Array.isArray(notification)
    ? notification.filter(item => item.is_read === false && item.target_type_id !== 9 && item.target_type_id !== 10).length
    : 0;
  // 중요한 알림 개수 카운트
  const importantCount = Array.isArray(notification)
    ? notification.filter(item => item.target_type_id === 9 || item.target_type_id === 10).length
    : 0;
  console.log("읽지 않은 알림 개수:", notificationCount);
  // 알림 삭제
  const onDeleteNotification = (notificationId) => { if (!userId) return;
    dispatch({ type: DELETE_NOTIFICATION_REQUEST, data: { userId, notificationId, }, }); };
  // 전체 알림 삭제
  const onDeleteAllNotification = () => { dispatch({ type: DELETE_ALL_NOTIFICATION_REQUEST, data: { userId }, }); };
  // 실시간 알림
  useEffect(() => { if (!userId) return;
    registerUserSocket(userId); // 서버에 유저 ID 등록
  // 알림 받기
  subscribeToNotifications((data) => {
    console.log('📩 알림 수신:', data);
    dispatch({ type: LOAD_USER_NOTIFICATION_REQUEST, data: userId });
  });
  return () => { unsubscribeFromNotifications(); }; }, [userId]);

useEffect(() => {
  if (user && user.id && (!chatMe || !chatMe.id)) {
    console.log('🌍 AppLayout → user_YG.user 기반으로 chat.me 복구 시도');
    dispatch({ type: 'SET_ME', payload: user });
  }
}, [user, chatMe, dispatch]);

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

      
      if (!chatRooms.some(room => room.roomId === data.roomId)) {
      axios.get('http://localhost:3065/api/chat/my-rooms', { withCredentials: true })
        .then((res) => {
          dispatch(setChatRooms(res.data));
        })
        .catch((err) => {
          console.error('❌ AppLayout my-rooms 갱신 실패:', err);
        });
    }
  };

    socket.on('new_chat_room_created', handleNewChatRoom);

    return () => {
      socket.off('new_chat_room_created', handleNewChatRoom);
    };
  }, [dispatch, chatRooms]);

  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const RightSidebarLimit = windowWidth > 1720;
  const LeftSidebarLimit = windowWidth > 1580;

  // ✅ 화면 렌더링
  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 고정 사이드바 */}
      { LeftSidebarLimit && (  
        <Sidebar
          showNotification={showNotification}
          onToggleNotification={onToggleNotification}
          notificationCount={notificationCount}
          importantCount={importantCount}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* 알림창 팝업 */}
      {showNotification && LeftSidebarLimit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 240,
          height: '100vh',
          width: '20vw',
          //backgroundColor: '#fff',
          borderRight: '1px solid #eee',
          boxShadow: '4px 0 10px rgba(0,0,0,0.08)',
          zIndex: 1100,
          overflowY: 'auto',
        }}>
          <Notification notification={notification} onDeleteNotification={onDeleteNotification} onDeleteAllNotification={onDeleteAllNotification} />
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div
        style={{
          marginLeft: LeftSidebarLimit ? 240 : 0,
          flex: 1,
          padding: 24,
          minHeight: '100vh',
          //background: '#ffffff',
        }}
        id="mainContents"
        className="main-contents"
      >
        {children}
      </div>

      {/* 우측 사이드바 */}
      { RightSidebarLimit && (  
        <RightSidebar />
      )}
    </div>
  );
};

export default AppLayout;
