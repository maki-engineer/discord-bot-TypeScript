'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable('emoji_data_for_million_member_to_use_birthday');
  },

  async down (queryInterface, Sequelize) {
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
