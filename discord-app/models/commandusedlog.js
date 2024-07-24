'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommandUsedLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }

  CommandUsedLog.init({
    command_name: DataTypes.STRING,
    user_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CommandUsedLog',
    underscored: true,
    createdAt: 'used_datetime',
    updatedAt: false
  });

  CommandUsedLog.removeAttribute('id');

  return CommandUsedLog;
};