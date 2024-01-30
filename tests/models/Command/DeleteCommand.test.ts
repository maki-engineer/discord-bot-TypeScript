process.env.NODE_ENV = 'unittest';

var { Command, sequelize } = require('../../../models/index');


describe('正常系（Command.deleteCommand）', (): void => {
    let transaction: any;
  
    beforeEach(async (): Promise < void > => {
      transaction = await sequelize.transaction();
    });
  
    afterEach(async (): Promise < void > => {
      if (transaction) {
        await transaction.rollback();
      }
    });
  
    afterAll(async (): Promise < void > => {
      await sequelize.close();
    });

    test('指定されたコマンドが commands テーブルから正常に削除された場合、削除された数が返ること', async (): Promise < void > => {
      const deleteCommandName: string = '235apremove';
      const deleteDescription: string = 'これは指定された曲をAPリストから削除するためのコマンドです。';

      await Command.create({
        name: deleteCommandName,
        description: deleteDescription
      }, {transaction: transaction});
      
      let commandData: { name: string; description: string }[] | [] = await Command.findAll({
        raw: true,
        transaction: transaction
      });

      const deleteDataExists: { name: string; description: string } = await Command.findOne({
        where: {
          name: deleteCommandName,
          description: deleteDescription
        },
        raw: true,
        transaction: transaction
      });

      expect(commandData).toHaveLength(1);
      expect(deleteDataExists.name).toBe(deleteCommandName);
      expect(deleteDataExists.description).toBe(deleteDescription);

      const result: number = await Command.deleteCommand(
        deleteCommandName,
        deleteDescription,
        transaction
      );

      commandData = await Command.findAll({
        raw: true,
        transaction: transaction
      });

      const deleteDataNotExists: null = await Command.findOne({
        where: {
          name: deleteCommandName,
          description: deleteDescription
        },
        raw: true,
        transaction: transaction
      });

      expect(commandData).toHaveLength(0);
      expect(deleteDataNotExists).toBeNull();
      expect(result).toBe(1);
    });
  });
