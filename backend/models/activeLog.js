module.exports = (sequelize, DataTypes) => {
  const active_log = sequelize.define('active_log', {
    action: {
      type: DataTypes.STRING(45),
    },
    target_id: {
      type: DataTypes.BIGINT,
    },
    users_id: {
      type: DataTypes.BIGINT,
    },
    target_type_id: {
      type: DataTypes.BIGINT,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  active_log.associate = (db) => {
    db.active_log.belongsTo(db.user, {
      foreignKey: 'users_id',
    });
    db.active_log.belongsTo(db.target_type, {
      foreignKey: 'target_type_id',
    });
  };

  return active_log;
};
