
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

    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',       
    tableName:'block',

    indexes:[
      {
        unique:true,
        fields:['from_user_id','to_user_id'],
      },
    ],
  });


  Block.associate = (db) =>{
    Block.belongsTo(db.User,{
      as:'Blocker',
      foreignKey:'from_user_id',
    });
    Block.belongsTo(db.User,{
      as:'Blocked',
      foreignKey:'to_user_id',
    });
  };
  return Block;
};