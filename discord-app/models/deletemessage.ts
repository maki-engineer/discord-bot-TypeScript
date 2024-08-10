const { Sequelize, Model, DataTypes } = require('sequelize');

export default class DeleteMessage extends Model {
  public message_id!: string;

  public date!: number;

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
      where: { date: number },
      raw: boolean,
      transaction?: any,
    } = { where: { date }, raw: true };

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
      return await this.create(insertData, { transaction });
    }

    return await this.create(insertData);
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
    const deleteData: { where: { message_id: string }, transaction?: any } = {
      where: {
        message_id: messageId,
      },
    };

    if (transaction !== null) {
      deleteData.transaction = transaction;
    }

    return await this.destroy(deleteData);
  }

  static initialize(sequelize: typeof Sequelize) {
    this.init(
      {
        message_id: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        date: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            max: 31,
            min: 1,
          },
        },
      },
      {
        sequelize,
        modelName: 'DeleteMessage',
        tableName: 'delete_messages',
        timestamps: false,
      },
    );

    this.removeAttribute('id');

    return this;
  }
}
