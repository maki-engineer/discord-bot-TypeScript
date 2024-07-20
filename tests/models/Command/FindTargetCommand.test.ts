process.env.NODE_ENV = 'unittest';

var { Command, sequelize } = require('../../../models/index');


describe('正常系（Command.findTargetCommand）', (): void => {
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

  test('指定されたコマンドが見つかった場合はオブジェクトが返ること', async (): Promise < void > => {
    const commnadExists = '235test';

    await Command.create({
      name: commnadExists,
      description: 'これはこういうことをするコマンドです。'
    }, {transaction});

    const result: { name: string; description: string } = await Command.findTargetCommand(commnadExists, transaction);

    expect(result).toBeInstanceOf(Object);
    expect(result.name).toBe(commnadExists);
  });

  test('指定されたコマンドが見つからなかった場合は null が返ること', async (): Promise < void > => {
    const commandNotExists: string = '235test';

    const result: null = await Command.findTargetCommand(commandNotExists, transaction);

    expect(result).toBeNull();
  });
});
