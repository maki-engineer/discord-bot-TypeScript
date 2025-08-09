const { Sequelize, Model, DataTypes } = require('sequelize');

export default class BirthdayForMillionMember extends Model {
  public name!: string;

  public user_id!: string;

  public month!: number;

  public date!: number;

  public speaker_id!: number;

  static initialize(sequelize: typeof Sequelize) {
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
        speaker_id: {
          type: DataTypes.INTEGER,
          defaultValue: 62,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'BirthdayFor235Member',
        tableName: 'birthday_for_235_members',
        timestamps: false,
      },
    );

    this.removeAttribute('id');

    return this;
  }
}
