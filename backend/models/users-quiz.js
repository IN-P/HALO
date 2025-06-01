module.exports = (sequelize, DataTypes) => {
  const UsersQuiz = sequelize.define('UsersQuiz', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    point_earned: {
      type: DataTypes.INTEGER,
      allowNull:false,       
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull:false,       
    },
    quizzes_id: {
      type: DataTypes.BIGINT,
      allowNull:false,       
    },
    quizOption_id: {
      type: DataTypes.BIGINT,
      allowNull:false,       
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,      
      allowNull:false,       
    },
  }, {
    tableName: 'users_quiz',
    timestamps: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  UsersQuiz.associate = (db) => {
    UsersQuiz.belongsTo(db.User, { foreignKey: 'users_id' });
    UsersQuiz.belongsTo(db.Quiz, { foreignKey: 'quizzes_id' });
    UsersQuiz.belongsTo(db.QuizOption, { foreignKey: 'quizOption_id' });
  };

  return UsersQuiz;
};