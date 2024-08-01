/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('emoji_for_birthday_million_idol_data', {
      emoji_name: {
        allowNull: false,
        type: Sequelize.STRING
      }
    });
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('emoji_for_birthday_million_idol_data');
  }
};
