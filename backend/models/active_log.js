module.exports = (sequelize, DataTypes) => {
  const ActiveLog = sequelize.define('ActiveLog', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    action: {
      type: DataTypes.STRING(45),
      allowNull: false,      
    },
    target_id: {
      type: DataTypes.BIGINT,
      allowNull: false,      
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull: false,      
    },
    target_type_id: {
      type: DataTypes.BIGINT,
      allowNull: false,      
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    tableName: 'active_log',
  });

  ActiveLog.associate = (db) => {
    ActiveLog.belongsTo(db.User, {
      foreignKey: 'users_id',
    });
    ActiveLog.belongsTo(db.TargetType, {
      foreignKey: 'target_type_id',
    });
  };

  return ActiveLog;
};
