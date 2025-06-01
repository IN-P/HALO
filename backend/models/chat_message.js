module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('ChatMessage', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        sender_id: { 
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        rooms_id: { 
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        content: { 
            type: DataTypes.TEXT,
            allowNull: false,
        },
        created_at: { 
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, 
        },
        is_read: { 
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        is_deleted: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        tableName: 'chat_messages', 
        timestamps: false, 
        
    });


    ChatMessage.associate = (db) => {
        ChatMessage.belongsTo(db.ChatRoom, {
            foreignKey: 'rooms_id',
            targetKey: 'id',
        });

    };

    return ChatMessage;
};