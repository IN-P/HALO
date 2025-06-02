module.exports = (sequelize, DataTypes) => {
  const ChatRoomExit = sequelize.define('ChatRoomExit', {
    user1_id_active: {
      type: DataTypes.TINYINT,
      allowNull: false,      
    },
    user2_id_active: {
      type: DataTypes.TINYINT,
      allowNull: false,      
    },
    chat_rooms_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,      
    },
  }, {
    tableName: 'chat_rooms_exit',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  ChatRoomExit.associate = (db) => {
    db.ChatRoomExit.belongsTo(db.ChatRoom, {
      foreignKey: 'chat_rooms_id',
    });
  };

  return ChatRoomExit;
};