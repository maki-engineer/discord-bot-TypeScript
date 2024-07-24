'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmojiDataForMillionMemberToUseBirthday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  EmojiDataForMillionMemberToUseBirthday.init({
    name: DataTypes.STRING,
    emoji: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmojiDataForMillionMemberToUseBirthday',
    timestamps: false,
    tableName: 'emoji_data_for_million_member_to_use_birthday'
  });

  EmojiDataForMillionMemberToUseBirthday.removeAttribute('id');

  return EmojiDataForMillionMemberToUseBirthday;
};