// backend/models/chat_room.js

module.exports = (sequelize, DataTypes) => {
    const ChatRoom = sequelize.define('ChatRoom', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true, // ID가 자동 증가하는 경우
        },
        user1_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        user2_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        // createdAt, updatedAt은 timestamps: true 설정으로 Sequelize가 자동 관리하지만,
        // 명시적으로 정의된 경우에도 아래와 같이 데이터 타입을 지정할 수 있습니다.
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
        tableName: 'chat_rooms', // 실제 MySQL 테이블 이름 명시
        timestamps: true, // Sequelize가 createdAt, updatedAt 컬럼을 자동으로 관리하도록 설정
        // underscored: true, // 필요하다면 컬럼명을 스네이크 케이스로 자동 변경 (예: createdAt -> created_at)
    });

    ChatRoom.associate = (models) => {
        // ChatRoom은 여러 ChatMessage를 가질 수 있음
        ChatRoom.hasMany(models.ChatMessage, {
            foreignKey: 'rooms_id',
            sourceKey: 'id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        // user1_id와 user2_id가 User 모델의 id를 참조하는 관계를 추가 (선택 사항)
        // 만약 users 테이블이 있고 User 모델이 정의되어 있다면 추가합니다.
        // ChatRoom.belongsTo(models.User, { foreignKey: 'user1_id', as: 'User1' });
        // ChatRoom.belongsTo(models.User, { foreignKey: 'user2_id', as: 'User2' });
    };

    return ChatRoom;
};