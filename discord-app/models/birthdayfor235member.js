const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BirthdayFor235Member extends Sequelize.Model {
    /**
     * 235プロダクションメンバーの中で当日誕生日の人を取得
     *
     * @param {string} userId ユーザーID
     * @param {number} month 月
     * @param {number} date 日
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async get235MemberBirthdayList(userId, month, date, transaction = null) {
      const options = {
        where: {
          user_id: {
            [Sequelize.Op.ne]: userId,
          },
          month,
          date,
        },
        raw: true,
      };

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return await this.findAll(options);
    }

    /**
     * 今月誕生日の235プロダクションメンバーを昇順で取得
     *
     * @param {number} month 月
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async getThisMonthBirthdayMember(month, transaction = null) {
      const options = {
        where: {
          month,
        },
        order: [
          ['month'],
          ['date'],
        ],
        raw: true,
      };

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return await this.findAll(options);
    }

    /**
     * CSVファイルに出力するための235メンバーの誕生日リストを取得
     *
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async get235MemberBirthdayListForCSV(transaction = null) {
      const options = {
        attributes: [
          'name',
          'month',
          'date',
        ],
        order: [
          ['month'],
          ['date'],
        ],
        raw: true,
      };

      if (transaction !== null) {
        options.transaction = transaction;
      }

      return await this.findAll(options);
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
    static async registNew235MemberBirthday(userName, userId, month, date, transaction = null) {
      const insertData = {
        name: userName,
        user_id: userId,
        month,
        date,
      };

      if (transaction !== null) {
        return await this.create(insertData, { transaction });
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
    static async delete235MemberBirthday(userId, transaction = null) {
      const deleteData = {
        where: {
          user_id: userId,
        },
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
    date: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'BirthdayFor235Member',
    tableName: 'birthday_for_235_members',
    timestamps: false,
  });

  BirthdayFor235Member.removeAttribute('id');

  return BirthdayFor235Member;
};
