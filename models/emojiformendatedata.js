'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmojiForMenDateData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  EmojiForMenDateData.init({
    count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'EmojiForMenDateData',
    tableName: 'emoji_for_men_date_data',
    timestamps: false
  });

  EmojiForMenDateData.removeAttribute('id');

  return EmojiForMenDateData;
};