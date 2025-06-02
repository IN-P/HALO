module.exports = (sequelize, DataTypes) => {
  const Inquiry = sequelize.define('Inquiry', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    users_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,      
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,      
    },
    answer: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'inquiries',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Inquiry.associate = (db) => {
    db.Inquiry.belongsTo(db.User, { foreignKey: 'users_id' });
  };

  return Inquiry;
};