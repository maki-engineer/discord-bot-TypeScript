/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('emoji_for_birthday_235_data');
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('emoji_for_birthday_235_data', {
      count: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  }
};
