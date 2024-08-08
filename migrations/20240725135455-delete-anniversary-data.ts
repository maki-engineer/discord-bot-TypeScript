/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('anniversary_data');
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('anniversary_data', {
      name: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      year: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      month: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  }
};
