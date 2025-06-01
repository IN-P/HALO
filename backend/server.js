// backend/server.js
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app');
const { ChatRoom, ChatMessage, ChatRoomExit, Sequelize } = require('./models');

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

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
        console.log(`🆕 채팅방 생성: ID ${chatRoomInstance.id}`);

        await ChatRoomExit.create({
          chat_rooms_id: chatRoomInstance.id,
          user1_id_active: true,
          user2_active: true
        });
        console.log(`✅ ChatRoomExit 생성됨`);
      }

      await ChatMessage.create({
        rooms_id: chatRoomInstance.id,
        sender_id: senderId,
        content: content
      });

      io.to(roomId).emit('receive_message', data);
    } catch (err) {
      console.error('❌ 메시지 전송 실패:', err);
    }
  });

  socket.on('exit_room', async ({ roomId, userId }) => {
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
      if (!chatRoom) return;

      const exitInfo = await ChatRoomExit.findOne({
        where: { chat_rooms_id: chatRoom.id }
      });
      if (!exitInfo) return;

      const fieldToUpdate = (userId === sortedUser1Id)
        ? 'user1_id_active'
        : (userId === sortedUser2Id)
          ? 'user2_active'
          : null;

      if (!fieldToUpdate) return;

      await exitInfo.update({ [fieldToUpdate]: false });

      console.log(`🚪 유저 ${userId} 나감 (room ${chatRoom.id})`);
      socket.to(roomId).emit('user_exited', { userId });
    } catch (err) {
      console.error('❌ exit_room 에러:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 유저 연결 해제:', socket.id);
  });
});

const PORT = process.env.PORT || 3065;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중! http://localhost:${PORT}`);
});
