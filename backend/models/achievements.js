module.exports = (sequelize, DataTypes) => {
  const Achievement = sequelize.define('Achievement', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  Achievement.associate = (db) => {
    db.Achievement.belongsToMany(db.User, {
      through: 'user_achievements',
      timestamps: true,             
    });
  };

  // 업적 분류는 TargetType 코드의 id 값 + 6자리로 구성 : EX) 포스트 관련 10번째 업적 = 1000010
  Achievement.sync().then(() => {
    return Achievement.bulkCreate([
      { id: 1000001, name: '게시글 게시', description: '처음으로 게시글을 작성' },
      { id: 1000002, name: '글쓰기 뉴비 탈출', description: '10개의 게시글 작성'},
      { id: 1000003, name: '글쓰기 머신', description: '100개의 게시글 작성'},

      { id: 2000001, name: '말문이 트였다', description: '처음으로 댓글 작성'},
      { id: 2000002, name: '댓글러 입문', description: '10개의 댓글 작성'},
      { id: 2000003, name: '지나가다 한 마디씩', description: '100개의 댓글 작성'},

      { id: 3000001, name: '혼자가 아니야', description: '최초로 팔로잉/팔로우를 하다'},
      { id: 3000002, name: '손에 손 잡고', description: '누적 팔로우 수 10명에 달하다'},
      { id: 3000003, name: '소문난 사람', description: '누적 팔로우 수 50명에 달하다'},

      { id: 5000001, name: '좋아요 1개', description: '처음으로 좋아요를 누름'},
      { id: 5000002, name: '좋아요 10개', description: '좋아요 표시한 게시글이 10개'},
      { id: 5000003, name: '좋아요 100개', description: '좋아요 표시한 게시글이 20개'},
    ], {
      ignoreDuplicates: true, // 중복 데이터 무시
    });
  }).catch((err) => {
    console.error('초기값 삽입 오류:', err);
  });

  return Achievement;
};
