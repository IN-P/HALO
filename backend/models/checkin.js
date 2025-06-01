module.exports = (sequelize, DataTypes) => {
  const Checkin = sequelize.define('Checkin', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull:false,      
    },
  }, {
    tableName: 'checkin',
    timestamps: true,
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Checkin.associate = (db) => {
    db.Checkin.belongsTo(db.User, { foreignKey: 'users_id' });
  };

  return Checkin;
};