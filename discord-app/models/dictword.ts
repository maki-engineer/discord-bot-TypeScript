import { Sequelize, Model, DataTypes } from 'sequelize';

export default class DictWord extends Model {
  public word!: string;

  public how_to_read!: string;

  static initialize(sequelize: Sequelize) {
    this.init(
      {
        word: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        how_to_read: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'DictWord',
        tableName: 'dict_words',
        timestamps: false,
      },
    );

    this.removeAttribute('id');

    return this;
  }
}
