'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Command extends Model {
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
     * 235botのコマンド一覧を取得。
     *
     * @param {any}  transaction ユニットテストをする時に指定
     *
     * @return {object[]}
     */
    static async getCommandList(transaction = null)
    {
      let options = {raw: true};

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return await this.findAll(options);
    }

    /**
     * 指定されたコマンドを検索。
     *
     * @param {string} commandName 検索したいコマンド名
     * @param {any}  transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async findTargetCommand(commandName, transaction = null)
    {
      let options = {where: {name: commandName}, raw: true};

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return this.findOne(options);
    }

    /**
     * 入力されたコマンドを新しく登録。
     *
     * @param {string} commandName 登録したいコマンド名
     * @param {string} description 登録したいコマンド名の詳細
     * @param {any}  transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async insertNewCommand(commandName, description, transaction = null)
    {
      const insertData = {
        name: commandName,
        description: description
      };

      if (transaction !== null) {
        return await this.create(insertData, {transaction: transaction});
      }

      return await this.create(insertData, options);
    }

    /**
     * 指定されたコマンドを削除。
     *
     * @param {string} commandName 登録したいコマンド名
     * @param {string} description 登録したいコマンド名の詳細
     * @param {any}  transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async deleteCommand(commandName, description, transaction = null)
    {
      const deleteData = {
        where: {
          name: commandName,
          description: description
        }
      };

      if (transaction !== null) {
        deleteData.transaction = transaction;
      }

      return await this.destroy(deleteData);
    }
  }

  Command.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Command',
    timestamps: false,
    tableName: 'commands'
  });

  Command.removeAttribute('id');

  return Command;
};