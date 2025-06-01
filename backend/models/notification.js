module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    content: {
      type: DataTypes.TEXT,
      allowNull: false,      
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,      
      defaultValue: false,
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
    tableName: 'notification',
  });

  Notification.associate = (db) => {
    db.Notification.belongsTo(db.User, {
      foreignKey: 'users_id',
    });
    db.Notification.belongsTo(db.TargetType, {
      foreignKey: 'target_type_id',
    });
  };

  return Notification;
};
