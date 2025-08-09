const { DeleteMessage } = require('../models/index').default;

export default class DeleteMessageRepository {
  /**
   * 削除対象のメッセージを取得
   *
   * @param {number} date 日
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async findDeleteMessages(date: number, transaction = null) {
    const options: {
      where: { date: number };
      raw: boolean;
      transaction?: any;
    } = { where: { date }, raw: true };

    if (transaction !== null) {
      options.transaction = transaction;
    }

    return await DeleteMessage.findAll(options);
  }

  /**
   * 削除対象のメッセージを保存
   *
   * @param {string} messageId 対象のメッセージID
   * @param {number} date 投稿された日
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async storeMessage(messageId: string, date: number, transaction = null) {
    const insertData = {
      message_id: messageId,
      date,
    };

    if (transaction !== null) {
      return await DeleteMessage.create(insertData, { transaction });
    }

    return await DeleteMessage.create(insertData);
  }

  /**
   * 削除対象のメッセージを削除
   *
   * @param {string} messageId 対象のメッセージID
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {number}
   */
  static async deleteMessage(messageId: string, transaction = null) {
    const deleteData: { where: { message_id: string }; transaction?: any } = {
      where: {
        message_id: messageId,
      },
    };

    if (transaction !== null) {
      deleteData.transaction = transaction;
    }

    return await DeleteMessage.destroy(deleteData);
  }
}
