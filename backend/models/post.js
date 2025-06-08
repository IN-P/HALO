module.exports = (sequelize,DataTypes)=>{

  const Post = sequelize.define('Post',{
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },    
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'followers'),
      allowNull: false,
      defaultValue: 'public',
    },
    content:{
      type : DataTypes.TEXT,
      allowNull:false
    },
    regram_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },   
  },{
    charset:'utf8mb4',
    collate:'utf8mb4_general_ci'
  }); 

  Post.associate = (db)=>{
    db.Post.hasMany(db.Image, { foreignKey: 'post_id' }); 
    db.Post.hasMany(db.Comment, { foreignKey: 'post_id' }); 
    db.Post.belongsTo(db.User, { foreignKey: 'user_id' }); 
    db.Post.hasMany(db.Post, { as: 'Regrams', foreignKey: 'regram_id' });
    db.Post.belongsTo(db.Post, { as: 'Regram', foreignKey: 'regram_id' });
    db.Post.belongsToMany(db.Hashtag,{through:'PostHashtag'}); 
    db.Post.belongsToMany(db.User,{through:'Like', as:'Likers'});
    db.Post.belongsToMany(db.User,{through:'Bookmark', as:'Bookmarkers'});
  };
  return Post;
};