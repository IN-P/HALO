module.exports = (sequelize, DataTypes) => {
  const DeleteUser = sequelize.define('DeleteUser', {    
    users_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
  });

  DeleteUser.associate = (db) => {
    DeleteUser.belongsTo(db.User, {
      foreignKey: 'users_id',
      targetKey: 'id', 
    });
  };

  return DeleteUser;
};
