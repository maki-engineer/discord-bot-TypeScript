/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('birthday_for_235_members', 'created_at');
    await queryInterface.removeColumn('birthday_for_235_members', 'updated_at');
  },

  down: async (queryInterface: any, Sequelize: any) => {
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
