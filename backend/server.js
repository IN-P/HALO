// backend/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chatController = require('./controllers/chatController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // 프론트 포트에 맞게 설정
    methods: ['GET', 'POST']
  }
});

// ✅ JSON 파싱 미들웨어 추가 (POST 처리용) // ##
app.use(express.json()); // ##

// ✅ 테스트용 라우터 추가 (API 확인용) // ##
app.get('/api/chat/test', chatController.testController); // ##

io.on('connection', (socket) => {
  console.log('🟢 유저 접속:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`🔗 ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 유저 연결 해제:', socket.id);
  });
});

server.listen(4000, () => {
  console.log('✅ Socket.IO 서버 실행 중 (http://localhost:4000)');
});
