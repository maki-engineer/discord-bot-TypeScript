'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BirthdayFor235Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  BirthdayFor235Member.init({
    name: DataTypes.STRING,
    user_id: DataTypes.STRING,
    month: DataTypes.INTEGER,
    date: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BirthdayFor235Member',
    tableName: 'birthday_for_235_members',
    timestamps: false,
  });

  BirthdayFor235Member.removeAttribute('id');

  return BirthdayFor235Member;
};