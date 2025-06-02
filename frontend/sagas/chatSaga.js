import socket from '../socket';

// 초기 소켓 이벤트 리스너 등록
export const initSocket = (dispatch, getState) => {
  // 메시지 수신
  socket.on('receive_message', (message) => {
    dispatch({ type: 'ADD_LOG', payload: message });

    const { me } = getState().chat;
    const isMine = message.senderId === me;

    const chatBox = document.querySelector('#chat-box');
    const atBottom = chatBox
      ? chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100
      : true;

    if (!isMine && !atBottom) {
      dispatch({ type: 'SET_NEW_MSG_ALERT', payload: true });
    }
  });

  // 채팅방 나가기 성공
  socket.on('exit_room_success', () => {
    dispatch({ type: 'SET_SELECTED_USER', payload: null });
    dispatch({ type: 'CLEAR_LOG' });
    dispatch({ type: 'TOGGLE_SEARCH_MODAL' });
    alert('채팅방을 나갔습니다.');
  });

  // 채팅방 나가기 실패
  socket.on('exit_room_failed', (data) => {
    alert(`채팅방 나가기 실패: ${data.message || '알 수 없는 오류'}`);
    console.error('❌ exit_room_failed:', data);
  });
};

// 방 입장
export const joinRoom = (roomId, userId) => {
  socket.emit('join_room', roomId, userId);
};

// 메시지 전송
export const sendMessage = (msgObj) => {
  socket.emit('send_message', msgObj);
};

// 방 나가기
export const exitRoom = (roomId, userId) => {
  socket.emit('exit_room', { roomId, userId });
};