module.exports = (sequelize, DataTypes) => {
  const UserPoint  = sequelize.define('UserPoint', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull:false,        
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull:false,        
    },
  }, {
    tableName: 'user_point',
    timestamps: true,
    createdAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  UserPoint.associate = (db) => {
    db.UserPoint.belongsTo(db.User, { foreignKey: 'users_id' });
  };

  return UserPoint;
};