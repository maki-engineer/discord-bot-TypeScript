process.env.NODE_ENV = 'unittest';

var { Command, sequelize } = require('../../../models/index');


describe('正常系（Command.getCommandList）', (): void => {
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

  test('commandsテーブルにデータが入っていた場合は、配列で一覧が返ること', async (): Promise < void > => {
    const targetData: { name: string; description: string; }[] = [
      {name: '235ap', description: 'これはこういうことするコマンドです。'},
      {name: '235apall', description: 'これは特別なコマンドです。'},
    ];

    await Command.bulkCreate(targetData, {transaction: transaction});

    const result: { name: string; description: string }[] = await Command.getCommandList(transaction);

    expect(result).toHaveLength(targetData.length);
    expect(result).toEqual(targetData);
    expect(result[0]).toBeInstanceOf(Object);
    expect(result[0].name).toBe(targetData[0].name);
  });

  test('commandsテーブルに何もデータが入ってなかった場合は、空配列が返ること', async (): Promise < void > => {
    const result: { name: string; description: string }[] = await Command.getCommandList(transaction);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});
