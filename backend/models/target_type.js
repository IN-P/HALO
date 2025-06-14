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
      unique: true,
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


    //  모델 초기화 후 기본 데이터 삽입
  TargetType.sync().then(() => {
    return TargetType.bulkCreate([
      { code: 'post' },
      { code: 'comment' },
      { code: 'user' },
      // 준혁 추가
      { code: 'reply'},
      { code: 'like' },
      { code: 'retweet' },
      { code: 'chat' },
      { code: 'mention' },
      { code: 'warn' },
      { code: 'restrict' },
      //
    ], {
      ignoreDuplicates: true, // 중복 데이터 무시
    });
  }).catch((err) => {
    console.error('💥 TargetType 초기값 삽입 오류:', err);
  });

  return TargetType;
};
