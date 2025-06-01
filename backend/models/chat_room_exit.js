module.exports = (sequelize, DataTypes) => {
  const ChatRoomExit = sequelize.define('ChatRoomExit', {
    chat_rooms_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'chat_rooms',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    user1_id_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    user2_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'chat_room_exit',
    charset: 'utf8',
    collate: 'utf8_general_ci',
    timestamps: false,
  });

  ChatRoomExit.associate = (db) => {
    ChatRoomExit.belongsTo(db.ChatRoom, {
      foreignKey: 'chat_rooms_id',
      targetKey: 'id',
      as: 'chatRoom',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return ChatRoomExit;
};
