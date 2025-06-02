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
    db.User.hasMany(db.Post, { foreignKey: 'user_id' });
    db.User.hasMany(db.Comment, { foreignKey: 'user_id' });
    db.User.belongsToMany(db.Post,{through:'Like', as:'Liked'});
    db.User.belongsToMany(db.Post,{through:'Bookmark', as:'BookmarkedPosts'});

    db.User.belongsTo(db.UserStatus, { foreignKey: 'user_status_id' });
    db.User.belongsTo(db.Myteam, { foreignKey: 'myteam_id' });
    db.User.belongsTo(db.Membership, { foreignKey: 'membership_id' });
    db.User.belongsTo(db.Social, { foreignKey: 'social_id' });

    db.User.hasOne(db.UserInfo, { foreignKey: 'users_id' });
    db.User.hasOne(db.DeleteUser, { foreignKey: 'users_id' });
    db.User.hasMany(db.UserPayment, { foreignKey: 'users_id' });

    db.User.belongsToMany(db.Achievement, {
      through: 'user_achievements',
      timestamps: true,
    });

    db.User.belongsToMany(db.Badge, {
      through: 'user_badges',
      timestamps: true,
    });

    db.User.hasMany(db.Notification, { foreignKey: 'users_id' });
    db.User.hasMany(db.ActiveLog, { foreignKey: 'users_id' });

    db.User.hasMany(db.Report, { foreignKey: 'users_id' });
    db.User.hasMany(db.Inquiry, { foreignKey: 'users_id' });

    db.User.hasMany(db.Block, {
      as: 'Blockeds', 
      foreignKey: 'from_user_id',
    });

    db.User.hasMany(db.Block, {
      as: 'Blockers', 
      foreignKey: 'to_user_id',
    });

    db.User.hasMany(db.Follow, {
      as: 'Followings',
      foreignKey: 'from_user_id',
    });

    db.User.hasMany(db.Follow, {
      as: 'Followers',
      foreignKey: 'to_user_id',
    });  
        
    db.User.hasMany(db.Mention, { 
      foreignKey: 'senders_id', 
      as: 'SentMentions' 
    });
    
    db.User.hasMany(db.Mention, { 
      foreignKey: 'receiver_id', 
      as: 'ReceivedMentions' 
    });

    db.User.hasMany(db.ChatMessage, { foreignKey: 'sender_id', });

    db.User.hasMany(db.ChatRoom, { 
      foreignKey: 'user1_id', 
      as: 'User1Rooms' 
    });
    db.User.hasMany(db.ChatRoom, { 
      foreignKey: 'user2_id', 
      as: 'User2Rooms' 
    });    

    db.User.hasMany(db.Checkin, { foreignKey: 'users_id' });
    db.User.hasMany(db.Roulette, { foreignKey: 'users_id' });
    db.User.hasOne(db.UserPoint, { foreignKey: 'users_id' });
    db.User.hasMany(db.PointLogs, { foreignKey: 'users_id' });
    db.User.hasMany(db.PlayerDraw, { foreignKey: 'users_id' });
    db.User.hasMany(db.UsersQuiz, { foreignKey: 'users_id' });    
    
  
  };

  return User;
};
