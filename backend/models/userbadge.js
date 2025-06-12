module.exports = (sequelize, DataTypes) => {
  const UserBadge = sequelize.define('UserBadge', {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    badge_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    isSelected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'user_badges',
    timestamps: true,
  });

  
  UserBadge.associate = (db) => {
    UserBadge.belongsTo(db.User, { foreignKey: 'user_id' });
    UserBadge.belongsTo(db.Badge, { foreignKey: 'badge_id' });
  };

  return UserBadge;
};
