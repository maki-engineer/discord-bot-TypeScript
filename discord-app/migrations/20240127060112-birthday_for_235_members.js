'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('birthday_for_235_members', 'created_at');
    await queryInterface.removeColumn('birthday_for_235_members', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('birthday_for_235_members', 'created_at');
    await queryInterface.addColumn('birthday_for_235_members', 'updated_at');
  }
};
