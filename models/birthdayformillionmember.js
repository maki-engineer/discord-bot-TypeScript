'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BirthdayForMillionMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  BirthdayForMillionMember.init({
    name: DataTypes.STRING,
    month: DataTypes.INTEGER,
    date: DataTypes.INTEGER,
    img: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BirthdayForMillionMember',
    underscored: true,
    timestamps: false
  });

  BirthdayForMillionMember.removeAttribute('id');

  return BirthdayForMillionMember;
};