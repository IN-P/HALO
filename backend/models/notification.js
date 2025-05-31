module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    content: {
      type: DataTypes.TEXT,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

  notification.associate = (db) => {
    db.notification.belongsTo(db.user, {
      foreignKey: 'users_id',
    });
    db.notification.belongsTo(db.target_type, {
      foreignKey: 'target_type_id',
    });
  };

  return notification;
};
