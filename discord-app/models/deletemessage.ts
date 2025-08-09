const { Sequelize, Model, DataTypes } = require('sequelize');

export default class DeleteMessage extends Model {
  public message_id!: string;

  public date!: number;

  static initialize(sequelize: typeof Sequelize) {
    this.init(
      {
        message_id: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
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
        modelName: 'DeleteMessage',
        tableName: 'delete_messages',
        timestamps: false,
      },
    );

    this.removeAttribute('id');

    return this;
  }
}
