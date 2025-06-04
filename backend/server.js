const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app'); 
const { ChatRoom, ChatMessage, ChatRoomExit, Sequelize } = require('./models'); 
const session = require('express-session'); // 세션 직접 생성
const sharedSession = require('express-socket.io-session');

// .env 로드
dotenv.config();

// 서버 + 소켓 생성
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ app.js와 동일한 세션 설정 복제
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: { httpOnly: true, secure: false },
});

// ✅ 소켓에 세션 공유 적용
io.use(sharedSession(sessionMiddleware, {
  autoSave: true,
}));

// ✅ 소켓 연결 시
io.on('connection', (socket) => {
  console.log('🟢 유저 접속:', socket.id);

  // 채팅방 참여
  socket.on('join_room', async (roomId, userId) => {
    socket.join(roomId);
    console.log(`🔗 ${socket.id} joined room ${roomId}`);

    try {
      const parts = roomId.split('-');
      const user1Id = parseInt(parts[1]);
      const user2Id = parseInt(parts[2]);
      const sortedUser1Id = Math.min(user1Id, user2Id);
      const sortedUser2Id = Math.max(user1Id, user2Id);

      const chatRoom = await ChatRoom.findOne({
        where: {
          user1_id: sortedUser1Id,
          user2_id: sortedUser2Id
        }
      });

      if (!chatRoom) {
        console.log(`🚫 채팅방 없음: ${roomId}`);
        return;
      }

      const updatedCount = await ChatMessage.update(
        { is_read: true },
        {
          where: {
            rooms_id: chatRoom.id,
            sender_id: { [Sequelize.Op.ne]: userId },
            is_read: false
          }
        }
      );
      console.log(`✅ 유저 ${userId} 안읽은 메시지 읽음 처리 완료 (${updatedCount[0]}건)`);
    } catch (err) {
      console.error('❌ join_room 중 에러 발생:', err);
    }
  });

  // 메시지 전송
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
        console.log(`🆕 채팅방 생성: ID ${chatRoomInstance.id}`);

        await ChatRoomExit.create({
          chat_rooms_id: chatRoomInstance.id,
          user1_id_active: true,
          user2_id_active: true
        });
        console.log(`✅ ChatRoomExit 생성됨 for room ${chatRoomInstance.id}`);
      } else {
        const exitInfo = await ChatRoomExit.findOne({
          where: { chat_rooms_id: chatRoomInstance.id }
        });
        if (!exitInfo) {
          await ChatRoomExit.create({
            chat_rooms_id: chatRoomInstance.id,
            user1_id_active: true,
            user2_id_active: true
          });
          console.log(`🔄 누락된 ChatRoomExit 복구됨 (room ${chatRoomInstance.id})`);
        }
      }

      await ChatMessage.create({
        rooms_id: chatRoomInstance.id,
        sender_id: senderId,
        content: content,
        is_read: false
      });

      console.log('💬 메시지 저장 완료:', { roomId, senderId, content });

      io.to(roomId).emit('receive_message', data);
    } catch (err) {
      console.error('❌ 메시지 전송 실패:', err);
    }
  });

  // 채팅방 나가기
  socket.on('exit_room', async ({ roomId, userId }) => {
    console.log(`[EXIT_ROOM] 요청: ${roomId}, 유저 ${userId}`);
    try {
      const parts = roomId.split('-');
      const user1Id = parseInt(parts[1]);
      const user2Id = parseInt(parts[2]);
      const sortedUser1Id = Math.min(user1Id, user2Id);
      const sortedUser2Id = Math.max(user1Id, user2Id);

      const chatRoom = await ChatRoom.findOne({
        where: {
          [Sequelize.Op.or]: [
            { user1_id: sortedUser1Id, user2_id: sortedUser2Id },
            { user1_id: sortedUser2Id, user2_id: sortedUser1Id }
          ]
        }
      });

      if (!chatRoom) {
        console.log(`[EXIT_ROOM] 채팅방 없음`);
        socket.emit('exit_room_failed', { message: '채팅방을 찾을 수 없습니다.' });
        return;
      }

      const exitInfo = await ChatRoomExit.findOne({
        where: { chat_rooms_id: chatRoom.id }
      });

      if (!exitInfo) {
        socket.emit('exit_room_failed', { message: '채팅방 정보가 없습니다.' });
        return;
      }

      const fieldToUpdate = (userId === sortedUser1Id)
        ? 'user1_id_active'
        : (userId === sortedUser2Id)
          ? 'user2_id_active'
          : null;

      if (!fieldToUpdate) {
        socket.emit('exit_room_failed', { message: '채팅방 참여자가 아닙니다.' });
        return;
      }

      await exitInfo.update({ [fieldToUpdate]: false });
      console.log(`🚪 유저 ${userId}가 채팅방 ${chatRoom.id}에서 나감`);
      socket.emit('exit_room_success', { roomId, userId });
    } catch (err) {
      console.error('[EXIT_ROOM] 에러:', err);
      socket.emit('exit_room_failed', { message: '서버 오류 발생' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 유저 연결 해제:', socket.id);
  });
});

// 서버 실행
const PORT = process.env.PORT || 3065;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중! http://localhost:${PORT}`);
});
