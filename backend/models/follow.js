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
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',    
    tableName:'follow',
    indexes:[
      {
        unique:true,
        fields:['from_user_id','to_user_id'],
      },
    ],
  });

  Follow.associate = (db) => {
    Follow.belongsTo(db.User,{
      as:'Follower',
      foreignKey:'to_user_id',
    });
    Follow.belongsTo(db.User,{
      as:'Following',
      foreignKey:'from_user_id',
    });

  };
  return Follow;
};