process.env.NODE_ENV = 'unittest';

var { Command, sequelize } = require('../../../models/index');


describe('正常系（Command.insertNewCommand）', (): void => {
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

    test('指定されたコマンド名とコマンド名の詳細が正常に commands テーブルに追加された場合は、オブジェクトが返ること', async (): Promise < void > => {
      const newCommandName: string = '235test';
      const newDescription: string = 'これはこういうことをするコマンドです。';

      let commandData: [] | { name: string; description: string }[] = await Command.findAll({
        raw: true,
        transaction: transaction
      });

      expect(commandData).toHaveLength(0);

      const result: { name: string; description: string } = await Command.insertNewCommand(
        newCommandName,
        newDescription,
        transaction
      );

      commandData = await Command.findAll({
        raw: true,
        transaction: transaction
      });

      expect(commandData).toHaveLength(1);
      expect(result).toBeInstanceOf(Object);
      expect(commandData[0].name).toBe(result.name);
      expect(commandData[0].description).toBe(result.description);
    });
  });
