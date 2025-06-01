module.exports = (sequelize, DataTypes) => {
  const active_log = sequelize.define('active_log', {
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
  });

  active_log.associate = (db) => {
    db.active_log.belongsTo(db.User, {
      foreignKey: 'users_id',
    });
    db.active_log.belongsTo(db.target_type, {
      foreignKey: 'target_type_id',
    });
  };

  return active_log;
};
