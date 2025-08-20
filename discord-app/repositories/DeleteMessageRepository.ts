import { Transaction } from 'sequelize';
import db from '../models/index';

export default class DeleteMessageRepository {
  /**
   * 削除対象のメッセージを取得
   *
   * @param {number} date 日
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<DeleteMessage[]>}
   */
  static async findDeleteMessages(date: number, transaction: Transaction | null = null) {
    const options: {
      where: { date: number };
      raw: boolean;
      transaction?: Transaction;
    } = { where: { date }, raw: true };

    if (transaction) {
      options.transaction = transaction;
    }

    return db.DeleteMessage.findAll(options);
  }

  /**
   * 削除対象のメッセージを保存
   *
   * @param {string} messageId 対象のメッセージID
   * @param {number} date 投稿された日
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<DeleteMessage>}
   */
  static async storeMessage(
    messageId: string,
    date: number,
    transaction: Transaction | null = null,
  ) {
    const insertData = {
      message_id: messageId,
      date,
    };

    if (transaction) {
      return db.DeleteMessage.create(insertData, { transaction });
    }

    return db.DeleteMessage.create(insertData);
  }

  /**
   * 削除対象のメッセージを削除
   *
   * @param {string} messageId 対象のメッセージID
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<number>}
   */
  static async deleteMessage(messageId: string, transaction: Transaction | null = null) {
    const deleteData: { where: { message_id: string }; transaction?: Transaction } = {
      where: {
        message_id: messageId,
      },
    };

    if (transaction) {
      deleteData.transaction = transaction;
    }

    return db.DeleteMessage.destroy(deleteData);
  }
}
