module.exports = (sequelize, DataTypes) => {
  const UserStatus = sequelize.define('UserStatus', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },     
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  UserStatus.associate = (db) => {
    UserStatus.hasMany(db.User, { foreignKey: 'user_status_id' });
  };

  return UserStatus;
};
