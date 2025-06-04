import { takeEvery, call } from 'redux-saga/effects';
import socket from '../socket';

export const SEND_MESSAGE_REQUEST = 'SEND_MESSAGE_REQUEST'; 
export const JOIN_ROOM_REQUEST = 'JOIN_ROOM_REQUEST';
export const EXIT_ROOM_REQUEST = 'EXIT_ROOM_REQUEST';

export const sendMessage = (payload) => ({
  type: SEND_MESSAGE_REQUEST,
  payload,
});

export const joinRoom = (payload) => ({
  type: JOIN_ROOM_REQUEST,
  payload,
});

export const exitRoom = (payload) => ({
  type: EXIT_ROOM_REQUEST,
  payload,
});

// 메시지 전송
function* sendMessageSaga(action) {
  try {
    yield call([socket, 'emit'], 'send_message', action.payload);
    console.log('✅ Saga: 메시지 소켓 전송 성공:', action.payload);
  } catch (error) {
    console.error('❌ Saga: 메시지 전송 실패:', error);
  }
}

// 채팅방 입장
function* joinRoomSaga(action) {
  try {
    const { roomId, userId } = action.payload;
    yield call([socket, 'emit'], 'join_room', roomId, userId);
    console.log('✅ Saga: 채팅방 입장 소켓 전송 성공:', action.payload);
  } catch (error) {
    console.error('❌ Saga: 채팅방 입장 실패:', error);
  }
}

// 채팅방 나가기
function* exitRoomSaga(action) {
  try {
    const { roomId, userId } = action.payload;
    yield call([socket, 'emit'], 'exit_room', { roomId, userId });
    console.log('✅ Saga: 채팅방 나가기 소켓 전송 성공:', action.payload);
  } catch (error) {
    console.error('❌ Saga: 채팅방 나가기 실패:', error);
  }
}

// 모든 Saga 리스너 연결
export default function* chatSaga() {
  yield takeEvery(SEND_MESSAGE_REQUEST, sendMessageSaga);
  yield takeEvery(JOIN_ROOM_REQUEST, joinRoomSaga);
  yield takeEvery(EXIT_ROOM_REQUEST, exitRoomSaga);
}
