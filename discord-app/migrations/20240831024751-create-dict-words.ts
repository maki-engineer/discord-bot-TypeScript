/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('dict_words', {
      word: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      how_to_read: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    });
  },

  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('dict_words');
  }
};
