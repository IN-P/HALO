module.exports = (sequelize, DataTypes) => {
  const UserStatus = sequelize.define('UserStatus', {
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  UserStatus.associate = (db) => {
    UserStatus.hasMany(db.User, { foreignKey: 'user_status_id' });
  };

  return UserStatus;
};
