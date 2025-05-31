module.exports = (sequelize, DataTypes) => {
  const target_type = sequelize.define('target_type', {
    code: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  target_type.associate = (db) => {
    db.target_type.hasMany(db.notification, {
      foreignKey: 'target_type_id',
    });
    db.target_type.hasMany(db.active_log, {
      foreignKey: 'target_type_id',
    });
  };

  return target_type;
};
