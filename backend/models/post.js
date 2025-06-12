module.exports = (sequelize, DataTypes) => {

  const Post = sequelize.define('Post', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    regram_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    private_post: {                           
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    location: { type: DataTypes.STRING(255), allowNull: true },
    latitude: { type: DataTypes.DECIMAL(10,7), allowNull: true },
    longitude: { type: DataTypes.DECIMAL(10,7), allowNull: true },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });

  Post.associate = (db) => {
    db.Post.hasMany(db.Image, { foreignKey: 'post_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Post.hasMany(db.Comment, { foreignKey: 'post_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Post.belongsTo(db.User, { foreignKey: 'user_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Post.hasMany(db.Post, { as: 'Regrams', foreignKey: 'regram_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    db.Post.belongsTo(db.Post, { as: 'Regram', foreignKey: 'regram_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Post.belongsToMany(db.User, { through: 'Bookmark', as: 'Bookmarkers',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
  };

  return Post;
};
