'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.dropTable('divided_members');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.createTable('divided_members', {
      user_id: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      }
    });
  }
};
