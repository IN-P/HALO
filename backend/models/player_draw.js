module.exports = (sequelize, DataTypes) => {
  const PlayerDraw = sequelize.define('PlayerDraw', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    used_points: {
      type: DataTypes.STRING(45),
      allowNull:false,       
    },
    draw_time: {
      type: DataTypes.DATE,
      allowNull:false,       
    },
    players_id: {
      type: DataTypes.BIGINT,
      allowNull:false,       
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull:false,       
    },
  }, {
    tableName: 'player_draw',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  PlayerDraw.associate = (db) => {
    PlayerDraw.belongsTo(db.User, { foreignKey: 'users_id' });
    PlayerDraw.belongsTo(db.Player, { foreignKey: 'players_id' });
  };

  return PlayerDraw;
};