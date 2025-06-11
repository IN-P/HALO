// models/verified_emails.js
module.exports = (sequelize, DataTypes) => {
  const VerifiedEmail = sequelize.define('verified_emails', {
    verified_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: true, // createdAt, updatedAt
  });

  VerifiedEmail.associate = (db) => {
    VerifiedEmail.belongsTo(db['User'], {
      foreignKey: 'users_id',
      onDelete: 'CASCADE',
    });
  };

  return VerifiedEmail;
};
