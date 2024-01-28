'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AnniversaryData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  AnniversaryData.init({
    name: DataTypes.STRING,
    year: DataTypes.INTEGER,
    month: DataTypes.INTEGER,
    date: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AnniversaryData',
    underscored: true,
    timestamps: false
  });

  AnniversaryData.removeAttribute('id');

  return AnniversaryData;
};