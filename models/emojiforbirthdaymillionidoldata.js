'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmojiForBirthdayMillionIdolData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  EmojiForBirthdayMillionIdolData.init({
    emoji_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmojiForBirthdayMillionIdolData',
    tableName: 'emoji_for_birthday_million_idol_data',
    timestamps: false
  });

  EmojiForBirthdayMillionIdolData.removeAttribute('id');

  return EmojiForBirthdayMillionIdolData;
};