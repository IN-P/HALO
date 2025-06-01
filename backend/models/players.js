module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull:false,       
    },
    rarity: {
      type: DataTypes.ENUM('NORMAL', 'RARE', 'LEGEND'),
      allowNull:false,       
    },
    image_url: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'players',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Player.associate = (db) => {
    Player.hasMany(db.PlayerDraw, { foreignKey: 'players_id' });
  };

  return Player;
};