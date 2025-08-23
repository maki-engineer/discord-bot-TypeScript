import { Op, Transaction, WhereOptions } from 'sequelize';
import db from '../models/index';

export default class BirthdayFor235MemberRepository {
  /**
   * 235プロダクションメンバーの中で当日誕生日の人を取得
   *
   * @param {string} userId ユーザーID
   * @param {number} month 月
   * @param {number} date 日
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<BirthdayFor235Member[]>}
   */
  static async get235MemberBirthdayList(
    userId: string,
    month: number,
    date: number,
    transaction: Transaction | null = null,
  ) {
    const options: {
      where: WhereOptions;
      raw: boolean;
      transaction?: Transaction;
    } = {
      where: {
        user_id: {
          [Op.ne]: userId,
        },
        month,
        date,
      },
      raw: true,
    };

    if (transaction) {
      options.transaction = transaction;
    }

    return db.BirthdayFor235Member.findAll(options);
  }

  /**
   * 今月誕生日の235プロダクションメンバーを昇順で取得
   *
   * @param {number} month 月
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<BirthdayFor235Member[]>}
   */
  static async getThisMonthBirthdayMember(month: number, transaction: Transaction | null = null) {
    const options: {
      where: { month: number };
      order: [string, 'ASC' | 'DESC'][];
      raw: boolean;
      transaction?: Transaction;
    } = {
      where: {
        month,
      },
      order: [
        ['month', 'ASC'],
        ['date', 'ASC'],
      ],
      raw: true,
    };

    if (transaction) {
      options.transaction = transaction;
    }

    return db.BirthdayFor235Member.findAll(options);
  }

  /**
   * CSVファイルに出力するための235メンバーの誕生日リストを取得
   *
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<BirthdayFor235Member[]>}
   */
  static async get235MemberBirthdayListForCSV(transaction: Transaction | null = null) {
    const options: {
      attributes: string[];
      order: [string, 'ASC' | 'DESC'][];
      raw: boolean;
      transaction?: Transaction;
    } = {
      attributes: ['name', 'month', 'date'],
      order: [
        ['month', 'ASC'],
        ['date', 'ASC'],
      ],
      raw: true,
    };

    if (transaction) {
      options.transaction = transaction;
    }

    return db.BirthdayFor235Member.findAll(options);
  }

  /**
   * テキストを読み上げる対象のチャンネルにテキストを入力した235プロダクションメンバーの speaker_id を取得
   *
   * @param {string} userId メンバーのユーザーID
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<number | null>}
   */
  static async getSpeakerIdFromMessageSender(
    userId: string,
    transaction: Transaction | null = null,
  ) {
    const options: {
      where: { user_id: string };
      transaction?: Transaction;
    } = {
      where: { user_id: userId },
    };

    if (transaction) {
      options.transaction = transaction;
    }

    const foundData = await db.BirthdayFor235Member.findOne(options);

    if (foundData === null) {
      return null;
    }

    return foundData.speaker_id;
  }

  /**
   * 新しく235プロダクションに入ってきたメンバーの誕生日を登録
   *
   * @param {string} userName ユーザー名
   * @param {string} userId ユーザーID
   * @param {number} month 月
   * @param {number} date 日
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<BirthdayFor235Member>}
   */
  static async registNew235MemberBirthday(
    userName: string,
    userId: string,
    month: number,
    date: number,
    transaction: Transaction | null = null,
  ) {
    const insertData = {
      name: userName,
      user_id: userId,
      month,
      date,
    };

    if (transaction) {
      return db.BirthdayFor235Member.create(insertData, { transaction });
    }

    return db.BirthdayFor235Member.create(insertData);
  }

  /**
   * 235setvoiceコマンドを使った235プロダクションメンバーの speaker_id を更新
   *
   * @param {string} userId メンバーのユーザーID
   * @param {number} speakerId セットするVOICEVOXの speaker_id
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   */
  static async setSpeakerId(
    userId: string,
    speakerId: number,
    transaction: Transaction | null = null,
  ) {
    const updateData: { where: { user_id: string }; transaction?: Transaction } = {
      where: {
        user_id: userId,
      },
    };

    if (transaction) {
      updateData.transaction = transaction;
    }

    await db.BirthdayFor235Member.update({ speaker_id: speakerId }, updateData);
  }

  /**
   * 指定された235プロダクションメンバーの誕生日を削除
   *
   * @param {string} userId メンバーのユーザーID
   * @param {Transaction | null} transaction ユニットテストをする時に指定
   *
   * @return {Promise<number>}
   */
  static async delete235MemberBirthday(userId: string, transaction: Transaction | null = null) {
    const deleteData: { where: { user_id: string }; transaction?: Transaction } = {
      where: {
        user_id: userId,
      },
    };

    if (transaction) {
      deleteData.transaction = transaction;
    }

    return db.BirthdayFor235Member.destroy(deleteData);
  }
}
