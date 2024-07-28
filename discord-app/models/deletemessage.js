const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeleteMessage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
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
    static async findDeleteMessages(date, transaction = null) {
      const options = { where: { date }, raw: true };

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return await this.findAll(options);
    }

    /**
     * 削除対象のメッセージを保存
     *
     * @param {string} messageId 対象のメッセージID
     * @param {number} date 投稿された日
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async storeMessage(messageId, date, transaction = null) {
      const insertData = {
        message_id: messageId,
        date,
      };

      if (transaction !== null) {
        return await this.create(insertData, { transaction });
      }

      return await this.create(insertData);
    }

    /**
     * 削除対象のメッセージを削除
     *
     * @param {string} messageId 対象のメッセージID
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async deleteMessage(messageId, transaction = null) {
      const deleteData = {
        where: {
          message_id: messageId,
        },
      };

      if (transaction !== null) {
        deleteData.transaction = transaction;
      }

      return await this.destroy(deleteData);
    }
  }

  DeleteMessage.init({
    message_id: DataTypes.STRING,
    date: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'DeleteMessage',
    underscored: true,
    timestamps: false,
  });

  DeleteMessage.removeAttribute('id');

  return DeleteMessage;
};
