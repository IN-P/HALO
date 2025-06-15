const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); 

const { ChatRoom, User, ChatMessage, ChatRoomExit,Sequelize } = require('../models');
const { isLoggedIn } = require('./middlewares'); 
const { io, socketMap } = require('../server');

router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const user1_id = req.user.id;
const user2_id = Number(req.body.targetUserId);

if (!Number.isInteger(user2_id) || user2_id <= 0) {
  return res.status(400).json({ error: 'targetUserId is required and must be a positive integer' });
}

if (user1_id === user2_id) {
  return res.status(400).send('본인과 채팅방을 생성할 수 없어.');
}
const sortedIds = [user1_id, user2_id].sort((a, b) => a - b);

if (!Array.isArray(sortedIds) || sortedIds.length !== 2 || !Number.isInteger(sortedIds[0]) || !Number.isInteger(sortedIds[1])) {
  return res.status(400).send('잘못된 채팅방 생성 요청이야.');
}
    let chatRoom = await ChatRoom.findOne({
      where: {
        [Op.or]: [
          { user1_id: user1_id, user2_id: user2_id },
          { user1_id: user2_id, user2_id: user1_id },
        ],
      },
    });

    if (chatRoom) {

let chatRoomExit = await ChatRoomExit.findOne({
  where: { chat_rooms_id: chatRoom.id },
});

if (!chatRoomExit) {
  chatRoomExit = await ChatRoomExit.create({
    chat_rooms_id: chatRoom.id,
    user1_id_active: true,
    user2_id_active: true,
    user1_exited_at: null,
    user2_exited_at: null,
  });
}

const senderIsUser1 = chatRoom.user1_id === req.user.id;


const receiverIsActive = senderIsUser1 
  ? chatRoomExit.user2_id_active 
  : chatRoomExit.user1_id_active;




if (!receiverIsActive) {
  const sortedIds = [chatRoom.user1_id, chatRoom.user2_id].sort((a, b) => a - b);
  if (socketMap && socketMap[sortedIds[0]]) {
    io.to(socketMap[sortedIds[0]].socketId).emit('new_chat_room_created', {
      roomId: `chat-${sortedIds[0]}-${sortedIds[1]}`,
      targetUserId: sortedIds[1],
    });
  } else {
  }
  if (socketMap && socketMap[sortedIds[1]]) {
  io.to(socketMap[sortedIds[1]].socketId).emit('new_chat_room_created', {
    roomId: `chat-${sortedIds[0]}-${sortedIds[1]}`,
    targetUserId: sortedIds[0],
  });
} else {
}
}

return res.status(200).json(chatRoom);
}
if (!chatRoom && !req.body.allowCreate) {
  return res.status(404).send('채팅방이 존재하지 않아.');
}
    chatRoom = await ChatRoom.create({
    user1_id: sortedIds[0],
    user2_id: sortedIds[1],
    });

    await ChatRoomExit.create({
      chat_rooms_id: chatRoom.id,
      user1_id_active: true,
      user2_id_active: true,
    });

if (Array.isArray(sortedIds) && sortedIds.length === 2) {

}

    res.status(201).json(chatRoom);
  } catch (error) {
    next(error);
  }
});


router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatRooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId },
        ],
      },
      include: [
        {
          model: User,
          as: 'User1',
          attributes: ['id', 'nickname' , 'profile_img'],
        },
        {
          model: User,
          as: 'User2',
          attributes: ['id', 'nickname', 'profile_img'],
        },
        {
          model: ChatRoomExit,
          required: false 
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    const filteredChatRooms = chatRooms.filter(room => {
        if (!room.ChatRoomExits || room.ChatRoomExits.length === 0) {
            return true;
        }
        
        const exitInfo = room.ChatRoomExits[0];

        if (room.user1_id === userId) {
            return exitInfo.user1_id_active;
        } else { 
            return exitInfo.user2_id_active;
        }
    });

    res.status(200).json(filteredChatRooms);
  } catch (error) {
    next(error);
  }
});

router.patch('/:chatRoomId/exit', isLoggedIn, async (req, res, next) => {
  try {
    const chatRoomId = parseInt(req.params.chatRoomId, 10);
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }

    let chatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    if (!chatRoomExit) {

      chatRoomExit = await ChatRoomExit.create({ chat_rooms_id: chatRoomId });
    }

    const exitedAt = new Date(); 

    if (chatRoom.user1_id === userId) {
      await ChatRoomExit.update({
        user1_id_active: false,
        user1_exited_at: exitedAt,
      }, {
        where: { chat_rooms_id: chatRoomId },
      });
    } else if (chatRoom.user2_id === userId) {
      await ChatRoomExit.update({
        user2_id_active: false,
        user2_exited_at: exitedAt,
      }, {
        where: { chat_rooms_id: chatRoomId },
      });
    } else {
      return res.status(403).send('해당 채팅방에 참여하고 있지 않아.');
    }

    const updatedChatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    const user1Active = updatedChatRoomExit.user1_id_active;
    const user2Active = updatedChatRoomExit.user2_id_active;

if (user1Active || user2Active) {
  const opponentId = (chatRoom.user1_id === userId) ? chatRoom.user2_id : chatRoom.user1_id;

  if (typeof opponentId !== 'undefined' && socketMap[opponentId] && socketMap[opponentId].socketId) {
    const sortedIds = [chatRoom.user1_id, chatRoom.user2_id].sort((a, b) => a - b);
    const opponentSocketId = socketMap[opponentId].socketId;

    io.to(opponentSocketId).emit('chat_room_closed', {
      roomId: `chat-${sortedIds[0]}-${sortedIds[1]}`,
      message: '상대방이 채팅방을 나갔습니다. 채팅을 새로 시작해야 합니다.'
    });
  } else {
  }
}


if (!updatedChatRoomExit.user1_id_active && !updatedChatRoomExit.user2_id_active) {

  await ChatMessage.destroy({ where: { rooms_id: chatRoomId } });

  await ChatRoomExit.destroy({ where: { chat_rooms_id: chatRoomId } });

  await ChatRoom.destroy({ where: { id: chatRoomId } });
}


    res.status(200).json({ message: '채팅방을 나갔어.', chatRoomExit: updatedChatRoomExit });
  } catch (error) {
    next(error);
  }
});

router.patch('/:chatRoomId/rejoin', isLoggedIn, async (req, res, next) => {
  try {
    const chatRoomId = parseInt(req.params.chatRoomId, 10);
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOne({ where: { id: chatRoomId } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }

    let chatRoomExit = await ChatRoomExit.findOne({ where: { chat_rooms_id: chatRoomId } });

    if (!chatRoomExit) {
      return res.status(200).send('이미 활성화된 채팅방이야.');
    }

    if (chatRoom.user1_id === userId) {
      chatRoomExit.user1_id_active = true;
      chatRoomExit.user1_exited_at = null;
    } else if (chatRoom.user2_id === userId) {
      chatRoomExit.user2_id_active = true;
      chatRoomExit.user2_exited_at = null;
    } else {
      return res.status(403).send('해당 채팅방에 참여하고 있지 않아.');
    }

    await chatRoomExit.save();

    res.status(200).json({ message: '채팅방에 다시 참여했어.', chatRoomExit });
  } catch (error) {
    next(error);
  }
});

router.post('/message', isLoggedIn, async (req, res, next) => {
  try {
    const { roomsId, content } = req.body; 
    const senderId = req.user.id;

    const roomsIdNum = Number(roomsId);
if (isNaN(roomsIdNum)) {
  return res.status(400).send('잘못된 roomsId');
}

    if (!roomsId || !content) {
      return res.status(400).send('채팅방 ID와 내용을 모두 입력해야 해.');
    }

    const chatRoom = await ChatRoom.findOne({ where: { id: roomsIdNum } });
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }
    if (chatRoom.user1_id !== senderId && chatRoom.user2_id !== senderId) {
      return res.status(403).send('채팅방에 참여하고 있지 않아.');
    }

        const chatRoomExit = await ChatRoomExit.findOne({
      where: { chat_rooms_id: roomsIdNum }
    });

    
const senderFieldToUpdate = (chatRoom.user1_id === senderId) ? 'user1_id_active' : 'user2_id_active';
const senderExitedAtField = (senderFieldToUpdate === 'user1_id_active') ? 'user1_exited_at' : 'user2_exited_at';

const receiverFieldToUpdate = (chatRoom.user1_id === senderId) ? 'user2_id_active' : 'user1_id_active';
const receiverExitedAtField = (receiverFieldToUpdate === 'user1_id_active') ? 'user1_exited_at' : 'user2_exited_at';

const isSenderUser1 = chatRoom.user1_id === senderId;
const isOpponentActive = isSenderUser1 ? chatRoomExit.user2_id_active : chatRoomExit.user1_id_active;

if (!isOpponentActive) {
  const sortedIds = [chatRoom.user1_id, chatRoom.user2_id].sort((a, b) => a - b);

  if (socketMap[senderId]) {
    const senderSocketId = socketMap[senderId].socketId;
    io.to(senderSocketId).emit('chat_room_closed', {
      roomId: `chat-${sortedIds[0]}-${sortedIds[1]}`,
      message: '상대방이 채팅방을 나간 상태입니다. 채팅을 새로 시작해야 합니다.',
    });
  }
}

await ChatRoomExit.update(
  {
    [senderFieldToUpdate]: true,
    [senderExitedAtField]: null,
  },
  {
    where: { chat_rooms_id: roomsIdNum },
  }
);

    const roomId = `chat-${[chatRoom.user1_id, chatRoom.user2_id].sort((a, b) => a - b).join('-')}`;

    const newMessage = await ChatMessage.create({
      sender_id: senderId,
      rooms_id: roomsIdNum,
      content,
    });
    const messageWithSender = await ChatMessage.findByPk(newMessage.id, {
      include: [{ model: User, attributes: ['id', 'nickname', 'profile_img'] }] 
    });

    if (req.app.get('io')) {
  const io = req.app.get('io');
  const messagePayload = messageWithSender.toJSON();


  io.to(roomId).emit('receive_message', messagePayload);


  const receiverId = (chatRoom.user1_id === senderId) ? chatRoom.user2_id : chatRoom.user1_id;
}

    res.status(201).json(messageWithSender.toJSON());
  } catch (error) {
    next(error);
  }
});

router.get('/message/:roomId', isLoggedIn, async (req, res, next) => {
  try {
    const paramRoomId = req.params.roomId; 
    let roomIdAsNumber; 

    if (!paramRoomId || !paramRoomId.startsWith('chat-')) {
    return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.');
}

    if (paramRoomId.startsWith('chat-')) {
        const parts = paramRoomId.split('-');
        if (parts.length === 3 && !isNaN(parseInt(parts[1])) && !isNaN(parseInt(parts[2]))) {
            const user1Id = parseInt(parts[1],10);
            const user2Id = parseInt(parts[2],10);

            if (user1Id === user2Id) {
                return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.'); 
            }
            
            const sortedUser1Id = Math.min(user1Id, user2Id);
            const sortedUser2Id = Math.max(user1Id, user2Id);


            const chatRoomInDb = await ChatRoom.findOne({
                where: {
                    user1_id: sortedUser1Id,
                    user2_id: sortedUser2Id,
                },
                attributes: ['id'] 
            });

            if (chatRoomInDb) {
                roomIdAsNumber = chatRoomInDb.id;
            } else {
                return res.status(404).send('채팅방이 존재하지 않아.');
            }
        } else {
            return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.');
        }
    } else {
        roomIdAsNumber = parseInt(paramRoomId, 10);
        if (isNaN(roomIdAsNumber)) {
             return res.status(400).send('유효하지 않은 채팅방 ID 형식이야.');
        }
    }

    if (isNaN(roomIdAsNumber) || roomIdAsNumber === null) {
         return res.status(400).send('채팅방 ID를 확인할 수 없어.');
     }

    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const chatRoom = await ChatRoom.findOne({ where: { id: roomIdAsNumber } }); 
    if (!chatRoom) {
      return res.status(404).send('채팅방이 존재하지 않아.');
    }
    if (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId) {
      return res.status(403).send('채팅방에 참여하고 있지 않아.');
    }; 

    const chatRoomExit = await ChatRoomExit.findOne({
  where: { chat_rooms_id: roomIdAsNumber }
});

let exitedAt = null;
if (chatRoomExit) {
  if (chatRoom.user1_id === userId) {
    exitedAt = chatRoomExit.user1_exited_at;
  } else if (chatRoom.user2_id === userId) {
    exitedAt = chatRoomExit.user2_exited_at;
  }
}

const messageWhere = {
  rooms_id: roomIdAsNumber,
  is_deleted: false,
};

await ChatMessage.update(
  { is_read: true },
  {
    where: {
      rooms_id: roomIdAsNumber,
      sender_id: { [Op.ne]: userId },
      is_read: false,
    },
  }
);

const messages = await ChatMessage.findAll({
  where: messageWhere,
  include: [{ model: User, attributes: ['id', 'nickname','profile_img'] }],
  order: [['created_at', 'DESC']],
  limit,
  offset,
});

const readMessageIds = messages
  .filter(msg => msg.is_read === true && msg.sender_id !== userId)
  .map(msg => msg.id);


const senderUserId = (userId === chatRoom.user1_id) ? chatRoom.user2_id : chatRoom.user1_id;

if (socketMap && socketMap[senderUserId]) {
  const senderSocketId = socketMap[senderUserId].socketId;
  io.to(senderSocketId).emit('read_update', {
    roomId,
    readerId: userId,
    readMessageIds
  });
} else {
}

    res.status(200).json(messages);

  } catch (error) {
    next(error);
  }
});

router.patch('/message/:messageId/delete', isLoggedIn, async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.messageId, 10);
    const userId = req.user.id;

    const message = await ChatMessage.findOne({ where: { id: messageId } });
    if (!message) {
      return res.status(404).send('메시지가 존재하지 않아.');
    }

    if (message.sender_id !== userId) {
      return res.status(403).send('메시지를 삭제할 권한이 없어.');
    }

    await ChatMessage.update(
      { is_deleted: true },
      { where: { id: messageId } }
    );

    res.status(200).json({ MessageId: messageId, is_deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get('/unread', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: userId },
          { user2_id: userId }
        ]
      }
    });

    const result = await Promise.all(rooms.map(async (room) => {
      const opponentId = room.user1_id === userId ? room.user2_id : room.user1_id;

      const unreadCount = await ChatMessage.count({
        where: {
          rooms_id: room.id,
          sender_id: opponentId,
          is_read: false
        }
      });

      const sortedUserIds = [room.user1_id, room.user2_id].sort((a, b) => a - b);
      const roomIdForClient = `chat-${sortedUserIds[0]}-${sortedUserIds[1]}`;

      return {
        roomId: roomIdForClient,
        opponentId,
        unreadCount
      };
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/message/:roomId/unread', isLoggedIn, async (req, res, next) => {
  try {
    const roomId = parseInt(req.params.roomId, 10);
    const userId = req.user.id;

    const chatRoom = await ChatRoom.findOne({ where: { id: roomId } });
    if (!chatRoom || (chatRoom.user1_id !== userId && chatRoom.user2_id !== userId)) {
      return res.status(403).send('해당 채팅방의 읽지 않은 메시지를 조회할 권한이 없어.');
    }

    const unreadCount = await ChatMessage.count({
      where: {
        rooms_id: roomId,
        is_read: false,
        sender_id: { [Op.ne]: userId },
      },
    });
    res.status(200).json({ unreadCount });
  } catch (error) {
    next(error);
  }
});

router.get('/my-rooms', isLoggedIn, async (req, res) => {
  const me = req.user.id;

  try {
    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { user1_id: me },
          { user2_id: me }
        ]
      },
      include: [
    {
      model: ChatRoomExit,
      required: true, 
    }
  ]
    });

    const filteredRooms = rooms.filter(room => {
  const exitInfo = room.ChatRoomExit;
  if (room.user1_id === me) {
    return exitInfo.user1_id_active === 1;
  } else {
    return exitInfo.user2_id_active === 1;
  }
});

    const result = await Promise.all(filteredRooms.map(async (room) => {
      const isUser1 = room.user1_id === me;
      const partnerId = isUser1 ? room.user2_id : room.user1_id;

      const partner = await User.findOne({
        where: { id: partnerId },
        attributes: ['id', 'nickname', 'profile_img']
      });
      const lastMsg = await ChatMessage.findOne({
        where: { rooms_id: room.id },
        order: [['created_at', 'DESC']],
      });

      const unreadCount = await ChatMessage.count({
        where: {
          rooms_id: room.id,
          sender_id: { [Op.ne]: me },
          is_read: false
        }
      });

      return {
        roomId: `chat-${[room.user1_id, room.user2_id].sort().join('-')}`,
        chatRoomId: room.id,
        otherUser: {
          id: partner.id,
          nickname: partner.nickname,
          profileImage: partner.profile_img,
        },
        lastMessage: lastMsg ? lastMsg.content : '',
        lastMessageTime: lastMsg ? lastMsg.created_at : null,
        unreadCount
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).send('서버 오류');
  }
});


module.exports = router;