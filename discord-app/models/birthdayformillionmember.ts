const { Sequelize, Model, DataTypes } = require('sequelize');

export default class BirthdayForMillionMember extends Model {
  public name!: string;

  public month!: number;

  public date!: number;

  public img!: string;

  /**
     * ミリオンメンバーの中で当日誕生日の人を取得
     *
     * @param {number} month 月
     * @param {number} date 日
     * @param {any} transaction ユニットテストをする時に指定
     *
     * @return {object}
     */
  static async getMillionMemberBirthdayList(month: number, date: number, transaction = null) {
    const options: {
      where: { month: number, date: number },
      raw: boolean,
      transaction?: any,
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

    return await this.findAll(options);
  }

  public static initialize(sequelize: typeof Sequelize) {
    this.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
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
        img: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        modelName: 'BirthdayForMillionMember',
        tableName: 'birthday_for_million_members',
        timestamps: false,
      },
    );

    this.removeAttribute('id');

    return this;
  }
}
