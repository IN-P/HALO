module.exports=(sequelize,DataTypes)=>{
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
    tableName:'follow',
    timestamps:true,
    indexs:[
      {
        unique:true,
        fields:['from_user_id','to_user_id'],
      },
    ],
  });
  return Follow;
};