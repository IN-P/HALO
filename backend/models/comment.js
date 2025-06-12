module.exports = (sequelize,DataTypes)=>{

  const Comment = sequelize.define('Comment',{
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },    
    content:{
      type : DataTypes.TEXT,
      allowNull:false
    },
    post_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },   
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }    
  },{
    charset:'utf8',
    collate:'utf8_general_ci' 
  }); 

  Comment.associate = (db)=>{
    db.Comment.belongsTo(db.Post, { foreignKey: 'post_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Comment.belongsTo(db.User, { foreignKey: 'user_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Comment.belongsTo(db.Comment, { as: 'Parent', foreignKey: 'parent_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });
    db.Comment.hasMany(db.Comment, { as: 'Replies', foreignKey: 'parent_id',  onDelete: 'CASCADE',onUpdate: 'CASCADE', });    

    db.Comment.hasMany(db.CommentPath, {
      foreignKey: 'lower_id',
      as: 'Ancestors',
        onDelete: 'CASCADE',onUpdate: 'CASCADE',
    });

    db.Comment.hasMany(db.CommentPath, {
      foreignKey: 'upper_id',
      as: 'Descendants',
        onDelete: 'CASCADE',onUpdate: 'CASCADE',
    });   
  };
  return Comment;
};