module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define('Membership', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  Membership.associate = (db) => {
    Membership.hasMany(db.User, {foreignKey: 'membership_id'});
  };

  return Membership;
};
