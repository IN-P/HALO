// frontend/src/socket.js

import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // 백엔드 주소

// ★★★ 이 부분들을 추가하세요 ★★★
socket.on('connect', () => {
  console.log('🌐 Socket Connected! ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('💔 Socket Disconnected. Reason:', reason);
});

socket.on('connect_error', (error) => {
  console.error('⚠️ Socket Connection Error:', error);
});
// ★★★ 여기까지 추가 ★★★

export default socket;