
module.exports = (sequelize,DataTypes) =>{
  const Block = sequelize.define('Block',{
    from_user_id:{
      type:DataTypes.BIGINT,
      allowNull:false,
    },
    to_user_id:{
      type:DataTypes.BIGINT,
      allowNull:false,
    },
  },{
    tableName:'block',
    timestamps:true,
    indexes:[
      {
        unique:true,
        fields:['from_user_id','to_user_id'],
      },
    ],
  });

  Block.associate = (models) =>{
    Block.belongsTo(models.User,{
      as:'Blocker',
      foreignKey:'from_user_id',
    });
    Block.belongsTo(models.User,{
      as:'Blocked',
      foreignKey:'to_user_id',
    });
  };
  return Block;
};