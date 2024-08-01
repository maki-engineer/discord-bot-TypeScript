const { Sequelize, Model, DataTypes } = require('sequelize');

export default class BirthdayForMillionMember extends Model {
  public name!: string;

  public user_id!: string;

  public month!: number;

  public date!: number;

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
  static async get235MemberBirthdayList(
    userId: string,
    month: number,
    date: number,
    transaction = null,
  ) {
    const options: {
      where: { user_id: { [x: number]: string }, month: number, date: number },
      raw: boolean,
      transaction?: any,
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
  static async getThisMonthBirthdayMember(month: number, transaction = null) {
    const options: {
      where: {},
      order: [string[], string[]],
      raw: boolean,
      transaction?: any,
    } = {
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
    const options: {
      attributes: string[],
      order: [string[], string[]],
      raw: boolean,
      transaction?: any,
    } = {
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
  static async delete235MemberBirthday(userId: string, transaction = null) {
    const deleteData: { where: { user_id: string }, transaction?: any } = {
      where: {
        user_id: userId,
      },
    };

    if (transaction !== null) {
      deleteData.transaction = transaction;
    }

    return await this.destroy(deleteData);
  }

  public static initialize(sequelize: typeof Sequelize) {
    this.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: '',
          unique: true,
        },
        month: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            max: 12,
            min: 1,
          },
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
        modelName: 'BirthdayFor235Member',
        tableName: 'birthday_for_235_members',
        timestamps: false,
      },
    );

    return this;
  }
}
