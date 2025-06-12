module.exports = (sequelize, DataTypes) => {
  const DeletedUsersBackup = sequelize.define('DeletedUsersBackup', {
    id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true, // 이 줄 추가
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
    type: DataTypes.STRING(100),
    allowNull: true,  
    },
    role: {
    type: DataTypes.INTEGER,
    allowNull: true,  
    },
    profile_img: {
      type: DataTypes.STRING(255),
    },
    theme_mode: {
      type: DataTypes.STRING(10),
    },
    is_private: {
      type: DataTypes.TINYINT,
    },
    balance: {
      type: DataTypes.BIGINT,
    },
    email_chk: {
      type: DataTypes.TINYINT,
    },
    ip: {
      type: DataTypes.STRING(255),
    },
    user_status_id: {
      type: DataTypes.BIGINT,
    },
    membership_id: {
      type: DataTypes.BIGINT,
    },
    myteam_id: {
      type: DataTypes.BIGINT,
    },
    last_active: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'deleted_users_backup', // 실제 DB 테이블명 명시
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false, // createdAt/updatedAt 자동 기록 안함
  });

  return DeletedUsersBackup;
};
