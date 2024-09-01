const { Sequelize, Model, DataTypes } = require('sequelize');

export default class DictWord extends Model {
  public word!: string;

  public how_to_read!: string;

  /**
   * 登録されている単語辞書を取得
   *
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async getDictWordList(transaction = null) {
    const options: {
      raw: boolean,
      transaction?: any,
    } = { raw: true };

    if (transaction !== null) {
      options.transaction = transaction;
    }

    return await this.findAll(options);
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

    if (transaction !== null) {
      return await this.create(insertData, { transaction });
    }

    return await this.create(insertData);
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
    const updateData: { where: { word: string }, transaction?: any } = {
      where: { word },
    };

    if (transaction !== null) {
      updateData.transaction = transaction;
    }

    await this.update({ how_to_read: howToRead }, updateData);
  }

  static initialize(sequelize: typeof Sequelize) {
    this.init(
      {
        word: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        how_to_read: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'DictWord',
        tableName: 'dict_words',
        timestamps: false,
      },
    );

    this.removeAttribute('id');

    return this;
  }
}
