'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('birthday_for_million_members', {
      name: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      month: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: {
          max: 12,
          min: 1
        },
      },
      date: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: {
          max: 31,
          min: 1
        },
      },
      img: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('birthday_for_million_members');
  }
};