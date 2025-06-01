module.exports = (sequelize, DataTypes) => {
  const QuizOption = sequelize.define('QuizOption', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    question_option: {
      type: DataTypes.STRING(255),
      allowNull:false,       
    },
    answer: {
      type: DataTypes.TINYINT,
      allowNull:false,       
    },
    quizzes_id: {
      type: DataTypes.BIGINT,
      allowNull:false,       
    },
  }, {
    tableName: 'quizOption',
    timestamps: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  QuizOption.associate = (db) => {
    db.QuizOption.belongsTo(db.Quiz, { foreignKey: 'quizzes_id' });
    db.QuizOption.hasMany(db.UsersQuiz, { foreignKey: 'quizOption_id' });
  };

  return QuizOption;
};