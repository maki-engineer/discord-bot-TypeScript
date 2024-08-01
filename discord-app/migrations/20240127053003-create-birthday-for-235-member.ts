/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.createTable('birthday_for_235_members', {
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      user_id: {
        allowNull: false,
        unique: true,
        defaultValue: '',
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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface: any, Sequelize: any) => {
    await queryInterface.dropTable('birtuday_for_235_members');
  }
};
