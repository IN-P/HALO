module.exports = (sequelize, DataTypes) => {
  const UserPayment = sequelize.define('UserPayment', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },    
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  UserPayment.associate = (db) => {
    db.UserPayment.belongsTo(db.User, {foreignKey: 'users_id'});
  };

  return UserPayment;
};
