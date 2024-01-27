'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeleteMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  DeleteMessage.init({
    message_id: DataTypes.STRING,
    date: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DeleteMessage',
    underscored: true,
    timestamps: false,
  });

  DeleteMessage.removeAttribute('id');

  return DeleteMessage;
};