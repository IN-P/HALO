// backend/models/chat_message.js

module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('ChatMessage', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        sender_id: { // SQL 스키마와 동일
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        rooms_id: { // SQL 스키마와 동일
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        content: { // SQL 스키마와 동일
            type: DataTypes.TEXT,
            allowNull: false,
        },
        created_at: { // ★★★ SQL 스키마와 동일하게 'created_at'으로 변경 ★★★
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Sequelize가 DEFAULT CURRENT_TIMESTAMP에 매핑
        },
        is_read: { // ★★★ 새롭게 추가된 컬럼 ★★★
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        is_deleted: { // ★★★ 새롭게 추가된 컬럼 ★★★
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 0,
        },
        // SQL 스키마에 updatedAt 컬럼이 없으므로, 모델에서도 삭제합니다.
        // updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, // 이 라인은 삭제
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        tableName: 'chat_messages', // 실제 MySQL 테이블 이름 명시
        timestamps: false, // ★★★ createdAt, updatedAt 자동 관리를 끕니다. ★★★
        // underscored: true, // 컬럼명이 자동으로 snake_case로 변환되지 않도록 false로 유지하거나 제거
                             // 여기서는 `created_at`을 직접 정의했으므로 `underscored`는 큰 의미가 없습니다.
    });

    // 모델 관계 정의 (Association)
    ChatMessage.associate = (models) => {
        // ChatMessage는 하나의 ChatRoom에 속한다 (N:1 관계)
        ChatMessage.belongsTo(models.ChatRoom, {
            foreignKey: 'rooms_id',
            targetKey: 'id',
        });

        // ChatMessage는 하나의 User에 의해 보내진다 (sender_id가 User 모델을 참조)
        // models.User가 현재 존재하지 않으므로 이 관계는 계속 주석 처리됩니다.
        // ChatMessage.belongsTo(models.User, {
        //     foreignKey: 'sender_id',
        //     targetKey: 'id',
        // });
    };

    return ChatMessage;
};