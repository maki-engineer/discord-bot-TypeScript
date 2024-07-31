const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BirthdayForMillionMember extends Model {
    /**
     * ミリオンメンバーの中で当日誕生日の人を取得
     *
     * @param {number} month 月
     * @param {number} date 日
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
    static async getMillionMemberBirthdayList(month, date, transaction = null) {
      const options = {
        where: {
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
  }

  BirthdayForMillionMember.init({
    name: DataTypes.STRING,
    month: DataTypes.INTEGER,
    date: DataTypes.INTEGER,
    img: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'BirthdayForMillionMember',
    underscored: true,
    timestamps: false,
  });

  BirthdayForMillionMember.removeAttribute('id');

  return BirthdayForMillionMember;
};
