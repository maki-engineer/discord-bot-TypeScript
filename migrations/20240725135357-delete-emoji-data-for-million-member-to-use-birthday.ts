/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('emoji_data_for_million_member_to_use_birthday');
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('emoji_data_for_million_member_to_use_birthday', {
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      emoji: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      }
    });
  }
};
