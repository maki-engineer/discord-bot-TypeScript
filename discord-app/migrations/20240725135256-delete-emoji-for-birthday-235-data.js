'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable('emoji_for_birthday_235_data');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.createTable('emoji_for_birthday_235_data', {
      count: {
        allowNull: false,
        type: Sequelize.INTEGER
      }
    });
  }
};
