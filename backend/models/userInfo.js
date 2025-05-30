module.exports = (sequelize, DataTypes) => {
  const UserInfo = sequelize.define('UserInfo', {
    users_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    introduce: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false, // createdAt, updatedAt 필요 없을 경우 생략
  });

  UserInfo.associate = (db) => {
    UserInfo.belongsTo(db.User, {
      foreignKey: 'users_id',
      targetKey: 'id',
    });
  };

  return UserInfo;
};
