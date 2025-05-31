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
    indexes:[
      {
        unique:true,
        fields:['from_user_id','to_user_id'],
      },
    ],
  });

  Follow.associate = (models) => {
    Follow.belongsTo(models.User,{
      as:'Follower',
      foreignKey:'to_user_id',
    });
    Follow.belongsTo(models.User,{
      as:'Following',
      foreignKey:'from_user_id',
    });

  };
  return Follow;
};