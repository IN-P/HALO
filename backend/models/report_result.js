module.exports = (sequelize, DataTypes) => {
  const ReportResult = sequelize.define('ReportResult', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'report',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // 기본값으로 현재 시간 가능 (선택)
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'report_result',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false, // ✅ 자동 생성 비활성화
  });

  ReportResult.associate = (db) => {
    ReportResult.belongsTo(db.Report, {
      foreignKey: 'id',
      as: 'RelatedReport',
    });

    ReportResult.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'BannedUser',
    });
  };

  return ReportResult;
};
