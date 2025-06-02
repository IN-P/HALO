module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
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
  });

  notification.associate = (db) => {
    db.notification.belongsTo(db.User, {
      foreignKey: 'users_id',
    });
    db.notification.belongsTo(db.target_type, {
      foreignKey: 'target_type_id',
    });
  };

  return notification;
};
