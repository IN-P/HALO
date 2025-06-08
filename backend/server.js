const http = require('http');
const { sequelize } = require('./models');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app'); 
const { ChatRoom, ChatMessage, ChatRoomExit, Sequelize, User  } = require('./models'); 
const session = require('express-session'); 
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

const socketMap = {};
// ✅ 소켓 연결 시
io.on('connection', (socket) => {
  console.log('🟢 유저 접속:', socket.id);

  socket.on('login', (userId) => {
    socket.userId = userId;
    socketMap[userId] = { socketId: socket.id, currentRoomId: null };
    console.log(`✅ 유저 로그인 등록됨 → userId=${userId}, socket.id=${socket.id}`);
  });

  socket.on('leave_room', (userId) => {
    if (socketMap[userId]) {
      socketMap[userId].currentRoomId = null;
      console.log(`🚪 유저 ${userId} 채팅방 나감 → currentRoomId null 처리`);
    }
  });

  // 수정된 join_room 전체
  socket.on('join_room', async (roomId, userId) => {
    socket.join(roomId);
    if (socketMap[userId]) {
      socketMap[userId].currentRoomId = roomId;
    }
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

      // ⭐⭐ 핵심: update 먼저 처리
      await ChatMessage.update(
        { is_read: true },
        {
          where: {
            rooms_id: chatRoom.id,
            sender_id: { [Sequelize.Op.ne]: userId },
            is_read: false
          }
        }
      );

      // 그 다음 SELECT → 최신 readMessageIds 조회
      const updatedMessages = await ChatMessage.findAll({
        where: {
          rooms_id: chatRoom.id,
          sender_id: { [Sequelize.Op.ne]: userId },
          is_read: true
        },
        attributes: ['id']
      });

      const readMessageIds = updatedMessages.map(msg => msg.id);

      const senderUserId = (userId === sortedUser1Id) ? sortedUser2Id : sortedUser1Id;

      if (socketMap[senderUserId]) {
        const senderSocketId = socketMap[senderUserId].socketId;
        io.to(senderSocketId).emit('read_update', {
          roomId,
          readerId: userId,
          readMessageIds
        });
        console.log(`[SERVER] read_update emit → senderUserId=${senderUserId}, readMessageIds=${readMessageIds}`);
      }
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
        } else {
          const fieldToUpdate = (senderId === sortedUser1Id)
            ? 'user1_id_active'
            : (senderId === sortedUser2Id)
              ? 'user2_id_active'
              : null;

          const exitedAtField = (fieldToUpdate === 'user1_id_active') ? 'user1_exited_at' : 'user2_exited_at';

          if (fieldToUpdate) {
            await exitInfo.update({
              [fieldToUpdate]: true,
              [exitedAtField]: null
            });
            console.log(`✅ ChatRoomExit active 복구됨 (senderId=${senderId})`);
          }
        }
      }

      const newMessage = await ChatMessage.create({
        rooms_id: chatRoomInstance.id,
        sender_id: senderId,
        content: content,
        is_read: false
      });

      const messageWithUser = await ChatMessage.findByPk(newMessage.id, {
        include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }]
      });

      const messageToSend = {
        ...messageWithUser.toJSON(),
        roomId,
        is_read: false
      };

      io.to(socket.id).emit('receive_message', messageToSend);

      const receiverUserId = (senderId === sortedUser1Id) ? sortedUser2Id : sortedUser1Id;

      if (socketMap[receiverUserId]) {
        const receiverSocketId = socketMap[receiverUserId].socketId;
        const receiverCurrentRoomId = socketMap[receiverUserId].currentRoomId;

        if (receiverCurrentRoomId === roomId) {
          const unreadMessagesBeforeUpdate = await ChatMessage.findAll({
            where: {
              rooms_id: chatRoomInstance.id,
              sender_id: { [Sequelize.Op.ne]: receiverUserId },
              is_read: false
            },
            attributes: ['id']
          });

          const readMessageIds = unreadMessagesBeforeUpdate.map(msg => msg.id);

          await ChatMessage.update(
            { is_read: true },
            {
              where: {
                rooms_id: chatRoomInstance.id,
                sender_id: { [Sequelize.Op.ne]: receiverUserId },
                is_read: false
              }
            }
          );

          io.to(receiverSocketId).emit('read_update', {
            roomId,
            readerId: receiverUserId,
            readMessageIds
          });

          io.to(socket.id).emit('read_update', {
            roomId,
            readerId: receiverUserId,
            readMessageIds
          });

          io.to(receiverSocketId).emit('receive_message', messageToSend);

          console.log(`✅ send_message 후 read_update emit → receiver=${receiverUserId}, readMessageIds=${readMessageIds}`);
          console.log(`📩 유저 ${receiverUserId}는 현재 방 열어놔서 receive_message + read_update 둘 다 emit`);
        } else {
          io.to(receiverSocketId).emit('receive_message', messageToSend);
          console.log(`📩 유저 ${receiverUserId}에게 직접 receive_message 전송`);
        }
      } else {
        console.log(`⚠️ 유저 ${receiverUserId}는 현재 socketMap에 없음 → 직접 전송 불가`);
      }
    } catch (err) {
      console.error('❌ send_message 중 에러 발생:', err);
    }
  });
});

// 서버 실행
const PORT = process.env.PORT || 3065;
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중! http://localhost:${PORT}`);
});
