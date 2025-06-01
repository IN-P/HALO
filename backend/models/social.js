module.exports = (sequelize, DataTypes) => {
  const Social = sequelize.define('Social', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    social_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  Social.associate = (db) => {
    db.Social.hasMany(db.User, {foreignKey: 'social_id'});
  };

  return Social;
};
