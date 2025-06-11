module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define('Membership', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },      
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
    timestamps: false,
  });

  Membership.associate = (db) => {
    db.Membership.hasMany(db.User, {foreignKey: 'membership_id' , onDelete: 'SET NULL', // 또는 CASCADE 대신 이게 더 적절할 수도 있음
  onUpdate: 'CASCADE',});
  };

  return Membership;
};
