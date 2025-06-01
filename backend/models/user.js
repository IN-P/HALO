module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT, 
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email_chk: {
      type: DataTypes.TINYINT,
      allowNull: false,      
      defaultValue: 0,
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_active: {
      type: DataTypes.DATE,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,      
      defaultValue: 5,
    },
    ip: {
      type: DataTypes.STRING(255),
    },
    profile_img: {
      type: DataTypes.STRING(255),
    },
    theme_mode: {
      type: DataTypes.STRING(10),
      defaultValue: 'light',
    },
    is_private: {
      allowNull: false,    
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.BIGINT,
      allowNull: false,      
      defaultValue: 0,
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  User.associate = (db) => {
    User.belongsTo(db.UserStatus, { foreignKey: 'user_status_id' });
    User.belongsTo(db.Myteam, { foreignKey: 'myteam_id' });
    User.belongsTo(db.Membership, { foreignKey: 'membership_id' });
    User.belongsTo(db.Social, { foreignKey: 'social_id' });

    User.hasOne(db.UserInfo, {
      foreignKey: 'users_id',
      sourceKey: 'id',
    });

    User.hasOne(db.DeleteUser, { 
      foreignKey: 'users_id',
      sourceKey: 'id', 
    });

    User.hasMany(db.UserPayment, { foreignKey: 'users_id' });

    User.belongsToMany(db.Achievement, {
      through: 'user_achievements',
      timestamps: true,
    });

    User.belongsToMany(db.Badge, {
      through: 'user_badges',
      timestamps: true,
    });

    User.hasMany(db.notification, { foreignKey: 'users_id' });
    User.hasMany(db.active_log, { foreignKey: 'users_id' });
    
    User.hasMany(db.Block, {
      as: 'Blockeds', 
      foreignKey: 'from_user_id',
    });

    User.hasMany(db.Block, {
      as: 'Blockers', 
      foreignKey: 'to_user_id',
    });

    User.hasMany(db.Follow, {
      as: 'Followings',
      foreignKey: 'from_user_id',
    });

    User.hasMany(db.Follow, {
      as: 'Followers',
      foreignKey: 'to_user_id',
    });  
    
    
  };

  return User;
};
