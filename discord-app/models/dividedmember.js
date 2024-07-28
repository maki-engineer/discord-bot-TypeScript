const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DividedMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }

  DividedMember.init({
    user_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'DividedMember',
    timestamps: false,
    underscored: true,
  });

  DividedMember.removeAttribute('id');

  return DividedMember;
};
