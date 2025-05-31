module.exports = (sequelize, DataTypes) => {
  const UserPayment = sequelize.define('UserPayment', {
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  UserPayment.associate = (db) => {
    UserPayment.belongsTo(db.User, {foreignKey: 'users_id'});
  };

  return UserPayment;
};
