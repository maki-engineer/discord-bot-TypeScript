'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BirthdayFor235Member extends Model {
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
     * 新しく235プロダクションに入ってきたメンバーの誕生日を登録
     *
     * @param {string} userName ユーザー名
     * @param {string} userId ユーザーID
     * @param {number} month 月
     * @param {number} date 日
     * @param {any} transaction ユニットテストをする時に指定
     */
    static async registNew235MemberBirthday(userName, userId, month, date, transaction = null)
    {
      const insertData = {};

      if (transaction !== null) {
        return await this.create(insertData, {transaction});
      }

      return await this.create(insertData);
    }

    /**
     * 指定された235プロダクションメンバーの誕生日を削除
     *
     * @param {string} userId メンバーのユーザーID
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async delete235MemberBirthday(userId, transaction = null)
    {
      const deleteData = {
        where: {
          user_id: userId
        }
      };

      if (transaction !== null) {
        deleteData.transaction = transaction;
      }

      return await this.destroy(deleteData);
    }
  }

  BirthdayFor235Member.init({
    name: DataTypes.STRING,
    user_id: DataTypes.STRING,
    month: DataTypes.INTEGER,
    date: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BirthdayFor235Member',
    tableName: 'birthday_for_235_members',
    timestamps: false,
  });

  BirthdayFor235Member.removeAttribute('id');

  return BirthdayFor235Member;
};