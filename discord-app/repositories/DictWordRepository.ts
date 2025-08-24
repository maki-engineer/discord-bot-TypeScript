import { Transaction } from 'sequelize';
import db from '../models/index';

export default class DictWordRepository {
  /**
   * 登録されている単語辞書を取得
   *
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<DictWord[]>}
   */
  static async getDictWordList(transaction: Transaction | null = null) {
    const options: {
      raw: boolean;
      transaction?: Transaction;
    } = { raw: true };

    if (transaction) {
      options.transaction = transaction;
    }

    return db.DictWord.findAll(options);
  }

  /**
   * 単語辞書に新しく単語を登録
   *
   * @param {string} word 登録したい単語
   * @param {string} howToRead 登録したい単語の読み方
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<DictWord>}
   */
  static async saveNewWordToDict(
    word: string,
    howToRead: string,
    transaction: Transaction | null = null,
  ) {
    const insertData = {
      word,
      how_to_read: howToRead,
    };

    if (transaction) {
      return db.DictWord.create(insertData, { transaction });
    }

    return db.DictWord.create(insertData);
  }

  /**
   * 既に登録されている単語の読み方を更新
   *
   * @param {string} word 更新したい単語
   * @param {string} howToRead 更新したい単語の読み方
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   */
  static async updateReadOfWordToDict(
    word: string,
    howToRead: string,
    transaction: Transaction | null = null,
  ) {
    const updateData: { where: { word: string }; transaction?: Transaction } = {
      where: { word },
    };

    if (transaction) {
      updateData.transaction = transaction;
    }

    await db.DictWord.update({ how_to_read: howToRead }, updateData);
  }
}
