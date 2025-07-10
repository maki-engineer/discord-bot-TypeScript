const { Sequelize, Model, DataTypes } = require('sequelize');

export default class BirthdayForMillionMember extends Model {
  public name!: string;

  public month!: number;

  public date!: number;

  public img!: string;

  static initialize(sequelize: typeof Sequelize) {
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
