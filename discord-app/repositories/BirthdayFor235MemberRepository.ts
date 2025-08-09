const { Sequelize } = require('sequelize');
const { BirthdayFor235Member } = require('../models/index').default;

export default class BirthdayFor235MemberRepository {
  /**
   * 235プロダクションメンバーの中で当日誕生日の人を取得
   *
   * @param {string} userId ユーザーID
   * @param {number} month 月
   * @param {number} date 日
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async get235MemberBirthdayList(
    userId: string,
    month: number,
    date: number,
    transaction = null,
  ) {
    const options: {
      where: { user_id: { [x: number]: string }; month: number; date: number };
      raw: boolean;
      transaction?: any;
    } = {
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

    return await BirthdayFor235Member.findAll(options);
  }

  /**
   * 今月誕生日の235プロダクションメンバーを昇順で取得
   *
   * @param {number} month 月
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async getThisMonthBirthdayMember(month: number, transaction = null) {
    const options: {
      where: { month: number };
      order: [string[], string[]];
      raw: boolean;
      transaction?: any;
    } = {
      where: {
        month,
      },
      order: [['month'], ['date']],
      raw: true,
    };

    if (transaction !== null) {
      options.transaction = transaction;
    }

    return await BirthdayFor235Member.findAll(options);
  }

  /**
   * CSVファイルに出力するための235メンバーの誕生日リストを取得
   *
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {object}
   */
  static async get235MemberBirthdayListForCSV(transaction = null) {
    const options: {
      attributes: string[];
      order: [string[], string[]];
      raw: boolean;
      transaction?: any;
    } = {
      attributes: ['name', 'month', 'date'],
      order: [['month'], ['date']],
      raw: true,
    };

    if (transaction !== null) {
      options.transaction = transaction;
    }

    return await BirthdayFor235Member.findAll(options);
  }

  /**
   * テキストを読み上げる対象のチャンネルにテキストを入力した235プロダクションメンバーの speaker_id を取得
   *
   * @param {string} userId メンバーのユーザーID
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @param {string | null}
   */
  static async getSpeakerIdFromMessageSender(userId: string, transaction = null) {
    const options: {
      where: { user_id: string };
      transaction?: any;
    } = {
      where: { user_id: userId },
    };

    if (transaction !== null) {
      options.transaction = transaction;
    }

    const foundData = await BirthdayFor235Member.findOne(options);

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
   * @param {any | null} transaction ユニットテストをする時に指定
   */
  static async registNew235MemberBirthday(
    userName: string,
    userId: string,
    month: number,
    date: number,
    transaction = null,
  ) {
    const insertData = {
      name: userName,
      user_id: userId,
      month,
      date,
    };

    if (transaction !== null) {
      return await BirthdayFor235Member.create(insertData, { transaction });
    }

    return await BirthdayFor235Member.create(insertData);
  }

  /**
   * 235setvoiceコマンドを使った235プロダクションメンバーの speaker_id を更新
   *
   * @param {string} userId メンバーのユーザーID
   * @param {number} speakerId セットするVOICEVOXの speaker_id
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {void}
   */
  static async setSpeakerId(userId: string, speakerId: number, transaction = null) {
    const updateData: { where: { user_id: string }; transaction?: any } = {
      where: {
        user_id: userId,
      },
    };

    if (transaction !== null) {
      updateData.transaction = transaction;
    }

    await BirthdayFor235Member.update({ speaker_id: speakerId }, updateData);
  }

  /**
   * 指定された235プロダクションメンバーの誕生日を削除
   *
   * @param {string} userId メンバーのユーザーID
   * @param {any | null} transaction ユニットテストをする時に指定
   *
   * @return {number}
   */
  static async delete235MemberBirthday(userId: string, transaction = null) {
    const deleteData: { where: { user_id: string }; transaction?: any } = {
      where: {
        user_id: userId,
      },
    };

    if (transaction !== null) {
      deleteData.transaction = transaction;
    }

    return await BirthdayFor235Member.destroy(deleteData);
  }
}
