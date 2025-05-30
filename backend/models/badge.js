module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define('Badge', {
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
  });

  Badge.associate = (db) => {
    Badge.belongsToMany(db.User, {
      through: 'user_badges', 
      timestamps: true,       
    });
  };

  return Badge;
};
