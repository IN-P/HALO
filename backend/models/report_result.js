module.exports = (sequelize, DataTypes) => {
  const ReportResult = sequelize.define('ReportResult', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'report', // 'report' 테이블의 id를 참조
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users', // 정지 대상 유저
        key: 'id',
      },
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'report_result',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: true, // createdAt, updatedAt 자동 생성
  });

  ReportResult.associate = (db) => {
    // 신고 결과는 하나의 신고(report)와 연결됨
    ReportResult.belongsTo(db.Report, {
      foreignKey: 'id',
      as: 'RelatedReport',
    });

    // 신고 대상이 된 사용자
    ReportResult.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'BannedUser',
    });
  };

  return ReportResult;
};
