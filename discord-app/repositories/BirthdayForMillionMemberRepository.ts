const { BirthdayForMillionMember } = require('../models/index').default;

export default class BirthdayForMillionMemberRepository {
  /**
   * ミリオンメンバーの中で当日誕生日の人を取得
   *
   * @param {number} month 月
   * @param {number} date 日
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async getMillionMemberBirthdayList(month: number, date: number, transaction = null) {
    const options: {
      where: { month: number; date: number };
      raw: boolean;
      transaction?: any;
    } = {
      where: {
        month,
        date,
      },
      raw: true,
    };

    if (transaction !== null) {
      options.transaction = transaction;
    }

    return await BirthdayForMillionMember.findAll(options);
  }
}
