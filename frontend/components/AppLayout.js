import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'; // 추가!
import { setChatRooms } from '../reducers/chatReducer_JW';
import { useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import socket from '../socket';
import axios from 'axios';

const AppLayout = ({ children }) => {

  const me = useSelector((state) => state.chat.me);
  const dispatch = useDispatch();

useEffect(() => {
  const handleConnect = () => {
    if (me && me.id) {
      socket.emit('login', me.id);

      // 🔥 여기 추가 → 내가 참여중인 채팅방들 join_room 강제 emit 보내기
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
      // 여기서 dispatch 해도 되고 → 아니면 전역 상태 업데이트 가능
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);


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

  return (
    <div style={{ display: 'flex' }}>
      {/* 좌측 고정 사이드바 */}
      <Sidebar />
      {/* 메인 콘텐츠 */}
      <div style={{ marginLeft: 240, flex: 1, padding: 24, minHeight: '100vh', background: '#ffffff' }}>
        {children}
      </div>
      {/* 우측 사이드바 */}
      <RightSidebar />
    </div>
  );
};

export default AppLayout;