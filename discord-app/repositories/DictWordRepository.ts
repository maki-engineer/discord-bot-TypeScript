const { DictWord } = require('../models/index').default;

export default class DictWordRepository {
  /**
   * 登録されている単語辞書を取得
   *
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async getDictWordList(transaction = null) {
    const options: {
      raw: boolean;
      transaction?: any;
    } = { raw: true };

    if (transaction) {
      options.transaction = transaction;
    }

    return await DictWord.findAll(options);
  }

  /**
   * 単語辞書に新しく単語を登録
   *
   * @param {string} word 登録したい単語
   * @param {string} howToRead 登録したい単語の読み方
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async saveNewWordToDict(word: string, howToRead: string, transaction = null) {
    const insertData = {
      word,
      how_to_read: howToRead,
    };

    if (transaction) {
      return await DictWord.create(insertData, { transaction });
    }

    return await DictWord.create(insertData);
  }

  /**
   * 既に登録されている単語の読み方を更新
   *
   * @param {string} word 更新したい単語
   * @param {string} howToRead 更新したい単語の読み方
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {void}
   */
  static async updateReadOfWordToDict(word: string, howToRead: string, transaction = null) {
    const updateData: { where: { word: string }; transaction?: any } = {
      where: { word },
    };

    if (transaction) {
      updateData.transaction = transaction;
    }

    await DictWord.update({ how_to_read: howToRead }, updateData);
  }
}
