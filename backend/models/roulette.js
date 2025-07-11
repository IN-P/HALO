module.exports = (sequelize, DataTypes) => {
  const Roulette = sequelize.define('Roulette', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    reward_value: {
      type: DataTypes.INTEGER,
      allowNull:false,        
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull:false,        
    },
  }, {
    tableName: 'roulette',
    timestamps: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Roulette.associate = (db) => {
    db.Roulette.belongsTo(db.User, { foreignKey: 'users_id' });
  };

  return Roulette;
};
