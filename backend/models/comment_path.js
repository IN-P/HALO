module.exports = (sequelize, DataTypes) => {
  const CommentPath = sequelize.define('CommentPath', {
    upper_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,      
    },
    lower_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,      
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'comment_paths',
    timestamps: false,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  CommentPath.associate = (db) => {
    db.CommentPath.belongsTo(db.Comment, {
      foreignKey: 'upper_id',
      as: 'UpperComment',
    });

    db.CommentPath.belongsTo(db.Comment, {
      foreignKey: 'lower_id',
      as: 'LowerComment',
    });
  };

  return CommentPath;
};
