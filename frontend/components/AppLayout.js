import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import { useSelector, useDispatch  } from 'react-redux';

// 알림창 - 준혁추가
import Notification from './Notification';
import { LOAD_USER_NOTIFICATION_REQUEST } from '../reducers/notification_JH';
import { IS_READ_TRUE_LOADING } from '../reducers/notification_JH';
//


const AppLayout = ({ children }) => {
  const dispatch = useDispatch();

  // 준혁 추가 : 로그인 한 사용자의 ID 추출
  const { user } = useSelector((state) => state.user_YG);
  console.log("ID:", user?.id);
  const userId = user?.id;
  //
  // 준혁 추가 : 알림창 토글
  const [showNotification, setShowNotification] = useState(false);
  const onToggleNotification = () => {
  setShowNotification((prev) => { const next = !prev; if (!prev && userId) {
      dispatch({
        type: IS_READ_TRUE_LOADING,
        data: userId,
      }); }
    return next;
    });
  };
  //
  // 해당하는 유저 아이디의 알림 가져오기
  const { notification } = useSelector((state) => state.notification_JH);
  useEffect(() => {
  if (userId) { dispatch({ type: LOAD_USER_NOTIFICATION_REQUEST, data: userId }); } }, [dispatch, userId]);
  // 미확인 알림 개수 카운트
  const notificationCount = notification
  ? notification.filter((item) => item.is_read === false).length
  : 0;
  console.log("읽지 않은 알림 개수:", notificationCount);

  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 고정 사이드바 | 준혁추가 : showNotification={showNotification} onToggleNotification={onToggleNotification} userId={userId} */}
      <Sidebar showNotification={showNotification} onToggleNotification={onToggleNotification} notificationCount={notificationCount}/>
      {/* 알림창 팝업 (showNotification true일 때만 보이게) */}
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
      <div style={{ marginLeft: 240, flex: 1, padding:24, minHeight: '100vh', background: '#ffffff' }} id='mainContents'>
        {children}
      </div>
      {/* 우측 사이드바 자리 (디자인만 잡아둠) */}
          <RightSidebar/>
      </div>
    
  );
};

export default AppLayout;
