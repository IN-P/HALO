module.exports = (sequelize, DataTypes) => {
  const Social = sequelize.define('Social', {
    social_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Social.associate = (db) => {
    Social.hasMany(db.User, {foreignKey: 'social_id'});
  };

  return Social;
};
