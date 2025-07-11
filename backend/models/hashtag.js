module.exports = (sequelize,DataTypes)=>{

  const Hashtag = sequelize.define('Hashtag',{
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    }, 
    name:{
      type : DataTypes.STRING(200),
      allowNull:false
    }
  },{
    charset:'utf8mb4',
    collate:'utf8mb4_general_ci'
  }); 

  Hashtag.associate = (db)=>{
    db.Hashtag.belongsToMany(db.Post,{through:'PostHashtag',  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',});
  };
  return Hashtag;
};