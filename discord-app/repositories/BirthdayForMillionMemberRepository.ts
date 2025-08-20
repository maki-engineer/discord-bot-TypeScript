import { Transaction } from 'sequelize';
import db from '../models/index';

export default class BirthdayForMillionMemberRepository {
  /**
   * ミリオンメンバーの中で当日誕生日の人を取得
   *
   * @param {number} month 月
   * @param {number} date 日
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<BirthdayForMillionMember[]>}
   */
  static async getMillionMemberBirthdayList(
    month: number,
    date: number,
    transaction: Transaction | null = null,
  ) {
    const options: {
      where: { month: number; date: number };
      raw: boolean;
      transaction?: Transaction;
    } = {
      where: {
        month,
        date,
      },
      raw: true,
    };

    if (transaction) {
      options.transaction = transaction;
    }

    return db.BirthdayForMillionMember.findAll(options);
  }
}
