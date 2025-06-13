module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define('Badge', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    name: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING(255),
      allowNull: true,
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

  Badge.associate = (db) => {
    db.Badge.belongsToMany(db.User, {
      through: db.UserBadge,
      foreignKey: 'badge_id',
      otherKey: 'user_id',
    });
  };

  // 모델 초기화 후 기본 데이터 삽입
  // 응원팀 뱃지 이름은 응원팀 테이블을 기준으로 함
  Badge.sync().then(() => {
    return Badge.bulkCreate([
      { id: 1, name: '할로', description: 'HaLo를 처음 시작한 날', img: '/img/badges/HALO.svg' },
      { id: 2, name: '기아 타이거즈', description: '기아 타이거즈 응원팀 소속', img: '/img/badges/KIA_Emblem.svg' },
      { id: 3, name: '삼성 라이온즈', description: '삼성 라이온즈 응원팀 소속', img: '/img/badges/SAMSUNG_Emblem.svg' },
      { id: 4, name: 'LG 트윈스', description: 'LG 트윈스 응원팀 소속', img: '/img/badges/LG_Emblem.svg' },
      { id: 5, name: '두산 베어스', description: '두산 베어스 응원팀 소속', img: '/img/badges/DOOSAN_Emblem.svg' },
      { id: 6, name: 'KT 위즈', description: 'KT 위즈 응원팀 소속', img: '/img/badges/KT_Emblem.svg' },
      { id: 7, name: 'SSG 랜더스', description: 'SSG 랜더스 응원팀 소속', img: '/img/badges/SSG_Emblem.svg' },
      { id: 8, name: '롯데 자이언츠', description: '롯데 자이언츠 응원팀 소속', img: '/img/badges/LOTTE_Emblem.svg' },
      { id: 9, name: '한화 이글스', description: '한화 이글스 응원팀 소속', img: '/img/badges/HANHWA_Emblem.svg' },
      { id: 10, name: 'NC 다이노스', description: 'NC 다이노스 응원팀 소속', img: '/img/badges/NC_Emblem.svg' },
      { id: 11, name: '키움 히어로즈', description: '키움 히어로즈 응원팀 소속', img: '/img/badges/KIWOOM_Emblem.svg' },

      { id: 1000003, name: '글의 달인', description: '100개의 글을 작성했다', img: '/img/badges/POST.png'}
    ], {
      ignoreDuplicates: true, // 중복 데이터 무시
    });
  }).catch((err) => {
    console.error('초기값 삽입 오류:', err);
  });

  return Badge;
};
