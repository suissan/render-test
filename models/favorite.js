'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Favorite = loader.database.define(
  'favorites',
  {
    favoriteId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    twId: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    word: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    video: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    img: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    clickedBy: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['clickedBy']
      }
    ]
  }
);

module.exports = Favorite;