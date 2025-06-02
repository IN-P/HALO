module.exports = (sequelize, DataTypes) => {
  const PointLogs = sequelize.define('PointLogs', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull:false,       
    },
    source: {
      type: DataTypes.ENUM('CHECKIN', 'ROULETTE', 'QUIZ', 'DRAW'),
      allowNull:false,       
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull:false, 
    },
  }, {
    tableName: 'point_logs',
    timestamps: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  PointLogs.associate = (db) => {
    db.PointLogs.belongsTo(db.User, { foreignKey: 'users_id' });
  };

  return PointLogs;
};
