module.exports = (sequelize, DataTypes) => {
  const Achievement = sequelize.define('Achievement', {
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
  });

  Achievement.associate = (db) => {
    Achievement.belongsToMany(db.User, {
      through: 'user_achievements',
      timestamps: true,             
    });
  };

  return Achievement;
};
