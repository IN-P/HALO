// backend/app.js

const express = require('express');
const http = require('http'); // ✅ 소켓 통합을 위해 http 모듈로 감싸야 함
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const chatController = require('./controllers/chatController');
const { ChatRoom, ChatMessage, User, Sequelize, sequelize } = require('./models');

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ express app을 감싼 http server

// ✅ socket.io 설정
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// ✅ 미들웨어
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: { httpOnly: true, secure: false },
}));

// ✅ DB 연결 (주의: 배포 시 force: true 제거)
sequelize.sync()
  .then(() => console.log('✅ DB 연결 및 동기화 완료'))
  .catch(err => {
    console.error('❌ DB 연결 실패:', err);
    process.exit(1);
  });

// ✅ 테스트용 라우터
app.get('/api/chat/test', chatController.testController);

// ✅ 소켓 연결
io.on('connection', (socket) => {
  console.log('🟢 유저 접속:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`🔗 ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    const { roomId, senderId, content } = data;

    try {
      const parts = roomId.split('-');
      const user1Id = parseInt(parts[1]);
      const user2Id = parseInt(parts[2]);

      const sortedUser1Id = Math.min(user1Id, user2Id);
      const sortedUser2Id = Math.max(user1Id, user2Id);

      let chatRoomInstance = await ChatRoom.findOne({
        where: {
          [Sequelize.Op.or]: [
            { user1_id: sortedUser1Id, user2_id: sortedUser2Id },
            { user1_id: sortedUser2Id, user2_id: sortedUser1Id }
          ]
        }
      });

      if (!chatRoomInstance) {
        chatRoomInstance = await ChatRoom.create({
          user1_id: sortedUser1Id,
          user2_id: sortedUser2Id
        });
        console.log(`새로운 채팅방 생성: ID ${chatRoomInstance.id}`);
      }

      await ChatMessage.create({
        rooms_id: chatRoomInstance.id,
        sender_id: senderId,
        content: content
      });

      console.log('💬 메시지 저장 완료:', { roomId, senderId, content });
      io.to(roomId).emit('receive_message', data);
    } catch (err) {
      console.error('❌ 메시지 저장 실패:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 유저 연결 해제:', socket.id);
  });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3065;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중! http://localhost:${PORT}`);
});
