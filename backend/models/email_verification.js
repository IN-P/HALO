// models/email_verification.js
module.exports = (sequelize, DataTypes) => {
  const EmailVerification = sequelize.define('email_verification', {
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: true, // createdAt, updatedAt
  });

  // 여기에 정의해야 db 인자를 받을 수 있음
  EmailVerification.associate = (db) => {
    EmailVerification.belongsTo(db['User'], {
      foreignKey: 'users_id',
      onDelete: 'CASCADE',
    });
  };

  return EmailVerification;
};
