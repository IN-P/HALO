module.exports = (sequelize, DataTypes) => {
    const ChatRoom = sequelize.define('ChatRoom', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true, 
        },
        user1_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        user2_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        tableName: 'chat_rooms',
        timestamps: true, 
    });

    ChatRoom.associate = (db) => {

    ChatRoom.belongsTo(db.User, {
    foreignKey: 'user1_id',
    targetKey: 'id',
    as: 'user1',
  });

  ChatRoom.belongsTo(db.User, {
    foreignKey: 'user2_id',
    targetKey: 'id',
    as: 'user2',
  });

  ChatRoom.hasMany(db.ChatMessage, {
    foreignKey: 'rooms_id',
    sourceKey: 'id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

    return ChatRoom;
};