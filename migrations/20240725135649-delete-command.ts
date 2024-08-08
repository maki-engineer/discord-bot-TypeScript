/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('commands');
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('commands', {
      name: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      description: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      }
    });
  }
};
