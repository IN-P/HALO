module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(45),
    },
    target_type_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    target_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  }, {
    tableName: 'report',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Report.associate = (db) => {
    db.Report.belongsTo(db.User, { foreignKey: 'users_id' });
    db.Report.belongsTo(db.TargetType, { foreignKey: 'target_type_id' });

    // ✅ 정지 결과 연결 (여기 안에 있어야 함!)
    db.Report.hasOne(db.ReportResult, {
      foreignKey: 'id', // ReportResult.id는 Report.id 참조
      as: 'ReportResult',
    });
  };

  return Report;
};
