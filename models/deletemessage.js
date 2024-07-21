'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeleteMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models)
    {
      // define association here
    }

    /**
     * 削除対象のメッセージを取得
     *
     * @param {number} date 日
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async findDeleteMessages(date, transaction = null)
    {
      let options = {where: {date: date}, raw: true};

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return this.findAll(options);
    }

    /**
     * 削除対象のメッセージを削除
     *
     * @param {string} messageId 対象のメッセージID
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async deleteMessage(messageId, transaction = null)
    {
      const deleteData = {
        where: {
          message_id: messageId
        }
      };

      if (transaction !== null) {
        deleteData.transaction = transaction;
      }

      return await this.destroy(deleteData);
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