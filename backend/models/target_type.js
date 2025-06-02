module.exports = (sequelize, DataTypes) => {
  const TargetType = sequelize.define('TargetType', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    code: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
    tableName: 'target_type',
  });

  TargetType.associate = (db) => {
    db.TargetType.hasMany(db.Notification, {
      foreignKey: 'target_type_id',
    });
    db.TargetType.hasMany(db.ActiveLog, {
      foreignKey: 'target_type_id',
    });
    db.TargetType.hasMany(db.Report, { 
      foreignKey: 'target_type_id' 
    });
  };

  return TargetType;
};
