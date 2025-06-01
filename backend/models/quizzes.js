module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull:false,        
    },
    point_reward: {
      type: DataTypes.INTEGER,
      allowNull:false,        
    },
  }, {
    tableName: 'quizzes',
    timestamps: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Quiz.associate = (db) => {
    db.Quiz.hasMany(db.UsersQuiz, { foreignKey: 'quizzes_id' });
    db.Quiz.hasMany(db.QuizOption, { foreignKey: 'quizzes_id' });
  };

  return Quiz;
};
