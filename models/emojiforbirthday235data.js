'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmojiForBirthday235Data extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  EmojiForBirthday235Data.init({
    count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'EmojiForBirthday235Data',
    tableName: 'emoji_for_birthday_235_data',
    timestamps: false
  });

  EmojiForBirthday235Data.removeAttribute('id');

  return EmojiForBirthday235Data;
};