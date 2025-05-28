//follow.js

module.exports = (sequelize, DataTypes) =>{
  const Follow = sequelize.define('Follow',{
    from_user_id:{
      type:DataTypes.BIGINT,
      allowNull:false,
    },
    to_user_id:{
      type:DataTypes.BIGINT,
      allowNull:false,
    },
  },{
    tableName:'user_follows',
    timestamps:true, 
    indexs:[
      {
        unique:true,
        fields:['from_user_id','to_user_id'],
      },
    ],
  });

  return UserFollows;
}