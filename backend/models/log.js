// models/log.js
module.exports = (sequelize, DataTypes) => {
  const Log = sequelize.define('Log', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {            // 로그 발생 주체 (유저 or 관리자)
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    target_user_id: {     // 관리자 행위 대상 유저 (없을 수도 있음)
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    action: {             // 예: update_user, delete_soft, view_user
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {        // 상세 설명
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'logs',
    timestamps: true,
    updatedAt: false,
    underscored: true,
  });

  Log.associate = (models) => {
    Log.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Log.belongsTo(models.User, { foreignKey: 'target_user_id', as: 'targetUser' });
  };

  return Log;
};
