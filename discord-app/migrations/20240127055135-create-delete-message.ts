/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('delete_messages', {
      message_id: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      date: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('delete_messages');
  }
};
