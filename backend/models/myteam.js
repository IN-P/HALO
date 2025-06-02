module.exports = (sequelize, DataTypes) => {
  const Myteam = sequelize.define('Myteam', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
    teamname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    teamcolor: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  Myteam.associate = (db) => {
    db.Myteam.hasMany(db.User, {foreignKey: 'myteam_id'});
  };

  return Myteam;
};
